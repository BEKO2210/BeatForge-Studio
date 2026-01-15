import { useEffect, useRef } from 'react';
import type { VisualizerProps } from './types';

/**
 * Get rainbow color for angle around circle (0-1 maps to full hue cycle)
 */
function getRainbowColor(position: number): string {
  const hue = position * 360;
  return `hsl(${hue}, 85%, 55%)`;
}

/**
 * Circular spectrum visualizer - displays frequency data as radial pattern
 */
export function CircularSpectrumVisualizer({
  renderer,
  frequencyData,
  isBeat,
  beatIntensity,
  width,
  height,
}: VisualizerProps): null {
  // Store current data in refs for render callback
  const frequencyDataRef = useRef<Float32Array | null>(null);
  const isBeatRef = useRef(false);
  const beatIntensityRef = useRef(0);
  const widthRef = useRef(width);
  const heightRef = useRef(height);

  // Update refs when props change
  frequencyDataRef.current = frequencyData;
  isBeatRef.current = isBeat;
  beatIntensityRef.current = beatIntensity;
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
      const intensity = beatIntensityRef.current;

      // Center and sizing
      const centerX = w / 2;
      const centerY = h / 2;
      const minDimension = Math.min(w, h);
      const baseRadius = minDimension * 0.15;
      const maxBarLength = minDimension * 0.3;

      // Pulse radius on beat
      const radiusPulse = beat ? intensity * 15 : 0;
      const effectiveRadius = baseRadius + radiusPulse;

      // Draw faint inner circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, effectiveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sample frequency data around circle
      const sampleCount = 128;
      const stride = Math.floor(data.length / sampleCount);
      const lineWidth = beat ? 3 : 2;

      for (let i = 0; i < sampleCount; i++) {
        const dataIndex = i * stride;
        const value = data[dataIndex] ?? 0;

        // Angle in radians (start from top, go clockwise)
        const angle = (i / sampleCount) * Math.PI * 2 - Math.PI / 2;

        // Calculate bar length
        const barLength = value * maxBarLength;

        // Inner and outer points
        const innerX = centerX + Math.cos(angle) * effectiveRadius;
        const innerY = centerY + Math.sin(angle) * effectiveRadius;
        const outerX = centerX + Math.cos(angle) * (effectiveRadius + barLength);
        const outerY = centerY + Math.sin(angle) * (effectiveRadius + barLength);

        // Rainbow color based on position around circle
        const color = getRainbowColor(i / sampleCount);

        // Draw radial line
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    };

    const unsubscribe = renderer.onRender(renderCallback);
    return unsubscribe;
  }, [renderer]);

  // This component only registers render callbacks, renders nothing
  return null;
}
