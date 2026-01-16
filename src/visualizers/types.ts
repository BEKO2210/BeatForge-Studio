import type { Renderer } from '../renderer/Renderer';

/**
 * Available visualizer types
 */
export type VisualizerType = 'equalizer' | 'equalizer-v2' | 'waveform' | 'circular';

/**
 * Settings for Circular visualizer
 */
export interface CircularSettings {
  /** Ring gap - 0 = closed ring, 1 = max gap (default: 0) */
  ringGap: number;
  /** Bar spread - how wide each bar is (0.5-2, default: 1) */
  barSpread: number;
  /** Sensitivity - overall response to audio (0-1, default: 0.5) */
  sensitivity: number;
  /** Rotation speed multiplier (-2 to 2, default: 1) */
  rotationSpeed: number;
  /** Start angle in degrees (0-360, default: 0) */
  startAngle: number;
  /** Energy spread mode: 'linear' or 'log' (default: 'linear') */
  energySpread: 'linear' | 'log';
}

/**
 * Settings for Club (Equalizer V2) visualizer
 */
export interface ClubSettings {
  /** Bass gain - boost for low frequencies (0-2, default: 1) */
  bassGain: number;
  /** Global sensitivity (0-1, default: 0.5) */
  sensitivity: number;
  /** Vertical scale - height multiplier (0.5-1.5, default: 1) */
  verticalScale: number;
  /** Decay speed - how fast bars fall (0-1, default: 0.5) */
  decay: number;
}

/** Default circular settings */
export const DEFAULT_CIRCULAR_SETTINGS: CircularSettings = {
  ringGap: 0,
  barSpread: 1,
  sensitivity: 0.5,
  rotationSpeed: 1,
  startAngle: 0,
  energySpread: 'linear',
};

/** Default club settings */
export const DEFAULT_CLUB_SETTINGS: ClubSettings = {
  bassGain: 1,
  sensitivity: 0.5,
  verticalScale: 1,
  decay: 0.5,
};

/**
 * Props passed to all visualizer components
 */
export interface VisualizerProps {
  /** Canvas renderer instance (null during initialization) */
  renderer: Renderer | null;
  /** Normalized frequency data (0-1 range, null when no audio) */
  frequencyData: Float32Array | null;
  /** Normalized time domain waveform data (-1 to 1 range, null when no audio) */
  timeDomainData: Float32Array | null;
  /** Whether a beat was detected this frame */
  isBeat: boolean;
  /** Beat intensity (0-1, higher = stronger beat) */
  beatIntensity: number;
  /** Canvas logical width in pixels */
  width: number;
  /** Canvas logical height in pixels */
  height: number;
  /** Circular visualizer settings */
  circularSettings?: CircularSettings;
  /** Club visualizer settings */
  clubSettings?: ClubSettings;
}

/**
 * Configuration for visualizer appearance
 */
export interface VisualizerConfig {
  /** Type of visualizer to render */
  type: VisualizerType;
  /** Primary color (CSS color string) */
  color?: string;
  /** Number of bars for equalizer visualizer (default: 64) */
  barCount?: number;
  /** Line thickness for waveform/circular visualizers (default: 2) */
  lineWidth?: number;
}
