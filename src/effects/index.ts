// Effects system - post-processing effects for visualizers
export { getCameraShakeOffset } from './cameraShake';
export { renderVignette } from './vignette';
export type {
  CameraShakeConfig,
  VignetteConfig,
  EffectsConfig,
  ShakeOffset,
} from './types';
export {
  DEFAULT_CAMERA_SHAKE,
  DEFAULT_VIGNETTE,
  DEFAULT_EFFECTS,
} from './types';
