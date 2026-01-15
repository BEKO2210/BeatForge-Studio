import type { BeatInfo } from '../audio/types';
import './BeatDebug.css';

interface BeatDebugProps {
  /** Current beat info from useBeatDetector hook */
  beatInfo: BeatInfo | null;
  /** Total beat count since playback started */
  beatCount: number;
}

/**
 * Debug visualization component for beat detection.
 *
 * Displays:
 * - Three vertical bars showing bass/mid/treble energy levels
 * - Beat indicator circle that flashes on beat detection
 * - Running beat count
 *
 * This component is purely presentational - receives all data as props.
 */
export function BeatDebug({ beatInfo, beatCount }: BeatDebugProps) {
  const bands = beatInfo?.frequencyBands;
  const isBeat = beatInfo?.isBeat ?? false;

  // Convert 0-1 values to percentages for bar heights
  const bassHeight = bands ? Math.round(bands.bass * 100) : 0;
  const midHeight = bands ? Math.round(bands.mid * 100) : 0;
  const trebleHeight = bands ? Math.round(bands.treble * 100) : 0;

  return (
    <div className="beat-debug">
      <div className="beat-debug-bars">
        <div className="beat-debug-bar-container">
          <div
            className="beat-debug-bar beat-debug-bar--bass"
            style={{ height: `${bassHeight}%` }}
          />
          <span className="beat-debug-bar-label">BASS</span>
          <span className="beat-debug-bar-value">{bassHeight}%</span>
        </div>

        <div className="beat-debug-bar-container">
          <div
            className="beat-debug-bar beat-debug-bar--mid"
            style={{ height: `${midHeight}%` }}
          />
          <span className="beat-debug-bar-label">MID</span>
          <span className="beat-debug-bar-value">{midHeight}%</span>
        </div>

        <div className="beat-debug-bar-container">
          <div
            className="beat-debug-bar beat-debug-bar--treble"
            style={{ height: `${trebleHeight}%` }}
          />
          <span className="beat-debug-bar-label">TREBLE</span>
          <span className="beat-debug-bar-value">{trebleHeight}%</span>
        </div>
      </div>

      <div className="beat-debug-indicator-container">
        <div className={`beat-debug-indicator ${isBeat ? 'active' : ''}`} />
        <span className="beat-debug-indicator-label">
          {isBeat ? 'BEAT!' : ''}
        </span>
      </div>

      <div className="beat-debug-count">
        <span className="beat-debug-count-label">Beats:</span>
        <span className="beat-debug-count-value">{beatCount}</span>
      </div>
    </div>
  );
}
