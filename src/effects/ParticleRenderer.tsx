import { useEffect, useRef, useCallback } from 'react';
import type { Renderer } from '../renderer/Renderer';
import { ParticleSystem } from './particles';

interface ParticleRendererProps {
  renderer: Renderer | null;
  isBeat: boolean;
  beatIntensity: number;
  width: number;
  height: number;
  enabled?: boolean;
}

/**
 * React component that renders particles using the particle system.
 * Emits particles on beats and renders them as circles that fade out.
 */
export function ParticleRenderer({
  renderer,
  isBeat,
  beatIntensity,
  width,
  height,
  enabled = true,
}: ParticleRendererProps) {
  // Create particle system once
  const systemRef = useRef<ParticleSystem | null>(null);

  // Initialize particle system
  if (!systemRef.current) {
    systemRef.current = new ParticleSystem();
  }

  // Emit particles on beats
  useEffect(() => {
    if (!enabled || !isBeat || !systemRef.current) return;

    // Emit from canvas center
    const centerX = width / 2;
    const centerY = height / 2;
    systemRef.current.emit(centerX, centerY, beatIntensity);
  }, [isBeat, beatIntensity, width, height, enabled]);

  // Render callback for particles
  const renderParticles = useCallback(
    (ctx: CanvasRenderingContext2D, deltaTime: number) => {
      if (!enabled || !systemRef.current) return;

      // Update particle physics
      systemRef.current.update(deltaTime);

      // Get active particles
      const particles = systemRef.current.getActiveParticles();

      // Render each particle
      for (const p of particles) {
        ctx.globalAlpha = p.life; // Fade out as life decreases
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // Size shrinks as particle ages
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }

      // Reset alpha
      ctx.globalAlpha = 1;
    },
    [enabled]
  );

  // Register render callback
  useEffect(() => {
    if (!renderer) return;

    // Register at overlay layer (after visualizers, before text)
    // Use priority slightly below vignette so particles appear under vignette
    return renderer.onRender(renderParticles, 'overlay');
  }, [renderer, renderParticles]);

  // Clear particles when disabled
  useEffect(() => {
    if (!enabled && systemRef.current) {
      systemRef.current.clear();
    }
  }, [enabled]);

  return null; // Render-only component
}
