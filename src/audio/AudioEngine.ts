import type { AudioState, AudioEngineCallbacks } from './types';
import { SUPPORTED_AUDIO_TYPES, SUPPORTED_AUDIO_EXTENSIONS } from './types';

/**
 * AudioEngine - Web Audio API wrapper for loading and controlling audio playback
 *
 * Handles:
 * - Lazy AudioContext creation (to comply with autoplay policies)
 * - Audio file loading and decoding
 * - Play/pause/seek controls
 * - Accurate time tracking
 * - State management and callbacks
 */
export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private audioBuffer: AudioBuffer | null = null;

  private state: AudioState = 'idle';
  private startTime = 0;
  private pauseOffset = 0;
  private animationFrameId: number | null = null;

  private callbacks: AudioEngineCallbacks;

  constructor(callbacks: AudioEngineCallbacks = {}) {
    this.callbacks = callbacks;
  }

  /**
   * Initialize AudioContext lazily on first user interaction
   */
  private initAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();

      // Create AnalyserNode for frequency analysis
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048; // Good balance of frequency resolution and performance
      this.analyserNode.smoothingTimeConstant = 0.8; // Smooth transitions, reduce jitter

      // Create GainNode for volume control
      this.gainNode = this.audioContext.createGain();

      // Route: source → analyser → gain → destination
      this.analyserNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
    }
    return this.audioContext;
  }

  /**
   * Get the AnalyserNode for frequency analysis
   */
  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  /**
   * Validate that the file is a supported audio type
   */
  private validateFile(file: File): boolean {
    // Check MIME type
    if (SUPPORTED_AUDIO_TYPES.includes(file.type as typeof SUPPORTED_AUDIO_TYPES[number])) {
      return true;
    }

    // Fallback to extension check
    const fileName = file.name.toLowerCase();
    return SUPPORTED_AUDIO_EXTENSIONS.some(ext => fileName.endsWith(ext));
  }

  /**
   * Update state and notify callback
   */
  private setState(newState: AudioState): void {
    this.state = newState;
    this.callbacks.onStateChange?.(newState);
  }

  /**
   * Start the time update animation loop
   */
  private startTimeUpdateLoop(): void {
    const updateTime = () => {
      if (this.state === 'playing') {
        const currentTime = this.getCurrentTime();
        this.callbacks.onTimeUpdate?.(currentTime);
        this.animationFrameId = requestAnimationFrame(updateTime);
      }
    };
    this.animationFrameId = requestAnimationFrame(updateTime);
  }

  /**
   * Stop the time update animation loop
   */
  private stopTimeUpdateLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Load an audio file and decode it
   */
  async loadFile(file: File): Promise<void> {
    // Validate file type
    if (!this.validateFile(file)) {
      const error = new Error(`Unsupported file type. Please use MP3 or WAV files.`);
      this.callbacks.onError?.(error);
      throw error;
    }

    this.setState('loading');

    try {
      // Initialize AudioContext on user gesture
      const context = this.initAudioContext();

      // Resume context if suspended (browser autoplay policy)
      if (context.state === 'suspended') {
        await context.resume();
      }

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Decode audio data
      this.audioBuffer = await context.decodeAudioData(arrayBuffer);

      // Reset playback position
      this.pauseOffset = 0;

      this.setState('ready');
    } catch (err) {
      this.setState('idle');
      const error = err instanceof Error ? err : new Error('Failed to load audio file');
      this.callbacks.onError?.(error);
      throw error;
    }
  }

  /**
   * Start or resume playback
   */
  play(): void {
    if (!this.audioBuffer || !this.audioContext || !this.gainNode || !this.analyserNode) {
      return;
    }

    // Stop any existing source
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    // Create new source node (source nodes are single-use)
    // Route: source → analyser → gain → destination
    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.connect(this.analyserNode);

    // Handle playback end
    this.sourceNode.onended = () => {
      if (this.state === 'playing') {
        // Check if we reached the end naturally
        const currentTime = this.getCurrentTime();
        if (currentTime >= this.audioBuffer!.duration - 0.1) {
          this.pauseOffset = 0;
          this.setState('ready');
          this.stopTimeUpdateLoop();
          this.callbacks.onTimeUpdate?.(0);
        }
      }
    };

    // Start playback from pauseOffset
    this.startTime = this.audioContext.currentTime - this.pauseOffset;
    this.sourceNode.start(0, this.pauseOffset);

    this.setState('playing');
    this.startTimeUpdateLoop();
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (this.state !== 'playing' || !this.sourceNode) {
      return;
    }

    // Save current position
    this.pauseOffset = this.getCurrentTime();

    // Stop source
    this.sourceNode.stop();
    this.sourceNode.disconnect();
    this.sourceNode = null;

    this.stopTimeUpdateLoop();
    this.setState('paused');
  }

  /**
   * Seek to a specific time position
   */
  seek(time: number): void {
    if (!this.audioBuffer) {
      return;
    }

    // Clamp time to valid range
    const clampedTime = Math.max(0, Math.min(time, this.audioBuffer.duration));

    if (this.state === 'playing') {
      // Stop current playback
      if (this.sourceNode) {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }

      // Update offset and restart
      this.pauseOffset = clampedTime;
      this.play();
    } else {
      // Just update the offset
      this.pauseOffset = clampedTime;
      this.callbacks.onTimeUpdate?.(clampedTime);
    }
  }

  /**
   * Get current playback time in seconds
   */
  getCurrentTime(): number {
    if (!this.audioContext || !this.audioBuffer) {
      return 0;
    }

    if (this.state === 'playing') {
      const elapsed = this.audioContext.currentTime - this.startTime;
      return Math.min(elapsed, this.audioBuffer.duration);
    }

    return this.pauseOffset;
  }

  /**
   * Get total duration in seconds
   */
  getDuration(): number {
    return this.audioBuffer?.duration ?? 0;
  }

  /**
   * Get current audio state
   */
  getState(): AudioState {
    return this.state;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopTimeUpdateLoop();

    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.audioBuffer = null;
    this.setState('idle');
  }
}
