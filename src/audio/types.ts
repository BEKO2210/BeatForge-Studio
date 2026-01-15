/**
 * Audio state machine states
 */
export type AudioState = 'idle' | 'loading' | 'ready' | 'playing' | 'paused';

/**
 * Callbacks for AudioEngine state changes and updates
 */
export interface AudioEngineCallbacks {
  /** Called when audio state changes */
  onStateChange?: (state: AudioState) => void;
  /** Called on each animation frame during playback with current time */
  onTimeUpdate?: (currentTime: number) => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Supported audio file MIME types
 */
export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
] as const;

/**
 * Supported audio file extensions
 */
export const SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.wav'] as const;
