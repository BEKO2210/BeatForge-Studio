import { useEffect, useRef } from 'react';
import type { Renderer } from '../renderer/Renderer';
import type { TextLayer } from './types';
import { renderTextLayer } from './TextRenderer';
import { calculateTextAnimation } from './animations';
import { useBeatReaction } from '../hooks/useBeatReaction';

/**
 * Props for TextLayerRenderer component
 */
export interface TextLayerRendererProps {
  /** Renderer instance to register render callback with */
  renderer: Renderer | null;
  /** Array of text layers to render */
  layers: TextLayer[];
  /** Whether a beat was detected this frame */
  isBeat: boolean;
  /** Beat intensity 0-1 */
  beatIntensity: number;
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
}

/**
 * TextLayerRenderer - Renders text layers on canvas
 *
 * Follows the same headless render callback pattern as visualizers.
 * Registers a render callback with the renderer and draws text layers
 * with animations and beat-reactive effects.
 */
export function TextLayerRenderer({
  renderer,
  layers,
  isBeat,
  beatIntensity,
  width,
  height,
}: TextLayerRendererProps): null {
  // Smooth beat reaction for pulse animation
  const reaction = useBeatReaction(isBeat, beatIntensity, {
    decayMs: 150,
    threshold: 0.1,
  });

  // Store current values in refs for render callback
  const layersRef = useRef<TextLayer[]>(layers);
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  const reactionValueRef = useRef(reaction.value);

  // Update refs when props change
  useEffect(() => {
    layersRef.current = layers;
    widthRef.current = width;
    heightRef.current = height;
    reactionValueRef.current = reaction.value;
  }, [layers, width, height, reaction.value]);

  // Register render callback with renderer
  useEffect(() => {
    if (!renderer) return;

    const renderCallback = (ctx: CanvasRenderingContext2D) => {
      const currentLayers = layersRef.current;
      const w = widthRef.current;
      const h = heightRef.current;
      const beatReaction = reactionValueRef.current;

      // Render each visible layer
      for (const layer of currentLayers) {
        if (!layer.visible) continue;

        // Calculate animation state
        // Progress is 1 (fully visible) for now - timing will be added in effects phase
        const progress = 1;

        // Use beat reaction value for pulse animation or beat-reactive layers
        const effectiveBeatReaction = layer.beatReactive ? beatReaction : 0;

        const animationState = calculateTextAnimation(
          layer.animation,
          progress,
          effectiveBeatReaction
        );

        // Render the text layer
        renderTextLayer(ctx, layer, w, h, animationState);
      }
    };

    const unsubscribe = renderer.onRender(renderCallback);
    return unsubscribe;
  }, [renderer]);

  // Headless component - renders nothing, only registers callback
  return null;
}
