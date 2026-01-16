/**
 * Text Animation System - Dramatic & Visible Effects
 *
 * Provides powerful, visible animations inspired by professional
 * video editing tools (After Effects, CapCut, Lyric Video generators).
 *
 * Key principles:
 * - All effects MUST be visually dramatic and obvious
 * - Beat reactions should be strong and immediate
 * - Continuous motion keeps text "alive"
 * - Professional easing and spring physics
 */

import type { TextAnimation, BeatEffectSettings } from './types';

/**
 * Animation state for text rendering.
 * All transforms are applied to text during render.
 */
export interface TextAnimationState {
  /** Opacity (0 = invisible, 1 = fully visible) */
  opacity: number;
  /** Horizontal offset in pixels */
  offsetX: number;
  /** Vertical offset in pixels */
  offsetY: number;
  /** Scale multiplier (1 = normal, 2 = double size) */
  scale: number;
  /** Rotation in radians */
  rotation: number;
  /** Glow blur radius in pixels */
  glowBlur: number;
  /** Glow color (CSS rgba) */
  glowColor: string;
}

// ============================================================================
// Configuration Constants - Tuned for VISIBILITY
// ============================================================================

/** Duration for intro animations (ms) - longer for visibility */
const INTRO_DURATION = 1200;

/** Base slide distance in pixels - much larger for visibility */
const SLIDE_DISTANCE = 150;

/** Maximum shake offset in pixels */
const MAX_SHAKE = 25;

/** Maximum wobble rotation in radians (~15 degrees) */
const MAX_WOBBLE = 0.26;

/** Maximum pulse scale increase */
const MAX_PULSE_SCALE = 0.5;

/** Maximum glow blur radius */
const MAX_GLOW = 40;

// ============================================================================
// Easing Functions - Professional Quality
// ============================================================================

/** Quadratic ease out - natural deceleration */
function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/** Cubic ease out - smoother deceleration */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Back ease out - overshoot then settle */
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Elastic ease out - bouncy spring */
function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}

// ============================================================================
// Noise & Continuous Motion Functions
// ============================================================================

/** Simple pseudo-random based on time for organic motion */
function noise(seed: number, time: number): number {
  const x = Math.sin(seed * 12.9898 + time * 0.001) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1; // -1 to 1
}

/** Smooth sine-based oscillation */
function oscillate(time: number, frequency: number, phase: number = 0): number {
  return Math.sin(time * frequency * 0.001 + phase);
}

/** Multi-layered organic motion (like wind) */
function organicMotion(time: number, seed: number): number {
  return (
    oscillate(time, 2, seed) * 0.5 +
    oscillate(time, 5, seed + 1) * 0.3 +
    oscillate(time, 11, seed + 2) * 0.2
  );
}

// ============================================================================
// Default State
// ============================================================================

const DEFAULT_STATE: TextAnimationState = {
  opacity: 1,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  rotation: 0,
  glowBlur: 0,
  glowColor: 'rgba(255, 255, 255, 0)',
};

// ============================================================================
// Main Animation Calculator
// ============================================================================

/**
 * Calculate complete animation state for a text layer.
 *
 * Combines:
 * 1. Intro animation (first INTRO_DURATION ms)
 * 2. Continuous ambient motion (always active for some types)
 * 3. Beat reaction (when beat is detected)
 *
 * @param animation - Animation type
 * @param timeSinceCreation - Milliseconds since layer was created
 * @param beatReaction - Beat intensity (0-1) from useBeatReaction hook
 * @param settings - User-configurable effect settings
 * @param currentTime - Current timestamp for continuous animations
 */
export function calculateTextAnimation(
  animation: TextAnimation,
  timeSinceCreation: number,
  beatReaction: number = 0,
  settings?: BeatEffectSettings,
  currentTime: number = Date.now()
): TextAnimationState {
  // Get settings with defaults
  const sensitivity = settings?.sensitivity ?? 0.5;
  const beatStrength = settings?.beatStrength ?? 0.5;
  const smoothness = settings?.smoothness ?? 0.5;
  const shakeIntensity = settings?.shakeIntensity ?? 0.5;
  const glowIntensity = settings?.glowIntensity ?? 0.5;

  // Calculate intro progress (0 to 1 over INTRO_DURATION)
  const introProgress = Math.min(1, timeSinceCreation / INTRO_DURATION);

  // Amplify beat reaction based on sensitivity (make it STRONG)
  const effectiveBeat = beatReaction * (0.5 + sensitivity) * (0.5 + beatStrength);

  // Unique seed for this animation instance
  const seed = animation.charCodeAt(0) || 1;

  switch (animation) {
    case 'none':
      return { ...DEFAULT_STATE };

    case 'fade':
      return calculateFade(introProgress, effectiveBeat, smoothness, glowIntensity);

    case 'slide-up':
      return calculateSlide(introProgress, effectiveBeat, 0, -1, smoothness, glowIntensity);

    case 'slide-down':
      return calculateSlide(introProgress, effectiveBeat, 0, 1, smoothness, glowIntensity);

    case 'slide-left':
      return calculateSlide(introProgress, effectiveBeat, -1, 0, smoothness, glowIntensity);

    case 'slide-right':
      return calculateSlide(introProgress, effectiveBeat, 1, 0, smoothness, glowIntensity);

    case 'scale':
      return calculateScale(introProgress, effectiveBeat, smoothness, glowIntensity);

    case 'pulse':
      return calculatePulse(introProgress, effectiveBeat, beatStrength, glowIntensity, currentTime);

    case 'shake':
      return calculateShake(introProgress, effectiveBeat, shakeIntensity, glowIntensity, currentTime, seed);

    case 'wobble':
      return calculateWobble(introProgress, effectiveBeat, shakeIntensity, glowIntensity, currentTime, seed);

    case 'glow':
      return calculateGlow(introProgress, effectiveBeat, glowIntensity, currentTime);

    default:
      return { ...DEFAULT_STATE };
  }
}

// ============================================================================
// Individual Effect Implementations - DRAMATIC & VISIBLE
// ============================================================================

/**
 * Fade - Smooth opacity transition with beat pulse
 */
function calculateFade(
  progress: number,
  beat: number,
  _smoothness: number,
  glowIntensity: number
): TextAnimationState {
  // Use smooth easing for fade
  const easedProgress = easeOutCubic(progress);

  // Opacity: 0 -> 1 during intro
  const baseOpacity = easedProgress;

  // Beat adds slight glow, doesn't affect opacity
  return {
    ...DEFAULT_STATE,
    opacity: baseOpacity,
    scale: 1 + beat * 0.1, // Subtle scale on beat
    glowBlur: beat * glowIntensity * MAX_GLOW * 0.5,
    glowColor: `rgba(255, 255, 255, ${beat * glowIntensity * 0.6})`,
  };
}

/**
 * Slide - Dramatic entrance from off-screen with overshoot
 */
function calculateSlide(
  progress: number,
  beat: number,
  dirX: number,
  dirY: number,
  _smoothness: number,
  glowIntensity: number
): TextAnimationState {
  // Use back easing for overshoot effect (professional look)
  const easedProgress = easeOutBack(progress);

  // Start off-screen, slide to position with overshoot
  const slideOffset = (1 - easedProgress) * SLIDE_DISTANCE;

  // Opacity fades in during first half of animation
  const opacityProgress = Math.min(1, progress * 2);
  const opacity = easeOutQuad(opacityProgress);

  // Beat adds micro-movement in slide direction
  const beatOffset = beat * 10;

  return {
    ...DEFAULT_STATE,
    opacity,
    offsetX: dirX * slideOffset + dirX * beatOffset,
    offsetY: dirY * slideOffset + dirY * beatOffset,
    scale: 1 + beat * 0.08,
    glowBlur: beat * glowIntensity * MAX_GLOW * 0.4,
    glowColor: `rgba(255, 255, 255, ${beat * glowIntensity * 0.5})`,
  };
}

/**
 * Scale - Dramatic pop-in with elastic bounce
 */
function calculateScale(
  progress: number,
  beat: number,
  _smoothness: number,
  glowIntensity: number
): TextAnimationState {
  // Use elastic easing for bouncy pop-in
  const easedProgress = easeOutElastic(progress);

  // Start at 0, bounce past 1, settle at 1
  const baseScale = easedProgress;

  // Opacity quick fade in
  const opacity = easeOutQuad(Math.min(1, progress * 3));

  // Beat adds pulse
  const beatScale = beat * 0.25;

  return {
    ...DEFAULT_STATE,
    opacity,
    scale: baseScale + beatScale,
    glowBlur: beat * glowIntensity * MAX_GLOW * 0.5,
    glowColor: `rgba(255, 255, 255, ${beat * glowIntensity * 0.6})`,
  };
}

/**
 * Pulse - Strong beat-reactive scaling with glow
 */
function calculatePulse(
  progress: number,
  beat: number,
  beatStrength: number,
  glowIntensity: number,
  time: number
): TextAnimationState {
  // Quick intro fade
  const opacity = easeOutQuad(Math.min(1, progress * 2));

  // Intro scale with bounce
  const introScale = progress < 1 ? easeOutBack(progress) : 1;

  // STRONG beat pulse - this should be VERY visible
  const pulseAmount = beat * MAX_PULSE_SCALE * (0.5 + beatStrength);
  const scale = introScale + pulseAmount;

  // Continuous subtle pulse even without beat (keeps it alive)
  const ambientPulse = Math.sin(time * 0.003) * 0.02;

  // Strong glow on beat
  const glowAmount = beat * glowIntensity;

  return {
    ...DEFAULT_STATE,
    opacity,
    scale: scale + ambientPulse,
    glowBlur: 5 + glowAmount * MAX_GLOW,
    glowColor: `rgba(255, 200, 100, ${0.2 + glowAmount * 0.8})`,
  };
}

/**
 * Shake - Aggressive beat-reactive shaking
 */
function calculateShake(
  progress: number,
  beat: number,
  shakeIntensity: number,
  glowIntensity: number,
  time: number,
  seed: number
): TextAnimationState {
  // Quick intro
  const opacity = easeOutQuad(Math.min(1, progress * 2));
  const introScale = progress < 1 ? easeOutBack(progress) : 1;

  // STRONG shake on beat - must be visible!
  const shakeAmount = beat * MAX_SHAKE * (0.5 + shakeIntensity);

  // Use high-frequency noise for aggressive shake
  const shakeX = noise(seed, time * 50) * shakeAmount;
  const shakeY = noise(seed + 100, time * 50) * shakeAmount;

  // Continuous micro-shake (keeps text alive)
  const ambientShakeX = noise(seed, time * 10) * 2;
  const ambientShakeY = noise(seed + 100, time * 10) * 2;

  // Scale boost on beat
  const scaleBoost = beat * 0.2 * (0.5 + shakeIntensity);

  return {
    ...DEFAULT_STATE,
    opacity,
    offsetX: shakeX + ambientShakeX,
    offsetY: shakeY + ambientShakeY,
    scale: introScale + scaleBoost,
    rotation: noise(seed + 200, time * 30) * beat * 0.1, // Slight rotation shake
    glowBlur: beat * glowIntensity * MAX_GLOW * 0.6,
    glowColor: `rgba(255, 100, 50, ${beat * glowIntensity * 0.7})`,
  };
}

/**
 * Wobble - Smooth organic wave motion
 */
function calculateWobble(
  progress: number,
  beat: number,
  shakeIntensity: number,
  glowIntensity: number,
  time: number,
  seed: number
): TextAnimationState {
  // Intro with bounce
  const opacity = easeOutQuad(Math.min(1, progress * 2));
  const introScale = progress < 1 ? easeOutElastic(progress) : 1;

  // Continuous organic wobble (ALWAYS active for "alive" feel)
  const wobbleX = organicMotion(time, seed) * 8 * (0.5 + shakeIntensity);
  const wobbleY = organicMotion(time + 1000, seed + 50) * 5 * (0.5 + shakeIntensity);

  // Rotation wobble - smooth wave
  const baseRotation = oscillate(time, 1.5, seed) * MAX_WOBBLE * 0.3 * (0.5 + shakeIntensity);

  // Beat amplifies wobble dramatically
  const beatWobbleX = beat * organicMotion(time * 3, seed) * 15;
  const beatWobbleY = beat * organicMotion(time * 3, seed + 50) * 10;
  const beatRotation = beat * oscillate(time, 8, seed) * MAX_WOBBLE;

  // Scale boost on beat
  const scaleBoost = beat * 0.15;

  return {
    ...DEFAULT_STATE,
    opacity,
    offsetX: wobbleX + beatWobbleX,
    offsetY: wobbleY + beatWobbleY,
    scale: introScale + scaleBoost,
    rotation: baseRotation + beatRotation,
    glowBlur: 3 + beat * glowIntensity * MAX_GLOW * 0.5,
    glowColor: `rgba(150, 100, 255, ${0.1 + beat * glowIntensity * 0.6})`,
  };
}

/**
 * Glow - Pulsing glow effect with warm colors
 */
function calculateGlow(
  progress: number,
  beat: number,
  glowIntensity: number,
  time: number
): TextAnimationState {
  // Smooth intro
  const opacity = easeOutCubic(progress);
  const introScale = progress < 1 ? easeOutBack(progress) : 1;

  // Continuous ambient glow (always visible)
  const ambientGlow = 8 + Math.sin(time * 0.002) * 4;
  const ambientAlpha = 0.3 + Math.sin(time * 0.003) * 0.1;

  // Beat intensifies glow dramatically
  const beatGlow = beat * MAX_GLOW * (0.5 + glowIntensity);
  const beatAlpha = beat * glowIntensity;

  // Subtle scale on beat
  const scaleBoost = beat * 0.12;

  // Color shifts warmer on beat
  const r = 255;
  const g = Math.round(200 - beat * 100); // Gets more orange on beat
  const b = Math.round(100 - beat * 50);

  return {
    ...DEFAULT_STATE,
    opacity,
    scale: introScale + scaleBoost,
    glowBlur: ambientGlow + beatGlow,
    glowColor: `rgba(${r}, ${g}, ${b}, ${ambientAlpha + beatAlpha})`,
  };
}

// ============================================================================
// Beat Effect Application (for non-beat animations with beatReactive enabled)
// ============================================================================

/**
 * Apply beat effects on top of any base animation state.
 * Used when beatReactive is enabled but animation is not inherently beat-based.
 */
export function applyBeatEffects(
  state: TextAnimationState,
  beatReaction: number,
  settings: BeatEffectSettings,
  time: number
): TextAnimationState {
  if (beatReaction <= 0.01) return state;

  const { sensitivity, beatStrength, shakeIntensity, glowIntensity } = settings;

  // Amplify beat effect
  const effectiveBeat = beatReaction * (0.5 + sensitivity) * (0.5 + beatStrength);

  // Add scale pulse
  const scalePulse = effectiveBeat * 0.2;

  // Add shake
  const shakeAmount = effectiveBeat * MAX_SHAKE * 0.5 * shakeIntensity;
  const shakeX = noise(42, time * 40) * shakeAmount;
  const shakeY = noise(142, time * 40) * shakeAmount;

  // Add glow
  const glowBoost = effectiveBeat * MAX_GLOW * 0.6 * glowIntensity;
  const glowAlpha = effectiveBeat * 0.6 * glowIntensity;

  return {
    ...state,
    offsetX: state.offsetX + shakeX,
    offsetY: state.offsetY + shakeY,
    scale: state.scale * (1 + scalePulse),
    glowBlur: Math.max(state.glowBlur, glowBoost),
    glowColor: glowAlpha > 0.1 ? `rgba(255, 255, 255, ${glowAlpha})` : state.glowColor,
  };
}
