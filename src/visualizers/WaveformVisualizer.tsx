import { useEffect, useRef } from 'react';
import type { VisualizerProps } from './types';

/**
 * Waveform visualizer - displays audio waveform as continuous line
 */
export function WaveformVisualizer({
  renderer,
  timeDomainData,
  isBeat,
  width,
  height,
}: VisualizerProps): null {
  // Store current data in refs for render callback
  const timeDomainDataRef = useRef<Float32Array | null>(null);
  const isBeatRef = useRef(false);
  const widthRef = useRef(width);
  const heightRef = useRef(height);

  // Update refs when props change
  timeDomainDataRef.current = timeDomainData;
  isBeatRef.current = isBeat;
  widthRef.current = width;
  heightRef.current = height;

  useEffect(() => {
    if (!renderer) return;

    const renderCallback = (ctx: CanvasRenderingContext2D) => {
      const data = timeDomainDataRef.current;
      if (!data) return;

      const w = widthRef.current;
      const h = heightRef.current;
      const beat = isBeatRef.current;

      const centerY = h / 2;
      const amplitude = h * 0.4; // Wave uses 80% of height total
      const sampleCount = Math.min(400, data.length);
      const step = Math.floor(data.length / sampleCount);

      // Main waveform line
      const lineWidth = beat ? 3.5 : 2.5;
      const lineColor = beat ? '#00ffaa' : '#00ff88';

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

      // Mirror reflection (subtle, below center)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.25)';
      ctx.lineWidth = lineWidth * 0.8;

      for (let i = 0; i < sampleCount; i++) {
        const dataIndex = i * step;
        const value = data[dataIndex] ?? 0;
        const x = (i / sampleCount) * w;
        // Mirror: invert the value displacement
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
