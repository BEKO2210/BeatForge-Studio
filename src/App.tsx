import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { AudioEngine } from './audio/AudioEngine';
import type { AudioState } from './audio/types';
import { AudioUpload } from './components/AudioUpload';
import { AudioPlayer } from './components/AudioPlayer';
import { BeatDebug } from './components/BeatDebug';
import { useBeatDetector } from './hooks/useBeatDetector';
import { useRenderer } from './hooks/useRenderer';
import { drawRect, drawCircle, drawLine } from './renderer/shapes';
import './App.css';

function App() {
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [engineKey, setEngineKey] = useState(0);

  // Create AudioEngine with memoization - recreates when engineKey changes
  const audioEngine = useMemo(() => {
    const engine = new AudioEngine({
      onStateChange: (state) => {
        setAudioState(state);
        if (state === 'ready') {
          setDuration(engine.getDuration());
        }
      },
      onTimeUpdate: (time) => {
        setCurrentTime(time);
      },
      onError: (err) => {
        setError(err.message);
        setTimeout(() => setError(null), 5000);
      },
    });

    return engine;
  }, [engineKey]);

  // Subscribe to beat detection data
  const { beatInfo, beatCount } = useBeatDetector(audioEngine);

  // Canvas renderer setup
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { renderer } = useRenderer(canvasRef, { height: 400 });

  // Register demo render callback with animated shapes
  useEffect(() => {
    if (!renderer) return;

    let startTime = performance.now();

    const unsubscribe = renderer.onRender((ctx) => {
      const elapsed = performance.now() - startTime;
      const width = renderer.width;
      const height = renderer.height;

      // Animated circle - pulses based on time
      const baseRadius = 40;
      const pulseAmount = Math.sin(elapsed / 300) * 15;
      const circleRadius = baseRadius + pulseAmount;

      drawCircle(ctx, width / 2, height / 2, circleRadius, {
        fillColor: '#646cff',
        strokeColor: '#818cf8',
        strokeWidth: 2,
      });

      // Static rectangle on the left
      drawRect(ctx, 50, height / 2 - 50, 100, 100, {
        fillColor: '#2d2d2d',
        strokeColor: '#4a4a4a',
        strokeWidth: 2,
        cornerRadius: 8,
      });

      // Animated line on the right - rotates
      const lineLength = 80;
      const angle = elapsed / 1000;
      const lineCenterX = width - 100;
      const lineCenterY = height / 2;
      const x1 = lineCenterX + Math.cos(angle) * lineLength;
      const y1 = lineCenterY + Math.sin(angle) * lineLength;
      const x2 = lineCenterX - Math.cos(angle) * lineLength;
      const y2 = lineCenterY - Math.sin(angle) * lineLength;

      drawLine(ctx, x1, y1, x2, y2, {
        color: '#22c55e',
        width: 4,
        lineCap: 'round',
      });
    });

    return () => {
      unsubscribe();
      startTime = performance.now();
    };
  }, [renderer]);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setFileName(file.name);

    try {
      await audioEngine.loadFile(file);
    } catch {
      // Error is handled by onError callback
      setFileName(null);
    }
  }, [audioEngine]);

  const handleNewFile = useCallback(() => {
    audioEngine.dispose();
    setAudioState('idle');
    setCurrentTime(0);
    setDuration(0);
    setFileName(null);
    setEngineKey(prev => prev + 1);
  }, [audioEngine]);

  const showUpload = audioState === 'idle' || audioState === 'loading';
  const showPlayer = audioState === 'ready' || audioState === 'playing' || audioState === 'paused';
  const isLoading = audioState === 'loading';

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">BeatForge Studio</h1>
        <p className="app-subtitle">Browser-based music visualizer creator</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="app-error" role="alert">
            {error}
          </div>
        )}

        {showUpload && (
          <AudioUpload
            onFileSelect={handleFileSelect}
            disabled={isLoading}
          />
        )}

        {showPlayer && (
          <div className="app-player-container">
            <div className="app-player-info">
              <span className="app-player-filename" title={fileName ?? undefined}>
                {fileName}
              </span>
              <button
                className="app-player-new"
                onClick={handleNewFile}
                aria-label="Load new file"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M12 3v18" />
                </svg>
                New
              </button>
            </div>

            <AudioPlayer
              audioEngine={audioEngine}
              currentTime={currentTime}
              duration={duration}
              audioState={audioState}
              disabled={isLoading}
            />

            <BeatDebug beatInfo={beatInfo} beatCount={beatCount} />

            <div className="canvas-container">
              <canvas ref={canvasRef} className="visualizer-canvas" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
