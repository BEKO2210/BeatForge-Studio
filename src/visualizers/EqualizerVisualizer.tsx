import { useEffect, useRef } from 'react';
import type { VisualizerProps } from './types';
import { useBeatReaction } from '../hooks/useBeatReaction';

/**
 * Get color for frequency bar based on frequency position and intensity
 * Gradient: red/orange (bass) -> green (mid) -> blue/purple (treble)
 */
function getBarColor(freqPosition: number, intensity: number, brightness: number = 1): string {
  // HSL color wheel: red(0) -> green(120) -> blue(240)
  const hue = freqPosition * 240;
  const saturation = 70 + intensity * 30; // More saturated at higher intensity
  const lightness = Math.min(60, 30 + intensity * 40) * brightness;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Number of frequency bands (rows)
const FREQ_BANDS = 32;
// Number of time columns in history
const HISTORY_LENGTH = 80;

/**
 * Scrolling equalizer visualizer - frequency data flows left over time
 * Creates a spectrogram-like effect where music "passes through" the visualizer
 * Enhanced with smooth beat-reactive pulse effects
 */
export function EqualizerVisualizer({
  renderer,
  frequencyData,
  isBeat,
  beatIntensity,
  width,
  height,
}: VisualizerProps): null {
  // Smooth beat reaction with 150ms decay
  const reaction = useBeatReaction(isBeat, beatIntensity, {
    decayMs: 150,
    threshold: 0.1,
  });

  // Store current data in refs for render callback
  const frequencyDataRef = useRef<Float32Array | null>(frequencyData);
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  const reactionValueRef = useRef(reaction.value);

  // History buffer: 2D array [time][frequency] storing intensity values
  // Initialize with empty arrays to avoid ref access during render
  const historyRef = useRef<number[][]>(
    Array.from({ length: HISTORY_LENGTH }, () => new Array(FREQ_BANDS).fill(0))
  );

  // Update refs when props change
  useEffect(() => {
    frequencyDataRef.current = frequencyData;
    widthRef.current = width;
    heightRef.current = height;
    reactionValueRef.current = reaction.value;
  }, [frequencyData, width, height, reaction.value]);

  useEffect(() => {
    if (!renderer) return;

    let lastUpdateTime = 0;
    const updateInterval = 1000 / 30; // Update history at 30 fps for smooth scrolling

    const renderCallback = (ctx: CanvasRenderingContext2D) => {
      const data = frequencyDataRef.current;
      const w = widthRef.current;
      const h = heightRef.current;
      const beatReaction = reactionValueRef.current;
      const history = historyRef.current;

      const now = performance.now();
      const shouldUpdate = now - lastUpdateTime >= updateInterval;

      // Update history with new data (scroll left, add new column on right)
      if (shouldUpdate && data) {
        lastUpdateTime = now;

        // Shift history left (remove oldest column)
        history.shift();

        // Sample current frequency data into bands and add as new column
        const newColumn: number[] = [];
        const stride = Math.floor(data.length / FREQ_BANDS);

        for (let f = 0; f < FREQ_BANDS; f++) {
          const dataIndex = f * stride;
          const value = data[dataIndex] ?? 0;
          newColumn.push(value);
        }

        history.push(newColumn);
      }

      // Calculate cell dimensions with beat-reactive scale
      const scaleBoost = 1 + beatReaction * 0.15; // Up to 15% taller on beat
      const cellWidth = w / HISTORY_LENGTH;
      const baseCellHeight = h / FREQ_BANDS;
      const gap = 1;

      // Enable glow effect when beat reaction is active
      if (beatReaction > 0.1) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = beatReaction * 10;
      }

      // Draw the history grid (time flows left to right, frequency bottom to top)
      for (let t = 0; t < HISTORY_LENGTH; t++) {
        const column = history[t];
        if (!column) continue;

        // Fade older columns slightly for depth
        const age = 1 - t / HISTORY_LENGTH;
        const ageFade = 0.3 + age * 0.7; // Older = dimmer

        // Apply beat reaction to recent columns (rightmost 10 columns)
        const isRecent = t > HISTORY_LENGTH - 10;
        const recentFactor = isRecent ? (t - (HISTORY_LENGTH - 10)) / 10 : 0;

        for (let f = 0; f < FREQ_BANDS; f++) {
          const intensity = column[f] ?? 0;
          if (intensity < 0.02) continue; // Skip very quiet cells

          const x = t * cellWidth;

          // Apply scale boost to recent columns based on beat reaction
          const cellScale = isRecent ? 1 + (scaleBoost - 1) * recentFactor : 1;
          const cellHeight = baseCellHeight * cellScale;

          // Flip Y so bass is at bottom, adjust for scale
          const y = h - (f + 1) * baseCellHeight - (cellHeight - baseCellHeight) / 2;

          // Brightness boost: smooth decay based on beat reaction and column recency
          const brightnessBoost = isRecent ? 1 + beatReaction * 0.4 * recentFactor : 1;
          const color = getBarColor(f / FREQ_BANDS, intensity, brightnessBoost * ageFade);

          ctx.fillStyle = color;
          ctx.fillRect(x + gap / 2, y + gap / 2, cellWidth - gap, cellHeight - gap);
        }
      }

      // Clear shadow after drawing cells
      ctx.shadowBlur = 0;

      // Draw a subtle glow line at the "now" edge (rightmost)
      // Enhanced glow on beat
      const glowIntensity = 0.1 + beatReaction * 0.2;
      const glowGradient = ctx.createLinearGradient(w - 20, 0, w, 0);
      glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      glowGradient.addColorStop(1, `rgba(255, 255, 255, ${glowIntensity})`);
      ctx.fillStyle = glowGradient;
      ctx.fillRect(w - 20, 0, 20, h);
    };

    const unsubscribe = renderer.onRender(renderCallback);
    return unsubscribe;
  }, [renderer]);

  // This component only registers render callbacks, renders nothing
  return null;
}
