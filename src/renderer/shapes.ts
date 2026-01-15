/**
 * Shape drawing primitives for Canvas 2D
 *
 * All coordinates are in logical pixels - the Renderer handles DPR scaling.
 * Each function saves/restores context state for isolation.
 */

/**
 * Options for rectangle drawing
 */
export interface RectOptions {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  cornerRadius?: number;
}

/**
 * Options for circle drawing
 */
export interface CircleOptions {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

/**
 * Options for line drawing
 */
export interface LineOptions {
  color?: string;
  width?: number;
  lineCap?: 'butt' | 'round' | 'square';
}

/**
 * Draw a rectangle (optionally with rounded corners)
 */
export function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: RectOptions = {}
): void {
  const {
    fillColor = '#666666',
    strokeColor,
    strokeWidth = 1,
    cornerRadius,
  } = options;

  ctx.save();

  ctx.beginPath();

  if (cornerRadius && cornerRadius > 0) {
    // Use roundRect for rounded corners (supported in modern browsers)
    ctx.roundRect(x, y, width, height, cornerRadius);
  } else {
    ctx.rect(x, y, width, height);
  }

  // Fill if fillColor specified
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  // Stroke if strokeColor specified
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw a circle
 */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  options: CircleOptions = {}
): void {
  const {
    fillColor = '#666666',
    strokeColor,
    strokeWidth = 1,
  } = options;

  ctx.save();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

  // Fill if fillColor specified
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  // Stroke if strokeColor specified
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw a line
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: LineOptions = {}
): void {
  const {
    color = '#666666',
    width = 1,
    lineCap = 'butt',
  } = options;

  ctx.save();

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = lineCap;
  ctx.stroke();

  ctx.restore();
}
