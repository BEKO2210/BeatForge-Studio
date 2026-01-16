import { Particle } from './Particle';
import type { ParticleConfig, ParticleState } from './types';
import { DEFAULT_PARTICLE_CONFIG } from './types';

/**
 * Particle system with efficient object pooling.
 * Pre-allocates particles to avoid GC pressure during animation.
 */
export class ParticleSystem {
  private particles: Particle[];
  private config: ParticleConfig;

  constructor(config: Partial<ParticleConfig> = {}) {
    this.config = { ...DEFAULT_PARTICLE_CONFIG, ...config };

    // Pre-allocate particle pool
    this.particles = Array.from(
      { length: this.config.maxParticles },
      () => new Particle(this.config)
    );
  }

  /**
   * Emit particles at the specified position.
   * Particle count scales with beat intensity.
   *
   * @param x - Emission X position (typically canvas center)
   * @param y - Emission Y position (typically canvas center)
   * @param intensity - Beat intensity 0-1, affects count and speed
   */
  emit(x: number, y: number, intensity: number): void {
    // Scale emit count by intensity (50% base + 50% intensity-scaled)
    const actualCount = Math.floor(
      this.config.emitCount * (0.5 + intensity * 0.5)
    );

    let spawned = 0;

    // Find available particles and spawn them
    for (const particle of this.particles) {
      if (spawned >= actualCount) break;

      if (particle.isAvailable()) {
        particle.spawn(x, y, intensity);
        spawned++;
      }
    }

    // If pool is exhausted, recycle oldest active particles
    if (spawned < actualCount) {
      // Sort by remaining life (lowest first = oldest)
      const sortedByLife = [...this.particles]
        .filter(p => !p.isAvailable())
        .sort((a, b) => a.getState().life - b.getState().life);

      for (const particle of sortedByLife) {
        if (spawned >= actualCount) break;
        particle.spawn(x, y, intensity);
        spawned++;
      }
    }
  }

  /**
   * Update all active particles for one frame.
   *
   * @param deltaTime - Time since last frame in milliseconds
   */
  update(deltaTime: number): void {
    for (const particle of this.particles) {
      if (particle.isAlive()) {
        particle.update(deltaTime);
      }
    }
  }

  /**
   * Get state of all active particles for rendering.
   */
  getActiveParticles(): ParticleState[] {
    return this.particles
      .filter(p => p.isAlive())
      .map(p => p.getState());
  }

  /**
   * Get count of currently active particles.
   */
  getActiveCount(): number {
    return this.particles.filter(p => p.isAlive()).length;
  }

  /**
   * Clear all particles (deactivate all).
   */
  clear(): void {
    for (const particle of this.particles) {
      particle.deactivate();
    }
  }
}
