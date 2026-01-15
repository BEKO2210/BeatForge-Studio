import { useState, useEffect, useRef, useCallback } from 'react';
import { decay, easeOutExpo, type EasingFn } from '../animation';

interface UseBeatReactionOptions {
  /** Decay duration in ms (default: 150) */
  decayMs?: number;
  /** Easing function for decay (default: easeOutExpo) */
  easing?: EasingFn;
  /** Minimum intensity threshold to trigger (default: 0) */
  threshold?: number;
}

interface UseBeatReactionResult {
  /** Current animation value 0-1, peaks on beat then decays */
  value: number;
  /** Whether currently in decay phase */
  isActive: boolean;
}

/**
 * React hook that converts discrete beat events into smooth animated values.
 *
 * When a beat is detected (isBeat=true), captures the intensity and starts
 * a smooth decay animation. The value peaks at the beat intensity and
 * smoothly decays to 0 over the specified duration.
 *
 * @param isBeat - Whether a beat was detected this frame
 * @param intensity - Beat intensity 0-1 (higher = stronger beat)
 * @param options - Configuration options
 * @returns Current animation value and active state
 */
export function useBeatReaction(
  isBeat: boolean,
  intensity: number,
  options: UseBeatReactionOptions = {}
): UseBeatReactionResult {
  const {
    decayMs = 150,
    easing = easeOutExpo,
    threshold = 0,
  } = options;

  // Current animation state
  const [value, setValue] = useState(0);

  // Track beat state for animation
  const beatStartRef = useRef<number | null>(null);
  const beatIntensityRef = useRef(0);
  const frameIdRef = useRef<number | null>(null);

  // Animation tick function
  const tick = useCallback(() => {
    const startTime = beatStartRef.current;

    if (startTime === null) {
      // No active beat, ensure value is 0
      setValue(prev => prev !== 0 ? 0 : prev);
      frameIdRef.current = requestAnimationFrame(tick);
      return;
    }

    const elapsed = performance.now() - startTime;
    const newValue = beatIntensityRef.current * decay(elapsed, decayMs, easing);

    if (newValue <= 0.01) {
      // Decay complete
      beatStartRef.current = null;
      beatIntensityRef.current = 0;
      setValue(0);
    } else {
      setValue(newValue);
    }

    frameIdRef.current = requestAnimationFrame(tick);
  }, [decayMs, easing]);

  // Handle new beats
  useEffect(() => {
    if (isBeat && intensity >= threshold) {
      // New beat detected - capture intensity and start/restart decay
      beatStartRef.current = performance.now();
      beatIntensityRef.current = intensity;
    }
  }, [isBeat, intensity, threshold]);

  // Start/stop animation loop
  useEffect(() => {
    frameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [tick]);

  return {
    value,
    isActive: value > 0.01,
  };
}
