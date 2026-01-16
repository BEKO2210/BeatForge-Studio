/**
 * Background System Type Definitions
 *
 * Supports three background types: solid color, gradient, and image.
 */

/**
 * Solid color background
 */
export interface SolidBackground {
  type: 'solid';
  /** CSS color value (hex, rgb, hsl, etc.) */
  color: string;
}

/**
 * A single color stop in a gradient
 */
export interface GradientStop {
  /** CSS color value */
  color: string;
  /** Position in gradient (0-1) */
  position: number;
}

/**
 * Gradient background (linear or radial)
 */
export interface GradientBackground {
  type: 'gradient';
  /** Type of gradient */
  gradientType: 'linear' | 'radial';
  /** Angle in degrees (for linear gradients, 0 = top to bottom) */
  angle: number;
  /** Color stops defining the gradient */
  stops: GradientStop[];
}

/**
 * Image background with fit options
 */
export interface ImageBackground {
  type: 'image';
  /** Image source (data URL or blob URL) */
  src: string;
  /** How the image should fit the canvas */
  fit: 'cover' | 'contain' | 'stretch';
  /** Image opacity (0-1) */
  opacity: number;
}

/**
 * Union type for all background configurations
 */
export type BackgroundConfig = SolidBackground | GradientBackground | ImageBackground;

/**
 * Default background configuration - dark solid color
 */
export const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: 'solid',
  color: '#1a1a1a',
};

/**
 * Default gradient for when user switches to gradient mode
 */
export const DEFAULT_GRADIENT: GradientBackground = {
  type: 'gradient',
  gradientType: 'linear',
  angle: 180,
  stops: [
    { color: '#1a1a1a', position: 0 },
    { color: '#2d2d2d', position: 1 },
  ],
};

/**
 * Default image config for when user uploads an image
 */
export const DEFAULT_IMAGE: Omit<ImageBackground, 'src'> = {
  type: 'image',
  fit: 'cover',
  opacity: 1,
};
