import { useState, useEffect, useRef } from 'react';
import { getCameraShakeOffset, type ShakeOffset } from '../effects';
import { decay, easeOutExpo } from '../animation';

interface UseCameraShakeOptions {
  /** Maximum pixel offset on strong beats (default: 8) */
  maxOffset?: number;
  /** Decay duration in milliseconds (default: 100) */
  decayMs?: number;
  /** Beat intensity threshold to trigger shake (default: 0.6) */
  threshold?: number;
}

interface UseCameraShakeResult {
  /** Current X offset in pixels */
  offsetX: number;
  /** Current Y offset in pixels */
  offsetY: number;
  /** Whether shake is currently active */
  isActive: boolean;
}

/**
 * React hook for camera shake effect on strong beats.
 *
 * Similar pattern to useBeatReaction but specifically for camera shake:
 * - Triggers only on strong beats (above threshold)
 * - Uses faster decay for snappy feel
 * - Returns pixel offsets for transform application
 *
 * @param isBeat - Whether a beat was detected this frame
 * @param intensity - Beat intensity 0-1
 * @param options - Configuration options
 * @returns Current shake offset and active state
 */
export function useCameraShake(
  isBeat: boolean,
  intensity: number,
  options: UseCameraShakeOptions = {}
): UseCameraShakeResult {
  const {
    maxOffset = 8,
    decayMs = 100,
    threshold = 0.6,
  } = options;

  // Current shake offset state
  const [offset, setOffset] = useState<ShakeOffset>({ x: 0, y: 0 });

  // Track shake animation state
  const shakeStartRef = useRef<number | null>(null);
  const shakeIntensityRef = useRef(0);
  const frameIdRef = useRef<number | null>(null);

  // Store options in refs to avoid effect dependencies
  const maxOffsetRef = useRef(maxOffset);
  const decayMsRef = useRef(decayMs);

  // Update option refs when they change
  useEffect(() => {
    maxOffsetRef.current = maxOffset;
    decayMsRef.current = decayMs;
  }, [maxOffset, decayMs]);

  // Handle new beats - only trigger on strong beats
  useEffect(() => {
    if (isBeat && intensity >= threshold) {
      shakeStartRef.current = performance.now();
      shakeIntensityRef.current = intensity;
    }
  }, [isBeat, intensity, threshold]);

  // Animation loop
  useEffect(() => {
    let isActive = true;

    const tick = () => {
      if (!isActive) return;

      const startTime = shakeStartRef.current;

      if (startTime === null) {
        // No active shake, ensure offset is zero
        setOffset(prev => (prev.x !== 0 || prev.y !== 0) ? { x: 0, y: 0 } : prev);
        frameIdRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = performance.now() - startTime;
      const reaction = shakeIntensityRef.current * decay(elapsed, decayMsRef.current, easeOutExpo);

      if (reaction <= 0.01) {
        // Decay complete
        shakeStartRef.current = null;
        shakeIntensityRef.current = 0;
        setOffset({ x: 0, y: 0 });
      } else {
        // Get shake offset for current reaction value
        const newOffset = getCameraShakeOffset(reaction, maxOffsetRef.current);
        setOffset(newOffset);
      }

      frameIdRef.current = requestAnimationFrame(tick);
    };

    frameIdRef.current = requestAnimationFrame(tick);

    return () => {
      isActive = false;
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, []); // Empty deps - tick function is self-contained with refs

  return {
    offsetX: offset.x,
    offsetY: offset.y,
    isActive: offset.x !== 0 || offset.y !== 0,
  };
}
