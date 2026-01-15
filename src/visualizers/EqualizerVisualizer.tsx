import { useEffect, useRef } from 'react';
import type { VisualizerProps } from './types';
import { drawRect } from '../renderer/shapes';

/**
 * Get color for frequency bar based on position (0 = bass, 1 = treble)
 * Gradient: red/orange (bass) -> green (mid) -> blue/purple (treble)
 */
function getBarColor(position: number, brightness: number = 1): string {
  // HSL color wheel: red(0) -> green(120) -> blue(240)
  const hue = position * 240;
  const saturation = 80;
  const lightness = 45 * brightness;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Equalizer bars visualizer - displays frequency data as vertical bars
 */
export function EqualizerVisualizer({
  renderer,
  frequencyData,
  isBeat,
  width,
  height,
}: VisualizerProps): null {
  // Store current data in refs for render callback
  const frequencyDataRef = useRef<Float32Array | null>(null);
  const isBeatRef = useRef(false);
  const widthRef = useRef(width);
  const heightRef = useRef(height);

  // Update refs when props change
  frequencyDataRef.current = frequencyData;
  isBeatRef.current = isBeat;
  widthRef.current = width;
  heightRef.current = height;

  useEffect(() => {
    if (!renderer) return;

    const renderCallback = (ctx: CanvasRenderingContext2D) => {
      const data = frequencyDataRef.current;
      if (!data) return;

      const w = widthRef.current;
      const h = heightRef.current;
      const beat = isBeatRef.current;

      const barCount = 64;
      const gap = 2;
      const barWidth = (w - gap * (barCount - 1)) / barCount;
      const maxHeight = h * 0.8;

      // Sample frequency data evenly
      const stride = Math.floor(data.length / barCount);

      for (let i = 0; i < barCount; i++) {
        const dataIndex = i * stride;
        const value = data[dataIndex] ?? 0;

        // Calculate bar dimensions
        const barHeight = Math.max(2, value * maxHeight);
        const x = i * (barWidth + gap);
        const y = h - barHeight;

        // Color based on position (frequency band)
        const position = i / barCount;
        const brightness = beat ? 1.3 : 1;
        const color = getBarColor(position, brightness);

        drawRect(ctx, x, y, barWidth, barHeight, {
          fillColor: color,
          cornerRadius: 2,
        });
      }
    };

    const unsubscribe = renderer.onRender(renderCallback);
    return unsubscribe;
  }, [renderer]);

  // This component only registers render callbacks, renders nothing
  return null;
}
