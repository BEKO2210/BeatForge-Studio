/**
 * Text Renderer
 *
 * Pure function for rendering TextLayer objects on a canvas context.
 * Handles positioning, styling, stroke, shadow, and animation state.
 */

import type { TextLayer } from './types';

/**
 * Animation state computed by animation utilities.
 * Applied during text rendering for dynamic effects.
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

/**
 * Default animation state (fully visible, no transforms)
 */
const DEFAULT_ANIMATION_STATE: TextAnimationState = {
  opacity: 1,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

/**
 * Renders a text layer on the canvas.
 *
 * Converts normalized (0-1) coordinates to pixel positions,
 * applies styling (font, color, stroke, shadow), and handles
 * animation state transforms (opacity, offset, scale).
 *
 * @param ctx - Canvas 2D rendering context
 * @param layer - Text layer to render
 * @param canvasWidth - Logical canvas width in pixels
 * @param canvasHeight - Logical canvas height in pixels
 * @param animationState - Optional animation state for transforms
 */
export function renderTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  canvasWidth: number,
  canvasHeight: number,
  animationState: TextAnimationState = DEFAULT_ANIMATION_STATE
): void {
  // Skip invisible layers
  if (!layer.visible) return;

  const { content, position, style } = layer;
  const { opacity, offsetX, offsetY, scale } = animationState;

  // Skip fully transparent layers
  if (opacity <= 0) return;

  // Calculate pixel position from normalized coordinates
  const baseX = position.x * canvasWidth;
  const baseY = position.y * canvasHeight;

  // Apply animation offsets
  const x = baseX + offsetX;
  const y = baseY + offsetY;

  // Save context state
  ctx.save();

  // Apply opacity
  ctx.globalAlpha = opacity;

  // Apply scale transform around text position
  if (scale !== 1) {
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.translate(-x, -y);
  }

  // Set font properties
  const fontWeight = typeof style.fontWeight === 'number'
    ? style.fontWeight.toString()
    : style.fontWeight;
  ctx.font = `${fontWeight} ${style.fontSize}px ${style.fontFamily}`;

  // Set text alignment
  ctx.textAlign = position.anchor;
  ctx.textBaseline = 'middle';

  // Apply shadow if configured
  if (style.shadow) {
    ctx.shadowColor = style.shadow.color;
    ctx.shadowBlur = style.shadow.blur;
    ctx.shadowOffsetX = style.shadow.offsetX;
    ctx.shadowOffsetY = style.shadow.offsetY;
  }

  // Draw stroke first (appears behind fill)
  if (style.strokeColor && style.strokeWidth && style.strokeWidth > 0) {
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = style.strokeWidth;
    ctx.lineJoin = 'round';
    ctx.strokeText(content, x, y);
  }

  // Draw fill text
  ctx.fillStyle = style.color;
  ctx.fillText(content, x, y);

  // Restore context state
  ctx.restore();
}
