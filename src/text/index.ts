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
} from './types';

export { DEFAULT_TEXT_STYLE } from './types';

// Text rendering
export { renderTextLayer } from './TextRenderer';
export type { TextAnimationState } from './TextRenderer';

// Animation utilities
export { calculateTextAnimation } from './animations';

// React component
export { TextLayerRenderer } from './TextLayer';
export type { TextLayerRendererProps } from './TextLayer';
