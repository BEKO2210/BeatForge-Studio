/**
 * Text System Module
 *
 * Provides text overlay functionality for rendering styled,
 * animated text on the canvas visualization.
 */

// Type definitions
export type {
  TextPosition,
  TextShadow,
  TextStyle,
  TextAnimation,
  TextLayer,
  BeatEffectSettings,
} from './types';

export { DEFAULT_TEXT_STYLE, DEFAULT_BEAT_EFFECTS } from './types';

// Text rendering
export { renderTextLayer } from './TextRenderer';

// Animation utilities
export { calculateTextAnimation, applyBeatEffects } from './animations';
export type { TextAnimationState } from './animations';

// React component
export { TextLayerRenderer } from './TextLayer';
export type { TextLayerRendererProps } from './TextLayer';
