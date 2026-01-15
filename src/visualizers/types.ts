import type { Renderer } from '../renderer/Renderer';

/**
 * Available visualizer types
 */
export type VisualizerType = 'equalizer' | 'waveform' | 'circular';

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
