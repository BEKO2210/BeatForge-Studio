import { useState, useEffect, useRef } from 'react';
import type { BeatInfo, FrequencyBands } from '../audio/types';
import type { AudioEngine } from '../audio/AudioEngine';

interface UseBeatDetectorResult {
  /** Latest beat info from the audio engine */
  beatInfo: BeatInfo | null;
  /** Current frequency band levels */
  frequencyBands: FrequencyBands | null;
  /** Shorthand for beatInfo?.isBeat */
  isBeat: boolean;
  /** Total number of beats detected since audio started */
  beatCount: number;
}

/**
 * React hook that subscribes to beat detection data from an AudioEngine.
 *
 * Uses the AudioEngine's onBeatInfo callback to receive beat data each frame.
 * The callback approach ensures we don't miss beat events between renders.
 *
 * @param audioEngine - The AudioEngine instance to subscribe to
 * @returns Beat detection state including beatInfo, frequencyBands, isBeat, and beatCount
 */
export function useBeatDetector(audioEngine: AudioEngine | null): UseBeatDetectorResult {
  const [beatInfo, setBeatInfo] = useState<BeatInfo | null>(null);
  const [beatCount, setBeatCount] = useState(0);

  // Track previous beat state to detect beat transitions
  const wasBeatRef = useRef(false);

  useEffect(() => {
    if (!audioEngine) {
      return;
    }

    // Subscribe to beat info updates
    const handleBeatInfo = (info: BeatInfo) => {
      setBeatInfo(info);

      // Increment beat count on rising edge (wasn't beat, now is beat)
      if (info.isBeat && !wasBeatRef.current) {
        setBeatCount(prev => prev + 1);
      }
      wasBeatRef.current = info.isBeat;
    };

    // Access the internal callbacks object to set our handler
    // The AudioEngine calls onBeatInfo during its animation loop
    const callbacks = (audioEngine as unknown as { callbacks: { onBeatInfo?: (info: BeatInfo) => void } }).callbacks;
    const previousCallback = callbacks.onBeatInfo;

    callbacks.onBeatInfo = (info: BeatInfo) => {
      // Call any existing callback first
      previousCallback?.(info);
      handleBeatInfo(info);
    };

    // Cleanup: restore previous callback
    return () => {
      callbacks.onBeatInfo = previousCallback;
      wasBeatRef.current = false;
    };
  }, [audioEngine]);

  // Reset beat count when audioEngine changes (new file loaded)
  useEffect(() => {
    setBeatCount(0);
    setBeatInfo(null);
    wasBeatRef.current = false;
  }, [audioEngine]);

  return {
    beatInfo,
    frequencyBands: beatInfo?.frequencyBands ?? null,
    isBeat: beatInfo?.isBeat ?? false,
    beatCount,
  };
}
