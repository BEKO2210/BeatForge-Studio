import type { ShakeOffset } from './types';

/**
 * Calculate camera shake offset for beat-reactive visual effect.
 *
 * Uses a combination of time-based angle rotation and randomness
 * to create smooth shake with organic feel (not pure noise).
 *
 * @param reaction - Beat reaction value 0-1 (from useBeatReaction/useCameraShake)
 * @param maxOffset - Maximum pixel offset at full reaction
 * @returns Pixel offset to apply to canvas or wrapper element
 */
export function getCameraShakeOffset(
  reaction: number,
  maxOffset: number
): ShakeOffset {
  if (reaction <= 0.01) {
    return { x: 0, y: 0 };
  }

  // Time-based angle creates smooth rotation pattern
  const angle = (performance.now() / 50) % (Math.PI * 2);

  // Reaction scales the magnitude
  const magnitude = reaction * maxOffset;

  // Add randomness (0.5-1.0 range) to prevent predictable pattern
  const randomFactor = 0.5 + Math.random() * 0.5;

  return {
    x: Math.cos(angle) * magnitude * randomFactor,
    y: Math.sin(angle) * magnitude * randomFactor,
  };
}
