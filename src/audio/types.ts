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
  /** Called each frame with beat analysis data */
  onBeatInfo?: (beatInfo: BeatInfo) => void;
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

/**
 * Frequency band energy levels (normalized 0-1)
 */
export interface FrequencyBands {
  /** Bass energy (20-250 Hz) - normalized 0-1 */
  bass: number;
  /** Mid-range energy (250-2000 Hz) - normalized 0-1 */
  mid: number;
  /** Treble energy (2000-20000 Hz) - normalized 0-1 */
  treble: number;
  /** Overall energy (average) - normalized 0-1 */
  overall: number;
}

/**
 * Beat detection information for current frame
 */
export interface BeatInfo {
  /** True if beat detected this frame */
  isBeat: boolean;
  /** Beat intensity 0-1 */
  intensity: number;
  /** Current frequency band levels */
  frequencyBands: FrequencyBands;
  /** Milliseconds since last beat */
  timeSinceLastBeat: number;
}

/**
 * Callback type for beat events
 */
export type BeatCallback = (beatInfo: BeatInfo) => void;
