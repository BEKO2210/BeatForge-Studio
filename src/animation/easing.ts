/**
 * Animation easing functions for beat-reactive visuals
 *
 * All functions take t in 0-1 range, return 0-1 range.
 * "Ease out" means fast at start, slow at end (good for beat decay).
 */

/** Type for easing function */
export type EasingFn = (t: number) => number;

/**
 * Quadratic ease out - gentle deceleration
 * Formula: 1 - (1-t)^2
 */
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Cubic ease out - medium deceleration
 * Formula: 1 - (1-t)^3
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Exponential ease out - punchy attack, long tail
 * Formula: 1 - 2^(-10t) for t < 1, 1 for t >= 1
 */
export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Sine ease in-out - smooth S-curve for subtle effects
 * Formula: -(cos(PI*t) - 1) / 2
 */
export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * Calculate decay value given elapsed time and duration
 *
 * Returns 1.0 at elapsed=0, smoothly decays to 0 at elapsed>=duration.
 * Uses provided easing function for the decay curve.
 *
 * @param elapsed - Time elapsed since animation start (ms)
 * @param duration - Total decay duration (ms)
 * @param easing - Easing function to apply (default: easeOutExpo)
 * @returns Value from 1 (start) to 0 (end), or 0 if elapsed >= duration
 */
export function decay(
  elapsed: number,
  duration: number,
  easing: EasingFn = easeOutExpo
): number {
  if (elapsed >= duration) return 0;
  if (elapsed <= 0) return 1;

  // Progress from 0 (start) to 1 (end)
  const progress = elapsed / duration;

  // Easing gives us 0→1, we want 1→0 (inverted for decay)
  return 1 - easing(progress);
}
