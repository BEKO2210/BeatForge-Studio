import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

interface BeatState {
  beatInfo: BeatInfo | null;
  beatCount: number;
  engineId: AudioEngine | null;
}

/**
 * React hook that subscribes to beat detection data from an AudioEngine.
 *
 * Polls the BeatDetector directly during playback to get beat info each frame.
 * The polling approach via requestAnimationFrame ensures smooth visual updates.
 *
 * @param audioEngine - The AudioEngine instance to subscribe to
 * @returns Beat detection state including beatInfo, frequencyBands, isBeat, and beatCount
 */
export function useBeatDetector(audioEngine: AudioEngine | null): UseBeatDetectorResult {
  // Create initial state based on current engine
  const getInitialState = useCallback((): BeatState => ({
    beatInfo: null,
    beatCount: 0,
    engineId: audioEngine,
  }), [audioEngine]);

  const [state, setState] = useState<BeatState>(getInitialState);

  // Track previous beat state to detect beat transitions
  const wasBeatRef = useRef(false);
  const frameIdRef = useRef<number | null>(null);

  // Memoize the current engine to use in state updates
  const currentEngine = useMemo(() => audioEngine, [audioEngine]);

  // Handler for processing beat info - called from rAF callback
  const processBeatInfo = useCallback((info: BeatInfo, engine: AudioEngine) => {
    setState(prev => {
      // If engine changed, reset state
      if (prev.engineId !== engine) {
        wasBeatRef.current = info.isBeat;
        return {
          beatInfo: info,
          beatCount: info.isBeat ? 1 : 0,
          engineId: engine,
        };
      }

      // Increment beat count on rising edge (wasn't beat, now is beat)
      const newBeatCount = (info.isBeat && !wasBeatRef.current)
        ? prev.beatCount + 1
        : prev.beatCount;

      wasBeatRef.current = info.isBeat;

      return {
        ...prev,
        beatInfo: info,
        beatCount: newBeatCount,
      };
    });
  }, []);

  // Handler to reset state when engine is null - called from rAF callback
  const resetState = useCallback(() => {
    setState(prev => {
      if (prev.engineId === null && prev.beatInfo === null) {
        return prev; // Already reset
      }
      wasBeatRef.current = false;
      return {
        beatInfo: null,
        beatCount: 0,
        engineId: null,
      };
    });
  }, []);

  useEffect(() => {
    // Reset wasBeat ref when engine changes
    wasBeatRef.current = false;

    let isActive = true;

    // Poll beat detector on each animation frame
    const tick = () => {
      if (!isActive) return;

      if (!currentEngine) {
        // Reset state when no engine - done via callback
        resetState();
        frameIdRef.current = requestAnimationFrame(tick);
        return;
      }

      const beatDetector = currentEngine.getBeatDetector();
      if (!beatDetector) {
        frameIdRef.current = requestAnimationFrame(tick);
        return;
      }

      const audioState = currentEngine.getState();
      if (audioState === 'playing') {
        const info = beatDetector.getBeatInfo();
        processBeatInfo(info, currentEngine);
      }

      frameIdRef.current = requestAnimationFrame(tick);
    };

    // Start the animation loop
    frameIdRef.current = requestAnimationFrame(tick);

    // Cleanup: stop the loop
    return () => {
      isActive = false;
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [currentEngine, processBeatInfo, resetState]);

  return {
    beatInfo: state.beatInfo,
    frequencyBands: state.beatInfo?.frequencyBands ?? null,
    isBeat: state.beatInfo?.isBeat ?? false,
    beatCount: state.beatCount,
  };
}
