import type { RendererConfig, RenderCallback, RendererState } from './types';

/**
 * Canvas 2D Renderer with 60 FPS render loop
 *
 * Handles:
 * - Canvas setup with devicePixelRatio for crisp rendering
 * - requestAnimationFrame-based render loop with deltaTime
 * - Multiple render callbacks (for layered visualizers)
 * - Responsive resize support
 */
export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderCallbacks: Set<RenderCallback> = new Set();
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private _state: RendererState = 'idle';
  private backgroundColor: string;

  // Logical dimensions (before DPR scaling)
  private _width: number;
  private _height: number;

  constructor(canvas: HTMLCanvasElement, config: RendererConfig = {}) {
    this.canvas = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;

    this._width = config.width ?? (canvas.clientWidth || 800);
    this._height = config.height ?? (canvas.clientHeight || 600);
    this.backgroundColor = config.backgroundColor ?? '#1a1a1a';

    this.setupCanvas();
  }

  /**
   * Set up canvas dimensions accounting for devicePixelRatio
   */
  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;

    // Set actual canvas size in pixels
    this.canvas.width = this._width * dpr;
    this.canvas.height = this._height * dpr;

    // Set display size via CSS
    this.canvas.style.width = `${this._width}px`;
    this.canvas.style.height = `${this._height}px`;

    // Scale context to account for DPR
    this.ctx.scale(dpr, dpr);
  }

  /**
   * Main render loop
   */
  private renderLoop = (timestamp: number): void => {
    if (this._state !== 'running') return;

    // Calculate delta time in milliseconds
    const deltaTime = this.lastFrameTime ? timestamp - this.lastFrameTime : 16.67;
    this.lastFrameTime = timestamp;

    // Clear canvas with background color
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this._width, this._height);

    // Call all registered render callbacks
    for (const callback of this.renderCallbacks) {
      this.ctx.save();
      callback(this.ctx, deltaTime);
      this.ctx.restore();
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };

  /**
   * Start the render loop
   */
  start(): void {
    if (this._state === 'running') return;

    this._state = 'running';
    this.lastFrameTime = 0;
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  }

  /**
   * Stop the render loop
   */
  stop(): void {
    if (this._state !== 'running') return;

    this._state = 'stopped';

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Resize the canvas to new dimensions
   */
  resize(width: number, height: number): void {
    this._width = width;
    this._height = height;

    // Reset context transform before setting up again
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.setupCanvas();
  }

  /**
   * Register a render callback
   * @returns Unsubscribe function
   */
  onRender(callback: RenderCallback): () => void {
    this.renderCallbacks.add(callback);
    return () => {
      this.renderCallbacks.delete(callback);
    };
  }

  /**
   * Get the canvas 2D rendering context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Get current renderer state
   */
  get state(): RendererState {
    return this._state;
  }

  /**
   * Get logical width (before DPR scaling)
   */
  get width(): number {
    return this._width;
  }

  /**
   * Get logical height (before DPR scaling)
   */
  get height(): number {
    return this._height;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    this.renderCallbacks.clear();
  }
}
