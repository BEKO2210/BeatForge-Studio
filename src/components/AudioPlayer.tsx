import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import type { AudioState } from '../audio/types';
import type { AudioEngine } from '../audio/AudioEngine';
import './AudioPlayer.css';

interface AudioPlayerProps {
  audioEngine: AudioEngine;
  currentTime: number;
  duration: number;
  audioState: AudioState;
  disabled?: boolean;
}

/**
 * Format time in seconds to MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * AudioPlayer - Playback controls with play/pause, seek bar, and time display
 */
export function AudioPlayer({
  audioEngine,
  currentTime,
  duration,
  audioState,
  disabled = false,
}: AudioPlayerProps) {
  const handlePlayPause = useCallback(() => {
    if (disabled) return;

    if (audioState === 'playing') {
      audioEngine.pause();
    } else if (audioState === 'ready' || audioState === 'paused') {
      audioEngine.play();
    }
  }, [audioEngine, audioState, disabled]);

  const handleSeek = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const newTime = parseFloat(e.target.value);
    audioEngine.seek(newTime);
  }, [audioEngine, disabled]);

  const isPlaying = audioState === 'playing';
  const canPlay = audioState === 'ready' || audioState === 'paused' || audioState === 'playing';

  return (
    <div className={`audio-player ${disabled ? 'audio-player--disabled' : ''}`}>
      <button
        className="audio-player__play-btn"
        onClick={handlePlayPause}
        disabled={disabled || !canPlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.14v14.72a1 1 0 001.5.87l11-7.36a1 1 0 000-1.74l-11-7.36a1 1 0 00-1.5.87z" />
          </svg>
        )}
      </button>

      <span className="audio-player__time audio-player__time--current">
        {formatTime(currentTime)}
      </span>

      <input
        type="range"
        className="audio-player__seek"
        min="0"
        max={duration || 100}
        step="0.1"
        value={currentTime}
        onChange={handleSeek}
        disabled={disabled || !canPlay}
        aria-label="Seek"
      />

      <span className="audio-player__time audio-player__time--duration">
        {formatTime(duration)}
      </span>
    </div>
  );
}
