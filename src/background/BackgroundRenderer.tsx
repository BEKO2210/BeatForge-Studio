import { useEffect, useRef } from 'react';
import type { Renderer } from '../renderer/Renderer';
import type { BackgroundConfig, GradientBackground } from './types';

/**
 * Props for BackgroundRenderer component
 */
export interface BackgroundRendererProps {
  /** Renderer instance to register render callback with */
  renderer: Renderer | null;
  /** Current background configuration */
  config: BackgroundConfig;
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
}

/**
 * Calculate linear gradient start and end points based on angle
 * Angle: 0 = top to bottom, 90 = left to right, etc.
 */
function getLinearGradientPoints(
  width: number,
  height: number,
  angleDeg: number
): [number, number, number, number] {
  const angleRad = (angleDeg - 90) * (Math.PI / 180);
  const centerX = width / 2;
  const centerY = height / 2;

  // Calculate the diagonal length to ensure gradient covers entire canvas
  const diagonal = Math.sqrt(width * width + height * height) / 2;

  const x1 = centerX - Math.cos(angleRad) * diagonal;
  const y1 = centerY - Math.sin(angleRad) * diagonal;
  const x2 = centerX + Math.cos(angleRad) * diagonal;
  const y2 = centerY + Math.sin(angleRad) * diagonal;

  return [x1, y1, x2, y2];
}

/**
 * Create a canvas gradient from config
 */
function createGradient(
  ctx: CanvasRenderingContext2D,
  config: GradientBackground,
  width: number,
  height: number
): CanvasGradient {
  let gradient: CanvasGradient;

  if (config.gradientType === 'radial') {
    // Radial gradient from center
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(width, height) / 2;
    gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  } else {
    // Linear gradient with angle
    const [x1, y1, x2, y2] = getLinearGradientPoints(width, height, config.angle);
    gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  }

  // Add color stops
  for (const stop of config.stops) {
    gradient.addColorStop(stop.position, stop.color);
  }

  return gradient;
}

/**
 * Calculate image drawing parameters for different fit modes
 */
function getImageDrawParams(
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  fit: 'cover' | 'contain' | 'stretch'
): [number, number, number, number] {
  if (fit === 'stretch') {
    return [0, 0, canvasWidth, canvasHeight];
  }

  const imgRatio = img.width / img.height;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth: number;
  let drawHeight: number;

  if (fit === 'cover') {
    // Scale to fill, may crop
    if (imgRatio > canvasRatio) {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
    } else {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
    }
  } else {
    // contain: Scale to fit, may letterbox
    if (imgRatio > canvasRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
    }
  }

  // Center the image
  const x = (canvasWidth - drawWidth) / 2;
  const y = (canvasHeight - drawHeight) / 2;

  return [x, y, drawWidth, drawHeight];
}

/**
 * BackgroundRenderer - Renders background on canvas
 *
 * Follows the headless render callback pattern like visualizers.
 * Registers with the 'background' layer to render behind everything.
 *
 * Supports:
 * - Solid color backgrounds
 * - Linear and radial gradients with multiple stops
 * - Image backgrounds with cover/contain/stretch fit modes
 */
export function BackgroundRenderer({
  renderer,
  config,
  width,
  height,
}: BackgroundRendererProps): null {
  // Store loaded image for image backgrounds
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageSrcRef = useRef<string>('');

  // Store current config in ref for render callback
  const configRef = useRef<BackgroundConfig>(config);
  const widthRef = useRef(width);
  const heightRef = useRef(height);

  // Update refs when props change
  useEffect(() => {
    configRef.current = config;
    widthRef.current = width;
    heightRef.current = height;
  }, [config, width, height]);

  // Load image when config changes to image type
  useEffect(() => {
    if (config.type !== 'image') {
      imageRef.current = null;
      imageSrcRef.current = '';
      return;
    }

    // Skip if same image already loaded
    if (imageSrcRef.current === config.src && imageRef.current) {
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      imageSrcRef.current = config.src;
    };
    img.onerror = () => {
      // On error, clear image (will fall back to solid color)
      imageRef.current = null;
      imageSrcRef.current = '';
    };
    img.src = config.src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [config]);

  // Register render callback with renderer
  useEffect(() => {
    if (!renderer) return;

    const renderCallback = (ctx: CanvasRenderingContext2D) => {
      const currentConfig = configRef.current;
      const w = widthRef.current;
      const h = heightRef.current;

      switch (currentConfig.type) {
        case 'solid':
          // Simple solid color fill
          ctx.fillStyle = currentConfig.color;
          ctx.fillRect(0, 0, w, h);
          break;

        case 'gradient':
          // Gradient fill
          const gradient = createGradient(ctx, currentConfig, w, h);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, w, h);
          break;

        case 'image':
          // Image background with fit mode
          const img = imageRef.current;
          if (img && img.complete) {
            // Apply opacity
            const prevAlpha = ctx.globalAlpha;
            ctx.globalAlpha = currentConfig.opacity;

            // Draw image with fit mode
            const [x, y, drawWidth, drawHeight] = getImageDrawParams(
              img,
              w,
              h,
              currentConfig.fit
            );
            ctx.drawImage(img, x, y, drawWidth, drawHeight);

            // Restore alpha
            ctx.globalAlpha = prevAlpha;
          } else {
            // Fallback to dark color while loading or on error
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, w, h);
          }
          break;
      }
    };

    // Register with 'background' layer (priority 0 - renders first)
    const unsubscribe = renderer.onRender(renderCallback, 'background');
    return unsubscribe;
  }, [renderer]);

  // Headless component - renders nothing
  return null;
}
