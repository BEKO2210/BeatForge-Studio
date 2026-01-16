/**
 * Text Renderer
 *
 * Pure function for rendering TextLayer objects on a canvas context.
 * Handles positioning, styling, stroke, shadow, glow, rotation, and animation state.
 */

import type { TextLayer } from './types';
import type { TextAnimationState } from './animations';

/**
 * Default animation state (fully visible, no transforms)
 */
const DEFAULT_ANIMATION_STATE: TextAnimationState = {
  opacity: 1,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  rotation: 0,
  glowBlur: 0,
  glowColor: 'rgba(255, 255, 255, 0)',
};

/**
 * Renders a text layer on the canvas.
 *
 * Converts normalized (0-1) coordinates to pixel positions,
 * applies styling (font, color, stroke, shadow, glow), and handles
 * animation state transforms (opacity, offset, scale, rotation).
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
  const { opacity, offsetX, offsetY, scale, rotation, glowBlur, glowColor } = animationState;

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

  // Apply transforms (translate to position, rotate, scale)
  ctx.translate(x, y);

  if (rotation !== 0) {
    ctx.rotate(rotation);
  }

  if (scale !== 1) {
    ctx.scale(scale, scale);
  }

  // Reset position for drawing (we've already translated)
  const drawX = 0;
  const drawY = 0;

  // Set font properties
  const fontWeight = typeof style.fontWeight === 'number'
    ? style.fontWeight.toString()
    : style.fontWeight;
  ctx.font = `${fontWeight} ${style.fontSize}px ${style.fontFamily}`;

  // Set text alignment
  ctx.textAlign = position.anchor;
  ctx.textBaseline = 'middle';

  // Apply glow effect (rendered as shadow with no offset)
  if (glowBlur > 0) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  // Apply shadow if configured (in addition to glow)
  else if (style.shadow) {
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
    ctx.strokeText(content, drawX, drawY);
  }

  // Draw fill text
  ctx.fillStyle = style.color;
  ctx.fillText(content, drawX, drawY);

  // If we have both glow and want stroke to glow too, draw again without glow
  if (glowBlur > 0 && style.strokeColor && style.strokeWidth) {
    // Draw stroke again with glow
    ctx.strokeText(content, drawX, drawY);
  }

  // Restore context state
  ctx.restore();
}
