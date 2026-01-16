import './Watermark.css';

/**
 * Watermark overlay component for free tier users
 *
 * Displays a subtle "BeatForge Studio" watermark in the bottom-right corner.
 * Positioned above canvas but doesn't block user interaction.
 */
export function Watermark() {
  return (
    <div className="watermark" aria-hidden="true">
      <span className="watermark-text">BeatForge Studio</span>
      <span className="watermark-badge">Free</span>
    </div>
  );
}
