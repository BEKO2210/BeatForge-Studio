import { useEffect, useRef } from 'react';
import type { VisualizerProps } from './types';
import { useBeatReaction } from '../hooks/useBeatReaction';

/**
 * Waveform visualizer - displays audio waveform as continuous line
 */
export function WaveformVisualizer({
  renderer,
  timeDomainData,
  isBeat,
  beatIntensity,
  width,
  height,
}: VisualizerProps): null {
  // Use beat reaction hook for smooth animated value (200ms decay for waveform smoothness)
  const reaction = useBeatReaction(isBeat, beatIntensity, { decayMs: 200 });

  // Store current data in refs for render callback
  const timeDomainDataRef = useRef<Float32Array | null>(timeDomainData);
  const reactionValueRef = useRef(reaction.value);
  const widthRef = useRef(width);
  const heightRef = useRef(height);

  // Update refs when props change
  useEffect(() => {
    timeDomainDataRef.current = timeDomainData;
    reactionValueRef.current = reaction.value;
    widthRef.current = width;
    heightRef.current = height;
  }, [timeDomainData, reaction.value, width, height]);

  useEffect(() => {
    if (!renderer) return;

    const renderCallback = (ctx: CanvasRenderingContext2D) => {
      const data = timeDomainDataRef.current;
      if (!data) return;

      const w = widthRef.current;
      const h = heightRef.current;
      const reactionValue = reactionValueRef.current;

      const centerY = h / 2;
      const baseAmplitude = h * 0.45; // Wave uses 90% of height total
      const sampleCount = Math.min(400, data.length);
      const step = Math.floor(data.length / sampleCount);

      // Beat-reactive amplitude: up to 15% taller on strong beat
      const amplitudeBoost = 1 + reactionValue * 0.15;
      const amplitude = baseAmplitude * amplitudeBoost;

      // Draw background waveform grid for "alive" feel
      ctx.strokeStyle = `rgba(0, 255, 136, ${0.05 + reactionValue * 0.05})`;
      ctx.lineWidth = 1;
      const gridLines = 6;
      for (let g = 1; g < gridLines; g++) {
        const gy = (h / gridLines) * g;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Beat-reactive line width: 2.5 → 4.5 on beat
      const lineWidth = 2.5 + reactionValue * 2;

      // Beat-reactive color: brightness increases on beat (50% → 70% lightness)
      const hue = 150; // Green base
      const lightness = 50 + reactionValue * 20;
      const lineColor = `hsl(${hue}, 85%, ${lightness}%)`;

      // Apply glow effect on beat
      if (reactionValue > 0.1) {
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = reactionValue * 15;
      }

      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      for (let i = 0; i < sampleCount; i++) {
        const dataIndex = i * step;
        const value = data[dataIndex] ?? 0;
        const x = (i / sampleCount) * w;
        const y = centerY + value * amplitude;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Clear glow effect before drawing mirror
      ctx.shadowBlur = 0;

      // Mirror reflection (subtle, below center) - also reacts but more subtly
      const mirrorReaction = reactionValue * 0.5; // Half the effect for mirror
      const mirrorAlpha = 0.25 + mirrorReaction * 0.1;
      const mirrorLightness = 45 + mirrorReaction * 10;

      ctx.beginPath();
      ctx.strokeStyle = `hsla(${hue}, 85%, ${mirrorLightness}%, ${mirrorAlpha})`;
      ctx.lineWidth = lineWidth * 0.8;

      for (let i = 0; i < sampleCount; i++) {
        const dataIndex = i * step;
        const value = data[dataIndex] ?? 0;
        const x = (i / sampleCount) * w;
        // Mirror: invert the value displacement, also affected by amplitude boost
        const y = centerY - value * amplitude * 0.5;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    const unsubscribe = renderer.onRender(renderCallback);
    return unsubscribe;
  }, [renderer]);

  // This component only registers render callbacks, renders nothing
  return null;
}
