import type { ParticleConfig, ParticleState } from './types';
import { DEFAULT_PARTICLE_CONFIG } from './types';

/**
 * Individual particle with spawn, update, and state management.
 * Designed for object pooling - particles are reused rather than garbage collected.
 */
export class Particle {
  private config: ParticleConfig;
  private state: ParticleState;

  constructor(config: Partial<ParticleConfig> = {}) {
    this.config = { ...DEFAULT_PARTICLE_CONFIG, ...config };

    // Initialize inactive state
    this.state = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      color: this.config.colors[0] ?? '#ffffff',
      life: 0,
      maxLife: this.config.lifetime,
      active: false,
    };
  }

  /**
   * Spawn particle at position with velocity based on intensity.
   * Creates explosion pattern with random direction.
   *
   * @param x - Spawn X position
   * @param y - Spawn Y position
   * @param intensity - Beat intensity 0-1, affects speed
   */
  spawn(x: number, y: number, intensity: number): void {
    const { minSpeed, maxSpeed, minSize, maxSize, colors, lifetime } = this.config;

    // Random angle for explosion pattern (full circle)
    const angle = Math.random() * Math.PI * 2;

    // Speed scales with intensity
    const speedRange = maxSpeed - minSpeed;
    const speed = minSpeed + Math.random() * speedRange * (0.5 + intensity * 0.5);

    // Calculate velocity components
    // Negative vy bias for upward initial motion
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - (speed * 0.3); // Slight upward bias

    // Random size within range
    const size = minSize + Math.random() * (maxSize - minSize);

    // Random color from palette
    const colorIndex = Math.floor(Math.random() * colors.length);
    const color = colors[colorIndex] ?? '#ffffff';

    // Set state
    this.state = {
      x,
      y,
      vx,
      vy,
      size,
      color,
      life: 1.0,
      maxLife: lifetime,
      active: true,
    };
  }

  /**
   * Update particle physics for one frame.
   *
   * @param deltaTime - Time since last frame in milliseconds
   */
  update(deltaTime: number): void {
    if (!this.state.active) return;

    const dt = deltaTime / 1000; // Convert to seconds

    // Update position
    this.state.x += this.state.vx * dt;
    this.state.y += this.state.vy * dt;

    // Apply gravity (pulls downward, positive y)
    this.state.vy += this.config.gravity * dt;

    // Decrease life
    this.state.life -= deltaTime / this.state.maxLife;

    // Deactivate when life depleted
    if (this.state.life <= 0) {
      this.state.life = 0;
      this.state.active = false;
    }
  }

  /**
   * Check if particle is still alive and active.
   */
  isAlive(): boolean {
    return this.state.active && this.state.life > 0;
  }

  /**
   * Get current particle state for rendering.
   */
  getState(): ParticleState {
    return { ...this.state };
  }

  /**
   * Check if particle is available for reuse.
   */
  isAvailable(): boolean {
    return !this.state.active;
  }

  /**
   * Force deactivate particle (for clearing).
   */
  deactivate(): void {
    this.state.active = false;
    this.state.life = 0;
  }
}
