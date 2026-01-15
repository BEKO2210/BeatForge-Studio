import type { FrequencyBands, BeatInfo, BeatCallback } from './types';

/**
 * BeatDetector - Analyzes audio frequency data for beat detection
 *
 * Uses energy-based beat detection algorithm:
 * 1. Analyzes frequency data from AnalyserNode
 * 2. Compares current bass energy to rolling average
 * 3. Detects beats when energy exceeds threshold
 *
 * Frequency band calculations (fftSize 2048, sampleRate 44100):
 * - Bass: bins 0-10 (~20-250Hz)
 * - Mid: bins 10-93 (~250-2000Hz)
 * - Treble: bins 93-512 (~2000-20000Hz)
 */
export class BeatDetector {
  private analyser: AnalyserNode;
  private frequencyData: Uint8Array<ArrayBuffer>;
  private lastBeatTime: number = 0;
  private energyHistory: number[] = [];

  // Detection parameters
  private readonly historySize = 43; // ~700ms at 60fps
  private readonly beatThreshold = 1.3; // Energy must be 1.3x average
  private readonly beatCooldown = 100; // Min ms between beats

  // Frequency bin ranges (calculated for fftSize 2048, sampleRate 44100)
  // binIndex = (frequency * fftSize) / sampleRate
  private readonly bassEnd = 10; // ~250Hz
  private readonly midEnd = 93; // ~2000Hz
  private readonly frequencyBinCount: number;

  // Beat callbacks
  private beatCallbacks: Set<BeatCallback> = new Set();

  constructor(analyserNode: AnalyserNode) {
    this.analyser = analyserNode;
    this.frequencyBinCount = analyserNode.frequencyBinCount;
    this.frequencyData = new Uint8Array(this.frequencyBinCount);
  }

  /**
   * Calculate average energy for a range of frequency bins
   */
  private calculateBandEnergy(startBin: number, endBin: number): number {
    let sum = 0;
    const clampedEnd = Math.min(endBin, this.frequencyBinCount);
    const count = clampedEnd - startBin;

    if (count <= 0) return 0;

    for (let i = startBin; i < clampedEnd; i++) {
      const value = this.frequencyData[i];
      if (value !== undefined) {
        sum += value;
      }
    }

    // Normalize to 0-1 range (Uint8Array values are 0-255)
    return sum / (count * 255);
  }

  /**
   * Get current frequency bands (call each frame)
   */
  getFrequencyBands(): FrequencyBands {
    // Get current frequency data
    this.analyser.getByteFrequencyData(this.frequencyData);

    const bass = this.calculateBandEnergy(0, this.bassEnd);
    const mid = this.calculateBandEnergy(this.bassEnd, this.midEnd);
    const treble = this.calculateBandEnergy(this.midEnd, this.frequencyBinCount);
    const overall = (bass + mid + treble) / 3;

    return { bass, mid, treble, overall };
  }

  /**
   * Get full beat info including beat detection (call each frame)
   */
  getBeatInfo(): BeatInfo {
    const frequencyBands = this.getFrequencyBands();
    const currentTime = performance.now();
    const timeSinceLastBeat = currentTime - this.lastBeatTime;

    // Bass is primary beat indicator
    const currentEnergy = frequencyBands.bass;

    // Add to history
    this.energyHistory.push(currentEnergy);
    if (this.energyHistory.length > this.historySize) {
      this.energyHistory.shift();
    }

    // Calculate average energy from history
    let averageEnergy = 0;
    if (this.energyHistory.length > 0) {
      for (const energy of this.energyHistory) {
        averageEnergy += energy;
      }
      averageEnergy /= this.energyHistory.length;
    }

    // Detect beat: current energy exceeds threshold AND cooldown passed
    const isBeat =
      currentEnergy > averageEnergy * this.beatThreshold &&
      timeSinceLastBeat > this.beatCooldown &&
      averageEnergy > 0.01; // Require minimum energy to avoid false positives in silence

    // Calculate intensity (how much energy exceeds average)
    let intensity = 0;
    if (isBeat && averageEnergy > 0) {
      intensity = Math.min(1, (currentEnergy - averageEnergy) / averageEnergy);
    }

    if (isBeat) {
      this.lastBeatTime = currentTime;
    }

    const beatInfo: BeatInfo = {
      isBeat,
      intensity,
      frequencyBands,
      timeSinceLastBeat: isBeat ? 0 : timeSinceLastBeat,
    };

    // Notify callbacks on beat
    if (isBeat) {
      for (const callback of this.beatCallbacks) {
        callback(beatInfo);
      }
    }

    return beatInfo;
  }

  /**
   * Register callback for beat events
   * @returns Unsubscribe function
   */
  onBeat(callback: BeatCallback): () => void {
    this.beatCallbacks.add(callback);
    return () => {
      this.beatCallbacks.delete(callback);
    };
  }

  /**
   * Reset state (call when seeking or loading new track)
   */
  reset(): void {
    this.energyHistory = [];
    this.lastBeatTime = 0;
  }

  /**
   * Get normalized frequency data for visualizers
   * Returns values in 0-1 range (full frequency spectrum)
   * Note: Call getBeatInfo() or getFrequencyBands() first to populate frequencyData
   */
  getFrequencyData(): Float32Array {
    const normalized = new Float32Array(this.frequencyBinCount);
    for (let i = 0; i < this.frequencyBinCount; i++) {
      const value = this.frequencyData[i];
      normalized[i] = value !== undefined ? value / 255 : 0;
    }
    return normalized;
  }

  /**
   * Get normalized time domain (waveform) data for visualizers
   * Returns values in -1 to 1 range
   */
  getTimeDomainData(): Float32Array {
    const timeDomainData = new Uint8Array(this.frequencyBinCount);
    this.analyser.getByteTimeDomainData(timeDomainData);

    const normalized = new Float32Array(this.frequencyBinCount);
    for (let i = 0; i < this.frequencyBinCount; i++) {
      const value = timeDomainData[i];
      // Normalize from 0-255 to -1 to 1 range
      normalized[i] = value !== undefined ? (value - 128) / 128 : 0;
    }
    return normalized;
  }
}
