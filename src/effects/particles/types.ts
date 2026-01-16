/**
 * Particle system configuration and state types
 */

/** Configuration for the particle system */
export interface ParticleConfig {
  /** Maximum particles in pool (default: 200) */
  maxParticles: number;
  /** Particles emitted per beat (default: 15) */
  emitCount: number;
  /** Particle lifespan in milliseconds (default: 1500) */
  lifetime: number;
  /** Minimum particle radius (default: 2) */
  minSize: number;
  /** Maximum particle radius (default: 8) */
  maxSize: number;
  /** Minimum velocity in pixels/second (default: 50) */
  minSpeed: number;
  /** Maximum velocity in pixels/second (default: 200) */
  maxSpeed: number;
  /** Downward acceleration in pixels/second^2 (default: 100) */
  gravity: number;
  /** Array of particle colors (default: neon palette) */
  colors: string[];
}

/** Runtime state of a single particle */
export interface ParticleState {
  /** X position in pixels */
  x: number;
  /** Y position in pixels */
  y: number;
  /** X velocity in pixels/second */
  vx: number;
  /** Y velocity in pixels/second */
  vy: number;
  /** Particle radius in pixels */
  size: number;
  /** Particle color (CSS color string) */
  color: string;
  /** Remaining life fraction 0-1 (1 = just spawned, 0 = dead) */
  life: number;
  /** Total lifespan in milliseconds */
  maxLife: number;
  /** Whether particle is currently active */
  active: boolean;
}

/** Default neon color palette for particles */
export const DEFAULT_PARTICLE_COLORS = [
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
  '#ffff00', // Yellow
  '#ff6600', // Orange
  '#00ff00', // Green
];

/** Default particle system configuration */
export const DEFAULT_PARTICLE_CONFIG: ParticleConfig = {
  maxParticles: 200,
  emitCount: 15,
  lifetime: 1500,
  minSize: 2,
  maxSize: 8,
  minSpeed: 50,
  maxSpeed: 200,
  gravity: 100,
  colors: DEFAULT_PARTICLE_COLORS,
};
