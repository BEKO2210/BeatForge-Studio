import { useEffect, useRef } from 'react';
import type { VisualizerProps, ClubSettings } from './types';
import { DEFAULT_CLUB_SETTINGS } from './types';
import { useBeatReaction } from '../hooks/useBeatReaction';

/**
 * Get color for frequency bar - bass-focused gradient
 * Red/orange for bass, transitioning through the spectrum
 */
function getBarColor(freqPosition: number, intensity: number, beatReaction: number): string {
  // Bass frequencies (low) get warm colors (red/orange)
  // Higher frequencies get cooler colors
  const hue = freqPosition * 280; // Red -> Blue
  const saturation = 80 + intensity * 20;
  // Brightness pulses with beat
  const baseLightness = 40 + intensity * 35;
  const beatBoost = beatReaction * 25;
  const lightness = Math.min(80, baseLightness + beatBoost);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get glow color for bass frequencies
 */
function getGlowColor(intensity: number, beatReaction: number): string {
  const alpha = 0.3 + beatReaction * 0.5 + intensity * 0.2;
  return `rgba(255, 100, 50, ${Math.min(1, alpha)})`;
}

// Number of bars
const BAR_COUNT = 48;
// Gap between bars
const BAR_GAP = 2;
// Bass emphasis: how much to boost low frequencies
const BASS_BOOST = 2.5;
// How many bars are considered "bass"
const BASS_BARS = 12;

/**
 * Equalizer V2 - Club-style LED wall visualizer
 *
 * Features:
 * - Bars grow from BOTTOM to TOP
 * - Bass/kick frequencies emphasized
 * - Full-screen coverage, no dead zones
 * - Heavy beat reactivity with glow effects
 */
export function EqualizerV2Visualizer({
  renderer,
  frequencyData,
  isBeat,
  beatIntensity,
  width,
  height,
  clubSettings,
}: VisualizerProps): null {
  // Merge with defaults
  const settings: ClubSettings = { ...DEFAULT_CLUB_SETTINGS, ...clubSettings };

  // Aggressive beat reaction for club feel - decay controlled by settings
  const decayMs = 80 + (1 - settings.decay) * 160; // decay 0→240ms, 1→80ms
  const reaction = useBeatReaction(isBeat, beatIntensity, {
    decayMs,
    threshold: 0.05,
  });

  // Store current data in refs
  const frequencyDataRef = useRef<Float32Array | null>(frequencyData);
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  const reactionValueRef = useRef(reaction.value);
  const settingsRef = useRef<ClubSettings>(settings);

  // Smoothed bar heights for fluid animation
  const smoothedHeightsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0));
  // Peak hold for each bar
  const peakHeightsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0));
  const peakDecayRef = useRef<number[]>(new Array(BAR_COUNT).fill(0));

  // Update refs when props change
  useEffect(() => {
    frequencyDataRef.current = frequencyData;
    widthRef.current = width;
    heightRef.current = height;
    reactionValueRef.current = reaction.value;
    settingsRef.current = settings;
  }, [frequencyData, width, height, reaction.value, settings]);

  useEffect(() => {
    if (!renderer) return;

    const renderCallback = (ctx: CanvasRenderingContext2D) => {
      const data = frequencyDataRef.current;
      const w = widthRef.current;
      const h = heightRef.current;
      const beatReaction = reactionValueRef.current;
      const smoothedHeights = smoothedHeightsRef.current;
      const peakHeights = peakHeightsRef.current;
      const peakDecay = peakDecayRef.current;

      // Get settings from ref
      const { bassGain, sensitivity, verticalScale, decay } = settingsRef.current;

      // Bar dimensions - full width coverage
      const barWidth = (w - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;

      // Sample frequency data with bass emphasis (controlled by bassGain)
      const stride = data ? Math.floor(data.length / 2 / BAR_COUNT) : 1;

      // Effective bass boost based on bassGain setting (0-2)
      const effectiveBassBoost = BASS_BOOST * bassGain;

      // Attack/release speeds based on decay setting
      const attackSpeed = 0.3 + decay * 0.4; // 0.3 to 0.7
      const releaseSpeed = 0.05 + decay * 0.2; // 0.05 to 0.25

      for (let i = 0; i < BAR_COUNT; i++) {
        let rawValue = 0;

        if (data) {
          // Use lower half of frequency data (more musical content)
          const dataIndex = Math.min(i * stride, data.length - 1);
          rawValue = data[dataIndex] ?? 0;

          // Apply global sensitivity
          rawValue = rawValue * (0.5 + sensitivity);

          // Boost bass frequencies (controlled by bassGain)
          if (i < BASS_BARS) {
            const bassMultiplier = effectiveBassBoost * (1 - i / BASS_BARS);
            rawValue = Math.min(1, rawValue * (1 + bassMultiplier));
          }

          // Add beat reaction to bass bars (reduced by lower bassGain)
          if (i < BASS_BARS) {
            rawValue = Math.min(1, rawValue + beatReaction * 0.2 * bassGain * (1 - i / BASS_BARS));
          }
        }

        // Smooth the height changes (controlled by decay setting)
        const currentSmooth = smoothedHeights[i] ?? 0;
        if (rawValue > currentSmooth) {
          // Fast attack
          smoothedHeights[i] = currentSmooth + (rawValue - currentSmooth) * attackSpeed;
        } else {
          // Slower release
          smoothedHeights[i] = currentSmooth + (rawValue - currentSmooth) * releaseSpeed;
        }

        // Peak hold (decay speed based on settings)
        const currentPeak = peakHeights[i] ?? 0;
        const currentPeakDecay = peakDecay[i] ?? 0;
        const peakDecaySpeed = 0.01 + decay * 0.02;
        if (smoothedHeights[i]! > currentPeak) {
          peakHeights[i] = smoothedHeights[i]!;
          peakDecay[i] = 0;
        } else {
          peakDecay[i] = currentPeakDecay + peakDecaySpeed;
          peakHeights[i] = Math.max(0, currentPeak - currentPeakDecay * 0.02);
        }
      }

      // Draw background gradient (subtle, dark)
      const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
      bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, w, h);

      // Setup glow for bass frequencies when beat is active
      if (beatReaction > 0.1) {
        ctx.shadowColor = getGlowColor(0.5, beatReaction);
        ctx.shadowBlur = beatReaction * 30;
      }

      // Draw bars from bottom to top (height scaled by verticalScale)
      for (let i = 0; i < BAR_COUNT; i++) {
        const barHeight = (smoothedHeights[i] ?? 0) * h * verticalScale;
        const x = i * (barWidth + BAR_GAP);
        const y = h - barHeight; // Start from bottom

        // Skip nearly invisible bars
        if (barHeight < 2) continue;

        // Frequency position for color (0 = bass, 1 = treble)
        const freqPosition = i / BAR_COUNT;
        const intensity = smoothedHeights[i] ?? 0;

        // Create vertical gradient for each bar
        const barGradient = ctx.createLinearGradient(x, h, x, y);
        barGradient.addColorStop(0, getBarColor(freqPosition, intensity, beatReaction));
        barGradient.addColorStop(0.5, getBarColor(freqPosition, intensity * 0.8, beatReaction * 0.7));
        barGradient.addColorStop(1, getBarColor(freqPosition, intensity * 0.5, beatReaction * 0.3));

        ctx.fillStyle = barGradient;

        // Rounded top for bars
        const radius = Math.min(barWidth / 2, 4);
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, h);
        ctx.closePath();
        ctx.fill();

        // Draw peak indicator (scaled by verticalScale)
        const peakY = h - (peakHeights[i] ?? 0) * h * verticalScale;
        if (peakY < h - 4) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + beatReaction * 0.3})`;
          ctx.fillRect(x, peakY - 2, barWidth, 2);
        }
      }

      // Clear shadow
      ctx.shadowBlur = 0;

      // Draw floor glow (reflection effect)
      const floorGlow = ctx.createLinearGradient(0, h, 0, h - 30);
      floorGlow.addColorStop(0, `rgba(255, 100, 50, ${0.15 + beatReaction * 0.2})`);
      floorGlow.addColorStop(1, 'rgba(255, 100, 50, 0)');
      ctx.fillStyle = floorGlow;
      ctx.fillRect(0, h - 30, w, 30);
    };

    const unsubscribe = renderer.onRender(renderCallback);
    return unsubscribe;
  }, [renderer]);

  return null;
}
