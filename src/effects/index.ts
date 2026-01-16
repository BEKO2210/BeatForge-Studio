// Effects system - post-processing effects for visualizers
export { getCameraShakeOffset } from './cameraShake';
export { renderVignette } from './vignette';
export { ParticleRenderer } from './ParticleRenderer';
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

// Particle system exports
export { ParticleSystem, Particle } from './particles';
export type { ParticleConfig, ParticleState } from './particles';
export { DEFAULT_PARTICLE_CONFIG, DEFAULT_PARTICLE_COLORS } from './particles';
