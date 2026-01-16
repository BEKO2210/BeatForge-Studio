import { useState, useCallback, useMemo } from 'react';
import { AudioEngine } from './audio/AudioEngine';
import type { AudioState } from './audio/types';
import { AudioUpload } from './components/AudioUpload';
import { AudioPlayer } from './components/AudioPlayer';
import { TextEditor } from './components/TextEditor';
import { BackgroundEditor } from './components/BackgroundEditor';
import { ExportPanel } from './components/ExportPanel';
import { VisualizerContainer } from './visualizers';
import type { VisualizerType, CircularSettings, ClubSettings } from './visualizers/types';
import type { TextLayer } from './text';
import type { BackgroundConfig } from './background';
import type { EffectsConfig } from './effects';
import {
  PRESET_LIST,
  PRESETS,
  DEFAULT_PRESET_ID,
  DEFAULT_PRESET,
  type PresetId,
  type PresetConfig,
} from './presets';
import { TierProvider, useTier } from './tier';
import './App.css';

function AppContent() {
  const { tier, config, toggleTier } = useTier();
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [engineKey, setEngineKey] = useState(0);

  // Preset state
  const [currentPresetId, setCurrentPresetId] = useState<PresetId>(DEFAULT_PRESET_ID);
  const currentPreset = PRESETS[currentPresetId];

  // Derived state from preset (can be customized by user)
  const [textLayers, setTextLayers] = useState<TextLayer[]>(DEFAULT_PRESET.defaultTextLayers);
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>(DEFAULT_PRESET.background);
  const [visualizerType, setVisualizerType] = useState<VisualizerType>(DEFAULT_PRESET.visualizer.type);
  const [circularSettings, setCircularSettings] = useState<CircularSettings | undefined>(DEFAULT_PRESET.visualizer.circularSettings);
  const [clubSettings, setClubSettings] = useState<ClubSettings | undefined>(DEFAULT_PRESET.visualizer.clubSettings);
  const [effectsConfig, setEffectsConfig] = useState<EffectsConfig>(DEFAULT_PRESET.effects);

  // Canvas element for export
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);

  // Apply preset
  const applyPreset = useCallback((preset: PresetConfig) => {
    setCurrentPresetId(preset.id);
    setTextLayers(preset.defaultTextLayers);
    setBackgroundConfig(preset.background);
    setVisualizerType(preset.visualizer.type);
    setCircularSettings(preset.visualizer.circularSettings);
    setClubSettings(preset.visualizer.clubSettings);
    setEffectsConfig(preset.effects);
  }, []);

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
        <div className="app-header-left">
          <h1 className="app-title">BeatForge Studio</h1>
          <p className="app-subtitle">Browser-based music visualizer creator</p>
        </div>
        <button
          className={`tier-toggle ${tier === 'pro' ? 'tier-toggle--pro' : ''}`}
          onClick={toggleTier}
          title={`Current: ${tier.toUpperCase()} tier. Click to toggle.`}
        >
          {tier === 'free' ? 'Free' : 'Pro'}
        </button>
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

            {/* Preset selector */}
            <div className="preset-selector">
              <span className="preset-selector-label">Preset:</span>
              <div className="preset-selector-buttons">
                {PRESET_LIST.map((preset) => (
                  <button
                    key={preset.id}
                    className={`preset-selector-btn ${currentPresetId === preset.id ? 'active' : ''}`}
                    onClick={() => applyPreset(preset)}
                    title={preset.description}
                  >
                    {preset.name}
                    <span className="preset-selector-ratio">{preset.aspectRatio.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <AudioPlayer
              audioEngine={audioEngine}
              currentTime={currentTime}
              duration={duration}
              audioState={audioState}
              disabled={isLoading}
            />

            <TextEditor
              layers={textLayers}
              onLayersChange={setTextLayers}
              disabled={isLoading}
            />

            <BackgroundEditor
              config={backgroundConfig}
              onConfigChange={setBackgroundConfig}
              disabled={isLoading}
            />

            <ExportPanel
              canvas={canvasElement}
              audioEngine={audioEngine}
              disabled={isLoading}
            />

            <VisualizerContainer
              audioEngine={audioEngine}
              textLayers={textLayers}
              backgroundConfig={backgroundConfig}
              presetVisualizerType={visualizerType}
              presetCircularSettings={circularSettings}
              presetClubSettings={clubSettings}
              effectsConfig={effectsConfig}
              aspectRatio={currentPreset.aspectRatio}
              onVisualizerChange={setVisualizerType}
              onCircularSettingsChange={setCircularSettings}
              onClubSettingsChange={setClubSettings}
              onCanvasReady={setCanvasElement}
              showWatermark={config.showWatermark}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <TierProvider>
      <AppContent />
    </TierProvider>
  );
}

export default App;
