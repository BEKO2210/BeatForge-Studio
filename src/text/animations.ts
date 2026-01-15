/**
 * Text Animation Utilities
 *
 * Calculate animation state values for text effects including
 * fade, slide, scale, and beat-reactive pulse animations.
 */

import type { TextAnimation } from './types';

/**
 * Animation state for text rendering.
 * Computed based on animation type, progress, and beat reaction.
 */
export interface TextAnimationState {
  /** Opacity multiplier (0-1) */
  opacity: number;
  /** Horizontal offset in pixels */
  offsetX: number;
  /** Vertical offset in pixels */
  offsetY: number;
  /** Scale multiplier (1 = normal size) */
  scale: number;
}

// ============================================================================
// Easing Functions
// ============================================================================

/**
 * Quadratic ease-out: fast start, slow end
 * t * (2 - t)
 */
function easeOutQuad(t: number): number {
  return t * (2 - t);
}

/**
 * Exponential ease-out: very fast start, very slow end
 * Approaches 1 asymptotically
 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Back ease-out: overshoots slightly then settles
 * Creates a "bounce back" effect
 */
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// ============================================================================
// Animation Calculations
// ============================================================================

/** Slide distance in pixels */
const SLIDE_DISTANCE = 50;

/** Pulse scale factor (multiplied by beat reaction) */
const PULSE_SCALE_FACTOR = 0.1;

/**
 * Calculate animation state for a text layer.
 *
 * @param animation - Animation type
 * @param progress - Animation progress (0 = start, 1 = fully visible)
 * @param beatReaction - Beat reaction value (0-1) from useBeatReaction hook
 * @returns Animation state with opacity, offset, and scale values
 */
export function calculateTextAnimation(
  animation: TextAnimation,
  progress: number,
  beatReaction: number = 0
): TextAnimationState {
  // Clamp progress to valid range
  const t = Math.max(0, Math.min(1, progress));

  switch (animation) {
    case 'none':
      return {
        opacity: 1,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
      };

    case 'fade':
      return {
        opacity: easeOutQuad(t),
        offsetX: 0,
        offsetY: 0,
        scale: 1,
      };

    case 'slide-up':
      return {
        opacity: 1,
        offsetX: 0,
        offsetY: (1 - easeOutExpo(t)) * SLIDE_DISTANCE,
        scale: 1,
      };

    case 'slide-down':
      return {
        opacity: 1,
        offsetX: 0,
        offsetY: -(1 - easeOutExpo(t)) * SLIDE_DISTANCE,
        scale: 1,
      };

    case 'slide-left':
      return {
        opacity: 1,
        offsetX: (1 - easeOutExpo(t)) * SLIDE_DISTANCE,
        offsetY: 0,
        scale: 1,
      };

    case 'slide-right':
      return {
        opacity: 1,
        offsetX: -(1 - easeOutExpo(t)) * SLIDE_DISTANCE,
        offsetY: 0,
        scale: 1,
      };

    case 'scale':
      return {
        opacity: 1,
        offsetX: 0,
        offsetY: 0,
        scale: easeOutBack(t),
      };

    case 'pulse':
      return {
        opacity: 1,
        offsetX: 0,
        offsetY: 0,
        scale: 1 + beatReaction * PULSE_SCALE_FACTOR,
      };

    default:
      // Exhaustive check - TypeScript will error if a case is missing
      const _exhaustive: never = animation;
      return _exhaustive;
  }
}
