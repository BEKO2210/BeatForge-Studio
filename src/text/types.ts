/**
 * Text System Type Definitions
 *
 * Core types for the text overlay system including positioning,
 * styling, animation, and layer configuration.
 */

/**
 * Position for text on canvas using normalized coordinates.
 * Values 0-1 map to canvas dimensions (0=left/top, 1=right/bottom).
 */
export interface TextPosition {
  /** Horizontal position (0 = left edge, 1 = right edge) */
  x: number;
  /** Vertical position (0 = top edge, 1 = bottom edge) */
  y: number;
  /** Text alignment anchor point */
  anchor: 'left' | 'center' | 'right';
}

/**
 * Shadow configuration for text effects
 */
export interface TextShadow {
  /** Shadow color (CSS color string) */
  color: string;
  /** Blur radius in pixels */
  blur: number;
  /** Horizontal offset in pixels */
  offsetX: number;
  /** Vertical offset in pixels */
  offsetY: number;
}

/**
 * Style configuration for text rendering
 */
export interface TextStyle {
  /** Font family (CSS font-family value) */
  fontFamily: string;
  /** Font size in pixels */
  fontSize: number;
  /** Font weight */
  fontWeight: 'normal' | 'bold' | number;
  /** Fill color (CSS color string) */
  color: string;
  /** Optional stroke/outline color */
  strokeColor?: string;
  /** Stroke width in pixels (requires strokeColor) */
  strokeWidth?: number;
  /** Optional drop shadow */
  shadow?: TextShadow;
}

/**
 * Default text style values
 */
export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 32,
  fontWeight: 'normal',
  color: '#ffffff',
};

/**
 * Available animation types for text layers
 */
export type TextAnimation =
  | 'none'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'pulse';

/**
 * A text layer representing a single text element on the canvas.
 * Contains all information needed to render and animate text.
 */
export interface TextLayer {
  /** Unique identifier for this layer */
  id: string;
  /** Text content to display */
  content: string;
  /** Position on canvas (normalized 0-1 coordinates) */
  position: TextPosition;
  /** Visual styling */
  style: TextStyle;
  /** Animation type for entrance/presence */
  animation: TextAnimation;
  /** Whether to pulse/react on detected beats */
  beatReactive: boolean;
  /** Whether this layer is currently visible */
  visible: boolean;
}
