/**
 * Post-processing effects configuration types
 */

/** Camera shake effect configuration */
export interface CameraShakeConfig {
  /** Whether camera shake is enabled */
  enabled: boolean;
  /** Maximum pixel offset on strong beats (default: 8) */
  maxOffset: number;
  /** Decay duration in milliseconds (default: 100) */
  decayMs: number;
  /** Beat intensity threshold to trigger shake (default: 0.6) */
  threshold: number;
}

/** Vignette effect configuration */
export interface VignetteConfig {
  /** Whether vignette is enabled */
  enabled: boolean;
  /** Edge darkness intensity 0-1 (default: 0.35) */
  intensity: number;
  /** Gradient softness - where gradient starts (default: 0.5 = 50% from center) */
  softness: number;
}

/** Combined effects configuration */
export interface EffectsConfig {
  cameraShake: CameraShakeConfig;
  vignette: VignetteConfig;
}

/** Camera shake offset result */
export interface ShakeOffset {
  x: number;
  y: number;
}

/** Default camera shake configuration */
export const DEFAULT_CAMERA_SHAKE: CameraShakeConfig = {
  enabled: true,
  maxOffset: 8,
  decayMs: 100,
  threshold: 0.6,
};

/** Default vignette configuration */
export const DEFAULT_VIGNETTE: VignetteConfig = {
  enabled: true,
  intensity: 0.35,
  softness: 0.5,
};

/** Default combined effects configuration */
export const DEFAULT_EFFECTS: EffectsConfig = {
  cameraShake: DEFAULT_CAMERA_SHAKE,
  vignette: DEFAULT_VIGNETTE,
};
