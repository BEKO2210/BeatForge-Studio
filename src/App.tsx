import { useState, useCallback, useMemo } from 'react';
import { AudioEngine } from './audio/AudioEngine';
import type { AudioState } from './audio/types';
import { AudioUpload } from './components/AudioUpload';
import { AudioPlayer } from './components/AudioPlayer';
import { VisualizerContainer } from './visualizers';
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

            <VisualizerContainer audioEngine={audioEngine} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
