import { useEffect, useRef } from 'react';
import type { VisualizerProps, CircularSettings } from './types';
import { DEFAULT_CIRCULAR_SETTINGS } from './types';
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
// Base rotation speed (radians per second)
const BASE_ROTATION_SPEED = 0.3;
// Number of bars for smooth circle - MUST cover full 360°
const BAR_COUNT = 128;
// Minimum bar height (percentage of max) - ensures NO dead zones
const MIN_BAR_HEIGHT = 0.03;

interface HistoryFrame {
  values: number[];
  timestamp: number;
}

/**
 * Interpolate frequency data to exactly BAR_COUNT values
 * Uses averaging for better representation than point sampling
 */
function interpolateFrequencyData(
  data: Float32Array,
  barCount: number,
  energySpread: 'linear' | 'log',
  sensitivity: number
): number[] {
  const result: number[] = [];
  const dataLength = data.length;

  for (let i = 0; i < barCount; i++) {
    // Normalized position (0 to 1)
    const normalizedPos = i / barCount;
    const nextNormalizedPos = (i + 1) / barCount;

    let startIndex: number;
    let endIndex: number;

    if (energySpread === 'log') {
      // Logarithmic mapping - more resolution for low frequencies
      // Maps 0-1 to frequency bins with log scale
      const logScale = (pos: number) => Math.pow(pos, 2);
      startIndex = Math.floor(logScale(normalizedPos) * dataLength);
      endIndex = Math.floor(logScale(nextNormalizedPos) * dataLength);
    } else {
      // Linear mapping - equal distribution
      startIndex = Math.floor(normalizedPos * dataLength);
      endIndex = Math.floor(nextNormalizedPos * dataLength);
    }

    // Ensure at least one sample
    endIndex = Math.max(endIndex, startIndex + 1);
    endIndex = Math.min(endIndex, dataLength);

    // Average the frequency bins in this range
    let sum = 0;
    let count = 0;
    for (let j = startIndex; j < endIndex; j++) {
      sum += data[j] ?? 0;
      count++;
    }

    // Apply sensitivity and ensure minimum height
    const avgValue = count > 0 ? sum / count : 0;
    const scaledValue = avgValue * (0.5 + sensitivity);

    // Apply minimum height - every bar is ALWAYS visible
    const finalValue = Math.max(MIN_BAR_HEIGHT, scaledValue);
    result.push(finalValue);
  }

  return result;
}

/**
 * Circular spectrum visualizer with rotation and fading trails
 *
 * GUARANTEED: Full 360° coverage with NO dead zones
 * Every bar is always visible with minimum height
 */
export function CircularSpectrumVisualizer({
  renderer,
  frequencyData,
  isBeat,
  beatIntensity,
  width,
  height,
  circularSettings,
}: VisualizerProps): null {
  // Merge with defaults
  const settings: CircularSettings = { ...DEFAULT_CIRCULAR_SETTINGS, ...circularSettings };

  // Use beat reaction hook for smooth animated value
  const reaction = useBeatReaction(isBeat, beatIntensity, { decayMs: 180 });

  // Store current data in refs for render callback
  const frequencyDataRef = useRef<Float32Array | null>(frequencyData);
  const reactionValueRef = useRef(reaction.value);
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  const settingsRef = useRef<CircularSettings>(settings);

  // History buffer for trails
  const historyRef = useRef<HistoryFrame[]>([]);
  // Start time for rotation calculation
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
    settingsRef.current = settings;

    // Accumulate rotation offset when beat is rising
    if (reaction.value > lastReactionRef.current && reaction.value > 0.5) {
      rotationOffsetRef.current += reaction.value * 0.05;
    }
    lastReactionRef.current = reaction.value;
  }, [frequencyData, reaction.value, width, height, settings]);

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
      const currentSettings = settingsRef.current;

      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;

      // Apply rotation speed multiplier and start angle
      const baseRotation = elapsed * BASE_ROTATION_SPEED * currentSettings.rotationSpeed;
      const startAngleRad = (currentSettings.startAngle * Math.PI) / 180;
      const rotation = baseRotation + rotationOffsetRef.current + startAngleRad;

      // Center and sizing
      const centerX = w / 2;
      const centerY = h / 2;
      const minDimension = Math.min(w, h);
      const baseRadius = minDimension * 0.18;
      const maxBarLength = minDimension * 0.38;

      // Smooth radius pulse on beat
      const radiusPulse = reactionValue * 20;
      const effectiveRadius = baseRadius + radiusPulse;

      // Beat-reactive line width
      const currentLineWidth = 2.5 + reactionValue * 1.5;

      // Get settings
      const { ringGap, barSpread, sensitivity, energySpread } = currentSettings;

      // Update history with current data
      const shouldUpdateHistory = now - lastHistoryUpdate >= historyUpdateInterval;
      if (shouldUpdateHistory && data) {
        lastHistoryUpdate = now;

        // Properly interpolate frequency data - NO DEAD ZONES
        const values = interpolateFrequencyData(data, BAR_COUNT, energySpread, sensitivity);

        // Add to history
        history.push({ values, timestamp: now });

        // Remove old frames
        while (history.length > TRAIL_LENGTH) {
          history.shift();
        }
      }

      // Draw outer ambient rings
      const outerRingRadius = baseRadius + maxBarLength + 20;
      for (let ring = 0; ring < 3; ring++) {
        const ringRadius = outerRingRadius + ring * 25;
        const ringAlpha = 0.03 + reactionValue * 0.05 * (1 - ring * 0.3);
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
        ctx.lineWidth = 1 + reactionValue * 2;
        ctx.stroke();
      }

      // Draw corner particles
      const cornerOffset = 40;
      const corners = [
        { x: cornerOffset, y: cornerOffset },
        { x: w - cornerOffset, y: cornerOffset },
        { x: cornerOffset, y: h - cornerOffset },
        { x: w - cornerOffset, y: h - cornerOffset },
      ];
      for (const corner of corners) {
        const dotSize = 2 + reactionValue * 4;
        const dotAlpha = 0.15 + reactionValue * 0.3;
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${dotAlpha})`;
        ctx.fill();
      }

      // Draw inner circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, effectiveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw trail history (older frames first, more transparent)
      for (let frameIdx = 0; frameIdx < history.length; frameIdx++) {
        const frame = history[frameIdx];
        if (!frame) continue;

        const frameAge = frameIdx / history.length;
        const alpha = frameAge * 0.6;
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
          2,
          ringGap,
          barSpread
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

      // Draw current frame
      if (data) {
        // Properly interpolate frequency data - NO DEAD ZONES
        const currentValues = interpolateFrequencyData(data, BAR_COUNT, energySpread, sensitivity);

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
          currentLineWidth,
          ringGap,
          barSpread
        );
      }

      // Draw rotating marker line
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

  return null;
}

/**
 * Draw a single frame of the circular spectrum
 *
 * CRITICAL: Draws ALL bars with NO skipping
 * Uses proper angle distribution for FULL 360° coverage
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
  lineWidth: number,
  ringGap: number = 0,
  barSpread: number = 1
): void {
  const sampleCount = values.length;

  // Apply ring gap - reduces the total angle covered (0 = full 360°)
  // ringGap of 0 = full circle, 1 = 30% gap
  const totalAngle = Math.PI * 2 * (1 - ringGap * 0.3);

  // Calculate arc width so bars touch and form solid ring
  // Each bar covers: totalAngle / sampleCount radians
  const anglePerBar = totalAngle / sampleCount;
  const arcWidthAtRadius = radius * anglePerBar * barSpread;
  const effectiveLineWidth = Math.max(lineWidth, arcWidthAtRadius * 1.3);

  // Draw ALL bars - NO SKIPPING
  for (let i = 0; i < sampleCount; i++) {
    const value = values[i] ?? MIN_BAR_HEIGHT;

    // CRITICAL: Proper angle distribution for full 360° coverage
    // Use (i + 0.5) to center each bar in its segment
    // This ensures the LAST bar doesn't leave a gap
    const angle = ((i + 0.5) / sampleCount) * totalAngle + rotation - Math.PI / 2;

    // Calculate bar length with minimum height
    const barLength = Math.max(value, MIN_BAR_HEIGHT) * maxBarLength;

    // Inner and outer points
    const innerX = centerX + Math.cos(angle) * radius;
    const innerY = centerY + Math.sin(angle) * radius;
    const outerX = centerX + Math.cos(angle) * (radius + barLength);
    const outerY = centerY + Math.sin(angle) * (radius + barLength);

    // Rainbow color based on position around circle
    const effectiveAlpha = isBeat ? Math.min(1, alpha * 1.3) : alpha;
    const color = getRainbowColor(i / sampleCount, effectiveAlpha);

    // Draw radial line - ALWAYS draws, never skips
    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.lineTo(outerX, outerY);
    ctx.strokeStyle = color;
    ctx.lineWidth = effectiveLineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}
