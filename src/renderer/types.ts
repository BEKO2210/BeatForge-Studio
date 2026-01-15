/**
 * Configuration options for the Renderer
 */
export interface RendererConfig {
  /** Initial width in logical pixels */
  width?: number;
  /** Initial height in logical pixels */
  height?: number;
  /** Background color to clear with each frame (CSS color string) */
  backgroundColor?: string;
}

/**
 * Callback function for rendering - called each frame
 * @param ctx - Canvas 2D rendering context
 * @param deltaTime - Time since last frame in milliseconds
 */
export type RenderCallback = (
  ctx: CanvasRenderingContext2D,
  deltaTime: number
) => void;

/**
 * Current state of the renderer
 */
export type RendererState = 'idle' | 'running' | 'stopped';
