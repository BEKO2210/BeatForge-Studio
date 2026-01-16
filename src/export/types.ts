/**
 * Export state machine states
 */
export type ExportState = 'idle' | 'preparing' | 'recording' | 'encoding' | 'complete' | 'error';

/**
 * Resolution configuration for video export
 */
export interface ExportResolution {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

/**
 * Available export resolutions
 */
export const EXPORT_RESOLUTIONS: readonly ExportResolution[] = [
  { id: '720p', label: '720p (HD)', width: 1280, height: 720 },
  { id: '1080p', label: '1080p (Full HD)', width: 1920, height: 1080 },
] as const;

/**
 * Options for video export
 */
export interface ExportOptions {
  /** Target resolution */
  resolution: ExportResolution;
  /** Frame rate (default: 30) */
  frameRate?: number;
}

/**
 * Export progress information
 */
export interface ExportProgress {
  /** Current export state */
  state: ExportState;
  /** Progress 0-1 */
  progress: number;
  /** Error message if state is 'error' */
  error?: string;
}

/**
 * Callbacks for export events
 */
export interface ExportCallbacks {
  /** Called on progress updates */
  onProgress?: (progress: ExportProgress) => void;
  /** Called when export completes with video blob */
  onComplete?: (blob: Blob) => void;
}
