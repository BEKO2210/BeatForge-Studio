import type { AudioEngine } from '../audio/AudioEngine';
import type { ExportState, ExportOptions, ExportCallbacks, ExportProgress } from './types';

/**
 * VideoExporter - Orchestrates canvas + audio recording to WebM video
 *
 * Uses MediaRecorder to capture:
 * - Canvas visuals via captureStream()
 * - Audio via AudioEngine's MediaStreamAudioDestinationNode
 *
 * Produces WebM (VP9/Opus) video blob.
 */
export class VideoExporter {
  private canvas: HTMLCanvasElement;
  private audioEngine: AudioEngine;
  private callbacks: ExportCallbacks;

  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private state: ExportState = 'idle';
  private duration = 0;
  private progressIntervalId: number | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    audioEngine: AudioEngine,
    callbacks: ExportCallbacks = {}
  ) {
    this.canvas = canvas;
    this.audioEngine = audioEngine;
    this.callbacks = callbacks;
  }

  /**
   * Get current export state
   */
  getState(): ExportState {
    return this.state;
  }

  /**
   * Start recording the canvas and audio
   */
  async start(options: ExportOptions): Promise<void> {
    try {
      // Validate prerequisites
      if (!this.canvas) {
        throw new Error('Canvas not available');
      }

      this.duration = this.audioEngine.getDuration();
      if (this.duration <= 0) {
        throw new Error('No audio loaded');
      }

      // Preparing phase
      this.setState('preparing');
      this.recordedChunks = [];

      // Get video stream from canvas
      const frameRate = options.frameRate ?? 30;
      const videoStream = this.canvas.captureStream(frameRate);

      // Get audio stream from audio engine
      const audioStream = this.audioEngine.createExportDestination();

      // Combine video and audio tracks into single stream
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      // Create MediaRecorder with WebM format
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 5000000, // 5 Mbps for good quality
      });

      // Handle data chunks
      this.mediaRecorder.ondataavailable = (event) => {
        this.handleDataAvailable(event);
      };

      // Handle recording stop
      this.mediaRecorder.onstop = () => {
        this.handleStop();
      };

      // Handle errors
      this.mediaRecorder.onerror = (event) => {
        this.setState('error');
        this.emitProgress(`Recording error: ${event.type}`);
      };

      // Start recording (100ms chunks for smooth progress)
      this.setState('recording');
      this.mediaRecorder.start(100);

      // Start audio playback from beginning
      this.audioEngine.seek(0);
      this.audioEngine.play();

      // Start progress updates
      this.startProgressUpdates();

      // Set up auto-stop when audio ends
      this.setupAutoStop();
    } catch (err) {
      this.setState('error');
      const message = err instanceof Error ? err.message : 'Export failed';
      this.emitProgress(message);
      this.cleanup();
      throw err;
    }
  }

  /**
   * Stop recording
   */
  stop(): void {
    if (this.mediaRecorder && this.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.audioEngine.pause();
    this.stopProgressUpdates();
  }

  /**
   * Get supported MIME type for MediaRecorder
   */
  private getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm';
  }

  /**
   * Handle incoming data chunks
   */
  private handleDataAvailable(event: BlobEvent): void {
    if (event.data.size > 0) {
      this.recordedChunks.push(event.data);
    }
  }

  /**
   * Handle recording complete
   */
  private handleStop(): void {
    this.stopProgressUpdates();
    this.setState('encoding');
    this.emitProgress();

    // Create final blob from chunks
    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });

    // Clean up audio routing
    this.audioEngine.disconnectExportDestination();

    this.setState('complete');
    this.emitProgress();

    // Notify callback with completed video
    this.callbacks.onComplete?.(blob);
  }

  /**
   * Set state and emit progress
   */
  private setState(state: ExportState): void {
    this.state = state;
  }

  /**
   * Emit progress to callback
   */
  private emitProgress(error?: string): void {
    const currentTime = this.audioEngine.getCurrentTime();
    const progress = this.duration > 0 ? Math.min(currentTime / this.duration, 1) : 0;

    const progressInfo: ExportProgress = {
      state: this.state,
      progress: this.state === 'complete' ? 1 : progress,
      error,
    };

    this.callbacks.onProgress?.(progressInfo);
  }

  /**
   * Start periodic progress updates during recording
   */
  private startProgressUpdates(): void {
    this.progressIntervalId = window.setInterval(() => {
      if (this.state === 'recording') {
        this.emitProgress();
      }
    }, 100);
  }

  /**
   * Stop progress updates
   */
  private stopProgressUpdates(): void {
    if (this.progressIntervalId !== null) {
      clearInterval(this.progressIntervalId);
      this.progressIntervalId = null;
    }
  }

  /**
   * Set up auto-stop when audio playback ends
   */
  private setupAutoStop(): void {
    const checkEnd = () => {
      if (this.state !== 'recording') return;

      const currentTime = this.audioEngine.getCurrentTime();
      const audioState = this.audioEngine.getState();

      // Stop if audio finished or went back to ready/idle
      if (currentTime >= this.duration - 0.1 || audioState === 'ready' || audioState === 'idle') {
        this.stop();
      } else {
        requestAnimationFrame(checkEnd);
      }
    };

    requestAnimationFrame(checkEnd);
  }

  /**
   * Clean up resources on error
   */
  private cleanup(): void {
    this.stopProgressUpdates();
    this.audioEngine.disconnectExportDestination();
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }
}
