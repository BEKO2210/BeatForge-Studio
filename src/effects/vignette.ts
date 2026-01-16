import type { VignetteConfig } from './types';

/**
 * Render vignette effect - darkened edges for cinematic depth.
 *
 * Creates a radial gradient from transparent center to dark edges.
 * Should be called in the 'overlay' render layer (after visualizers, before text).
 *
 * @param ctx - Canvas 2D rendering context
 * @param width - Canvas width in logical pixels
 * @param height - Canvas height in logical pixels
 * @param config - Vignette configuration
 */
export function renderVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: Partial<VignetteConfig> = {}
): void {
  const intensity = config.intensity ?? 0.35;
  const softness = config.softness ?? 0.5;

  // Skip if intensity is negligible
  if (intensity < 0.01) return;

  const centerX = width / 2;
  const centerY = height / 2;

  // Radius extends to corners for full coverage
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

  // Create radial gradient from center to edges
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0, // Inner circle at center
    centerX,
    centerY,
    maxRadius // Outer circle at corners
  );

  // Transparent center
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');

  // Softness determines where darkening begins
  gradient.addColorStop(softness, 'rgba(0, 0, 0, 0)');

  // Full intensity at edges
  gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);

  // Draw vignette overlay
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}
