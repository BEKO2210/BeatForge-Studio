/**
 * Background System
 *
 * Provides customizable backgrounds for the visualizer canvas:
 * - Solid colors
 * - Linear and radial gradients
 * - Image backgrounds with fit options
 */

// Types and defaults
export type {
  SolidBackground,
  GradientStop,
  GradientBackground,
  ImageBackground,
  BackgroundConfig,
} from './types';

export {
  DEFAULT_BACKGROUND,
  DEFAULT_GRADIENT,
  DEFAULT_IMAGE,
} from './types';

// Renderer - exported in Task 2
// export { BackgroundRenderer } from './BackgroundRenderer';
