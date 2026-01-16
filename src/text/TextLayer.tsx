import { useEffect, useRef } from 'react';
import type { Renderer } from '../renderer/Renderer';
import type { TextLayer } from './types';
import { renderTextLayer } from './TextRenderer';
import { calculateTextAnimation, applyBeatEffects, type TextAnimationState } from './animations';
import { useBeatReaction } from '../hooks/useBeatReaction';

/** Beat-reactive animation types that use beat data directly */
const BEAT_ANIMATIONS = new Set(['pulse', 'shake', 'wobble', 'glow']);

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
  // Smooth beat reaction with fast decay for punchy effects
  // Increased sensitivity for more visible reactions
  const reaction = useBeatReaction(isBeat, beatIntensity, {
    decayMs: 150, // Slightly longer decay for smoother animation
    threshold: 0.03, // Lower threshold to catch more beats
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
      const now = Date.now();

      // Render each visible layer
      for (const layer of currentLayers) {
        if (!layer.visible) continue;

        // Calculate time since layer was created (in milliseconds)
        const timeSinceCreation = now - layer.createdAt;

        // Get beat effect settings
        const settings = layer.beatEffects;

        // Calculate animation state
        let animationState: TextAnimationState;

        if (BEAT_ANIMATIONS.has(layer.animation)) {
          // Beat-reactive animations: pass beat reaction directly
          animationState = calculateTextAnimation(
            layer.animation,
            timeSinceCreation,
            beatReaction,
            settings,
            now
          );
        } else {
          // Non-beat animations: pass beat only if beatReactive is enabled
          const beatValue = layer.beatReactive ? beatReaction : 0;
          animationState = calculateTextAnimation(
            layer.animation,
            timeSinceCreation,
            beatValue,
            settings,
            now
          );

          // If beatReactive is enabled and beat is active, apply additional effects
          if (layer.beatReactive && beatReaction > 0.01) {
            animationState = applyBeatEffects(
              animationState,
              beatReaction,
              settings,
              now
            );
          }
        }

        // Render the text layer
        renderTextLayer(ctx, layer, w, h, animationState);
      }
    };

    // Register with 'text' layer to always render on top
    const unsubscribe = renderer.onRender(renderCallback, 'text');
    return unsubscribe;
  }, [renderer]);

  // Headless component - renders nothing, only registers callback
  return null;
}
