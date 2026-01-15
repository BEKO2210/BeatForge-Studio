import { useEffect, useRef } from 'react';
import type { VisualizerProps } from './types';
import { useBeatReaction } from '../hooks/useBeatReaction';

/**
 * Get rainbow color for angle around circle (0-1 maps to full hue cycle)
 */
function getRainbowColor(position: number, alpha: number = 1): string {
  const hue = position * 360;
  return `hsla(${hue}, 85%, 55%, ${alpha})`;
}

// Number of frames to keep in trail history
const TRAIL_LENGTH = 12;
// Rotation speed (radians per second)
const ROTATION_SPEED = 0.3;

interface HistoryFrame {
  values: number[];
  timestamp: number;
}

/**
 * Circular spectrum visualizer with rotation and fading trails
 * Creates a sense of temporal progression as the visualization rotates
 * and past audio data fades away
 */
export function CircularSpectrumVisualizer({
  renderer,
  frequencyData,
  isBeat,
  beatIntensity,
  width,
  height,
}: VisualizerProps): null {
  // Use beat reaction hook for smooth animated value (180ms decay for responsive feel)
  const reaction = useBeatReaction(isBeat, beatIntensity, { decayMs: 180 });

  // Store current data in refs for render callback
  const frequencyDataRef = useRef<Float32Array | null>(frequencyData);
  const reactionValueRef = useRef(reaction.value);
  const widthRef = useRef(width);
  const heightRef = useRef(height);

  // History buffer for trails
  const historyRef = useRef<HistoryFrame[]>([]);
  // Start time for rotation calculation (initialized in effect)
  const startTimeRef = useRef<number>(0);
  // Accumulated rotation offset from beat jumps
  const rotationOffsetRef = useRef<number>(0);
  const lastReactionRef = useRef<number>(0);

  // Update refs when props change
  useEffect(() => {
    frequencyDataRef.current = frequencyData;
    reactionValueRef.current = reaction.value;
    widthRef.current = width;
    heightRef.current = height;

    // Accumulate rotation offset when beat is rising
    if (reaction.value > lastReactionRef.current && reaction.value > 0.5) {
      rotationOffsetRef.current += reaction.value * 0.05;
    }
    lastReactionRef.current = reaction.value;
  }, [frequencyData, reaction.value, width, height]);

  useEffect(() => {
    if (!renderer) return;

    // Initialize start time on first render
    if (startTimeRef.current === 0) {
      startTimeRef.current = performance.now();
    }

    let lastHistoryUpdate = 0;
    const historyUpdateInterval = 1000 / 20; // 20 fps for trail updates

    const renderCallback = (ctx: CanvasRenderingContext2D) => {
      const data = frequencyDataRef.current;
      const w = widthRef.current;
      const h = heightRef.current;
      const reactionValue = reactionValueRef.current;
      const history = historyRef.current;

      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;

      // Rotation angle based on elapsed time + beat-triggered offsets
      const baseRotation = elapsed * ROTATION_SPEED;
      const rotation = baseRotation + rotationOffsetRef.current;

      // Center and sizing
      const centerX = w / 2;
      const centerY = h / 2;
      const minDimension = Math.min(w, h);
      const baseRadius = minDimension * 0.15;
      const maxBarLength = minDimension * 0.3;

      // Smooth radius pulse: 0-20px based on eased reaction value
      const radiusPulse = reactionValue * 20;
      const effectiveRadius = baseRadius + radiusPulse;

      // Beat-reactive line width for current frame: 2.5 → 4 on beat
      const currentLineWidth = 2.5 + reactionValue * 1.5;

      // Update history with current data
      const shouldUpdateHistory = now - lastHistoryUpdate >= historyUpdateInterval;
      if (shouldUpdateHistory && data) {
        lastHistoryUpdate = now;

        // Sample current frequency data
        const sampleCount = 64;
        const stride = Math.floor(data.length / sampleCount);
        const values: number[] = [];

        for (let i = 0; i < sampleCount; i++) {
          const dataIndex = i * stride;
          values.push(data[dataIndex] ?? 0);
        }

        // Add to history
        history.push({ values, timestamp: now });

        // Remove old frames
        while (history.length > TRAIL_LENGTH) {
          history.shift();
        }
      }

      // Draw faint inner circle (rotates with visualization)
      ctx.beginPath();
      ctx.arc(centerX, centerY, effectiveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw trail history (older frames first, more transparent)
      for (let frameIdx = 0; frameIdx < history.length; frameIdx++) {
        const frame = history[frameIdx];
        if (!frame) continue;

        const frameAge = frameIdx / history.length; // 0 = oldest, 1 = newest
        const alpha = frameAge * 0.6; // Older = more transparent

        // Each historical frame gets a slight rotation offset for spiral effect
        const frameRotation = rotation - (history.length - frameIdx) * 0.02;

        drawFrame(
          ctx,
          frame.values,
          centerX,
          centerY,
          effectiveRadius,
          maxBarLength,
          frameRotation,
          alpha,
          false,
          2
        );
      }

      // Draw center glow effect on beat
      if (reactionValue > 0.15) {
        const glowRadius = effectiveRadius * 0.8;
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, glowRadius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${reactionValue * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw current frame (if we have data)
      if (data) {
        const sampleCount = 64;
        const stride = Math.floor(data.length / sampleCount);
        const currentValues: number[] = [];

        for (let i = 0; i < sampleCount; i++) {
          const dataIndex = i * stride;
          currentValues.push(data[dataIndex] ?? 0);
        }

        // Use smooth reaction value for beat effect instead of binary beat
        const isReacting = reactionValue > 0.1;
        drawFrame(
          ctx,
          currentValues,
          centerX,
          centerY,
          effectiveRadius,
          maxBarLength,
          rotation,
          1,
          isReacting,
          currentLineWidth
        );
      }

      // Draw rotating marker line to emphasize rotation
      const markerAngle = rotation - Math.PI / 2;
      const markerInnerRadius = effectiveRadius - 5;
      const markerOuterRadius = effectiveRadius + 5;
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(markerAngle) * markerInnerRadius,
        centerY + Math.sin(markerAngle) * markerInnerRadius
      );
      ctx.lineTo(
        centerX + Math.cos(markerAngle) * markerOuterRadius,
        centerY + Math.sin(markerAngle) * markerOuterRadius
      );
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const unsubscribe = renderer.onRender(renderCallback);
    return unsubscribe;
  }, [renderer]);

  // This component only registers render callbacks, renders nothing
  return null;
}

/**
 * Draw a single frame of the circular spectrum
 */
function drawFrame(
  ctx: CanvasRenderingContext2D,
  values: number[],
  centerX: number,
  centerY: number,
  radius: number,
  maxBarLength: number,
  rotation: number,
  alpha: number,
  isBeat: boolean,
  lineWidth: number
): void {
  const sampleCount = values.length;

  for (let i = 0; i < sampleCount; i++) {
    const value = values[i] ?? 0;
    if (value < 0.02) continue; // Skip very quiet values

    // Angle in radians (with rotation offset)
    const angle = (i / sampleCount) * Math.PI * 2 + rotation - Math.PI / 2;

    // Calculate bar length
    const barLength = value * maxBarLength;

    // Inner and outer points
    const innerX = centerX + Math.cos(angle) * radius;
    const innerY = centerY + Math.sin(angle) * radius;
    const outerX = centerX + Math.cos(angle) * (radius + barLength);
    const outerY = centerY + Math.sin(angle) * (radius + barLength);

    // Rainbow color based on position around circle
    const effectiveAlpha = isBeat ? Math.min(1, alpha * 1.3) : alpha;
    const color = getRainbowColor(i / sampleCount, effectiveAlpha);

    // Draw radial line
    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.lineTo(outerX, outerY);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}
