import { useState, useRef, useEffect, useCallback } from 'react';
import type { AudioEngine } from '../audio/AudioEngine';
import { useRenderer } from '../hooks/useRenderer';
import { useBeatDetector } from '../hooks/useBeatDetector';
import { useCameraShake } from '../hooks/useCameraShake';
import { EqualizerVisualizer } from './EqualizerVisualizer';
import { EqualizerV2Visualizer } from './EqualizerV2Visualizer';
import { WaveformVisualizer } from './WaveformVisualizer';
import { CircularSpectrumVisualizer } from './CircularSpectrumVisualizer';
import { TextLayerRenderer, type TextLayer } from '../text';
import { BackgroundRenderer, type BackgroundConfig } from '../background';
import { DEFAULT_BACKGROUND } from '../background';
import { renderVignette, type EffectsConfig, DEFAULT_EFFECTS } from '../effects';
import type { VisualizerType, CircularSettings, ClubSettings } from './types';
import { DEFAULT_CIRCULAR_SETTINGS, DEFAULT_CLUB_SETTINGS } from './types';
import type { AspectRatio } from '../presets';

interface AudioDataState {
  frequencyData: Float32Array | null;
  timeDomainData: Float32Array | null;
}

interface VisualizerContainerProps {
  audioEngine: AudioEngine | null;
  textLayers?: TextLayer[];
  backgroundConfig?: BackgroundConfig;
  className?: string;
  /** Preset-controlled visualizer type */
  presetVisualizerType?: VisualizerType;
  /** Preset-controlled circular settings */
  presetCircularSettings?: CircularSettings;
  /** Preset-controlled club settings */
  presetClubSettings?: ClubSettings;
  /** Preset-controlled effects configuration */
  effectsConfig?: EffectsConfig;
  /** Preset-controlled aspect ratio */
  aspectRatio?: AspectRatio;
  /** Callback when visualizer type changes (for preset sync) */
  onVisualizerChange?: (type: VisualizerType) => void;
  /** Callback when circular settings change */
  onCircularSettingsChange?: (settings: CircularSettings) => void;
  /** Callback when club settings change */
  onClubSettingsChange?: (settings: ClubSettings) => void;
  /** Callback to expose canvas element for export */
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
}

/**
 * Container component that hosts visualizers with a selector UI
 * Manages audio data polling and passes it to the selected visualizer
 */
export function VisualizerContainer({
  audioEngine,
  textLayers,
  backgroundConfig = DEFAULT_BACKGROUND,
  className,
  presetVisualizerType,
  presetCircularSettings,
  presetClubSettings,
  effectsConfig = DEFAULT_EFFECTS,
  aspectRatio,
  onVisualizerChange,
  onCircularSettingsChange,
  onClubSettingsChange,
  onCanvasReady,
}: VisualizerContainerProps) {
  // Use preset-controlled values if provided, otherwise use local state
  const [localSelectedVisualizer, setLocalSelectedVisualizer] = useState<VisualizerType>('equalizer');
  const [audioData, setAudioData] = useState<AudioDataState>({
    frequencyData: null,
    timeDomainData: null,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);

  // Visualizer-specific settings - use preset values if provided
  const [localCircularSettings, setLocalCircularSettings] = useState<CircularSettings>(DEFAULT_CIRCULAR_SETTINGS);
  const [localClubSettings, setLocalClubSettings] = useState<ClubSettings>(DEFAULT_CLUB_SETTINGS);

  // Derive effective values from preset or local state
  const selectedVisualizer = presetVisualizerType ?? localSelectedVisualizer;
  const circularSettings = presetCircularSettings ?? localCircularSettings;
  const clubSettings = presetClubSettings ?? localClubSettings;

  // Handle visualizer change - update local state and notify parent
  const handleVisualizerChange = useCallback((type: VisualizerType) => {
    setLocalSelectedVisualizer(type);
    onVisualizerChange?.(type);
  }, [onVisualizerChange]);

  // Update handlers for settings - update local state and notify parent
  const updateCircularSetting = useCallback(<K extends keyof CircularSettings>(
    key: K,
    value: CircularSettings[K]
  ) => {
    setLocalCircularSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      onCircularSettingsChange?.(newSettings);
      return newSettings;
    });
  }, [onCircularSettingsChange]);

  const updateClubSetting = useCallback(<K extends keyof ClubSettings>(
    key: K,
    value: ClubSettings[K]
  ) => {
    setLocalClubSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      onClubSettingsChange?.(newSettings);
      return newSettings;
    });
  }, [onClubSettingsChange]);

  // Sync local state when preset values change
  useEffect(() => {
    if (presetVisualizerType) {
      setLocalSelectedVisualizer(presetVisualizerType);
    }
  }, [presetVisualizerType]);

  useEffect(() => {
    if (presetCircularSettings) {
      setLocalCircularSettings(presetCircularSettings);
    }
  }, [presetCircularSettings]);

  useEffect(() => {
    if (presetClubSettings) {
      setLocalClubSettings(presetClubSettings);
    }
  }, [presetClubSettings]);

  // Canvas and renderer - height is controlled by CSS aspect-ratio
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { renderer } = useRenderer(canvasRef);

  // Expose canvas element to parent for export functionality
  useEffect(() => {
    onCanvasReady?.(canvasRef.current);
    return () => {
      onCanvasReady?.(null);
    };
  }, [onCanvasReady]);

  // Beat detection for isBeat and intensity
  const { beatInfo } = useBeatDetector(audioEngine);

  // Camera shake effect - use effectsConfig settings
  const shakeConfig = effectsConfig.cameraShake;
  const { offsetX, offsetY } = useCameraShake(
    effectsEnabled && shakeConfig.enabled && (beatInfo?.isBeat ?? false),
    beatInfo?.intensity ?? 0,
    { maxOffset: shakeConfig.maxOffset, decayMs: shakeConfig.decayMs, threshold: shakeConfig.threshold }
  );

  // Poll beat detector for raw audio data each frame
  useEffect(() => {
    let isActive = true;
    let frameId: number | null = null;

    const tick = () => {
      if (!isActive) return;

      if (!audioEngine) {
        // Reset data when no engine - only update if currently has data
        setAudioData(prev => {
          if (prev.frequencyData !== null || prev.timeDomainData !== null) {
            return { frequencyData: null, timeDomainData: null };
          }
          return prev;
        });
        frameId = requestAnimationFrame(tick);
        return;
      }

      const beatDetector = audioEngine.getBeatDetector();
      if (beatDetector) {
        const audioState = audioEngine.getState();
        if (audioState === 'playing') {
          // Get raw audio data - getBeatInfo already called by useBeatDetector
          // so frequencyData is already populated
          const frequencyData = beatDetector.getFrequencyData();
          const timeDomainData = beatDetector.getTimeDomainData();
          setAudioData({ frequencyData, timeDomainData });
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      isActive = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [audioEngine]);

  // Vignette effect - register as overlay layer, use effectsConfig settings
  const vignetteConfig = effectsConfig.vignette;
  useEffect(() => {
    if (!renderer || !effectsEnabled || !vignetteConfig.enabled) return;

    const width = renderer.width;
    const height = renderer.height;

    const vignetteCallback = (ctx: CanvasRenderingContext2D) => {
      renderVignette(ctx, width, height, { intensity: vignetteConfig.intensity, softness: vignetteConfig.softness });
    };

    // Register at overlay layer (after visualizers, before text)
    return renderer.onRender(vignetteCallback, 'overlay');
  }, [renderer, effectsEnabled, vignetteConfig]);

  // Common props for all visualizers
  const visualizerProps = {
    renderer,
    frequencyData: audioData.frequencyData,
    timeDomainData: audioData.timeDomainData,
    isBeat: beatInfo?.isBeat ?? false,
    beatIntensity: beatInfo?.intensity ?? 0,
    width: renderer?.width ?? 800,
    height: renderer?.height ?? 400,
    circularSettings,
    clubSettings,
  };

  // Check if current visualizer has settings
  const hasSettings = selectedVisualizer === 'circular' || selectedVisualizer === 'equalizer-v2';

  return (
    <div className={`visualizer-container ${className ?? ''}`}>
      {/* Visualizer selector buttons */}
      <div className="visualizer-selector">
        <button
          className={`visualizer-selector-btn ${selectedVisualizer === 'equalizer' ? 'active' : ''}`}
          onClick={() => handleVisualizerChange('equalizer')}
        >
          Spectrum
        </button>
        <button
          className={`visualizer-selector-btn ${selectedVisualizer === 'equalizer-v2' ? 'active' : ''}`}
          onClick={() => handleVisualizerChange('equalizer-v2')}
        >
          Club
        </button>
        <button
          className={`visualizer-selector-btn ${selectedVisualizer === 'waveform' ? 'active' : ''}`}
          onClick={() => handleVisualizerChange('waveform')}
        >
          Wave
        </button>
        <button
          className={`visualizer-selector-btn ${selectedVisualizer === 'circular' ? 'active' : ''}`}
          onClick={() => handleVisualizerChange('circular')}
        >
          Circular
        </button>
        {hasSettings && (
          <button
            className={`visualizer-selector-btn visualizer-settings-btn ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
            title="Visualizer Settings"
          >
            Settings
          </button>
        )}
        <button
          className={`visualizer-selector-btn visualizer-fx-btn ${effectsEnabled ? 'active' : ''}`}
          onClick={() => setEffectsEnabled(!effectsEnabled)}
          title="Toggle Effects (Camera Shake + Vignette)"
        >
          FX
        </button>
      </div>

      {/* Visualizer settings panel */}
      {showSettings && hasSettings && (
        <div className="visualizer-settings">
          {selectedVisualizer === 'circular' && (
            <>
              <div className="visualizer-settings-field">
                <label>Ring Gap ({Math.round(circularSettings.ringGap * 100)}%)</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={circularSettings.ringGap}
                  onChange={(e) => updateCircularSetting('ringGap', parseFloat(e.target.value))}
                />
              </div>
              <div className="visualizer-settings-field">
                <label>Rotation Speed ({circularSettings.rotationSpeed > 0 ? '+' : ''}{circularSettings.rotationSpeed.toFixed(1)}x)</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={circularSettings.rotationSpeed}
                  onChange={(e) => updateCircularSetting('rotationSpeed', parseFloat(e.target.value))}
                />
              </div>
              <div className="visualizer-settings-field">
                <label>Start Angle ({Math.round(circularSettings.startAngle)}°)</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={circularSettings.startAngle}
                  onChange={(e) => updateCircularSetting('startAngle', parseFloat(e.target.value))}
                />
              </div>
              <div className="visualizer-settings-field">
                <label>Energy Spread</label>
                <div className="visualizer-settings-toggle">
                  <button
                    className={`visualizer-toggle-btn ${circularSettings.energySpread === 'linear' ? 'active' : ''}`}
                    onClick={() => updateCircularSetting('energySpread', 'linear')}
                  >
                    Linear
                  </button>
                  <button
                    className={`visualizer-toggle-btn ${circularSettings.energySpread === 'log' ? 'active' : ''}`}
                    onClick={() => updateCircularSetting('energySpread', 'log')}
                  >
                    Log
                  </button>
                </div>
              </div>
              <div className="visualizer-settings-field">
                <label>Bar Spread ({circularSettings.barSpread.toFixed(1)}x)</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={circularSettings.barSpread}
                  onChange={(e) => updateCircularSetting('barSpread', parseFloat(e.target.value))}
                />
              </div>
              <div className="visualizer-settings-field">
                <label>Sensitivity ({Math.round(circularSettings.sensitivity * 100)}%)</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={circularSettings.sensitivity}
                  onChange={(e) => updateCircularSetting('sensitivity', parseFloat(e.target.value))}
                />
              </div>
            </>
          )}

          {selectedVisualizer === 'equalizer-v2' && (
            <>
              <div className="visualizer-settings-field">
                <label>Bass Gain ({clubSettings.bassGain.toFixed(1)}x)</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={clubSettings.bassGain}
                  onChange={(e) => updateClubSetting('bassGain', parseFloat(e.target.value))}
                />
              </div>
              <div className="visualizer-settings-field">
                <label>Sensitivity ({Math.round(clubSettings.sensitivity * 100)}%)</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={clubSettings.sensitivity}
                  onChange={(e) => updateClubSetting('sensitivity', parseFloat(e.target.value))}
                />
              </div>
              <div className="visualizer-settings-field">
                <label>Vertical Scale ({Math.round(clubSettings.verticalScale * 100)}%)</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={clubSettings.verticalScale}
                  onChange={(e) => updateClubSetting('verticalScale', parseFloat(e.target.value))}
                />
              </div>
              <div className="visualizer-settings-field">
                <label>Decay ({Math.round(clubSettings.decay * 100)}%)</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={clubSettings.decay}
                  onChange={(e) => updateClubSetting('decay', parseFloat(e.target.value))}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Canvas for visualizer rendering */}
      <div
        className="visualizer-canvas-wrapper"
        style={{
          ...(effectsEnabled ? { transform: `translate(${offsetX}px, ${offsetY}px)` } : {}),
          ...(aspectRatio ? { aspectRatio: `${aspectRatio.width} / ${aspectRatio.height}` } : {}),
        }}
      >
        <canvas ref={canvasRef} className="visualizer-canvas" />
      </div>

      {/* Render background (renders at layer priority 0) */}
      <BackgroundRenderer
        renderer={renderer}
        config={backgroundConfig}
        width={renderer?.width ?? 800}
        height={renderer?.height ?? 400}
      />

      {/* Render selected visualizer (registers render callback) */}
      {selectedVisualizer === 'equalizer' && <EqualizerVisualizer {...visualizerProps} />}
      {selectedVisualizer === 'equalizer-v2' && <EqualizerV2Visualizer {...visualizerProps} />}
      {selectedVisualizer === 'waveform' && <WaveformVisualizer {...visualizerProps} />}
      {selectedVisualizer === 'circular' && <CircularSpectrumVisualizer {...visualizerProps} />}

      {/* Render text layers on top of visualizers */}
      <TextLayerRenderer
        renderer={renderer}
        layers={textLayers ?? []}
        isBeat={beatInfo?.isBeat ?? false}
        beatIntensity={beatInfo?.intensity ?? 0}
        width={renderer?.width ?? 800}
        height={renderer?.height ?? 400}
      />
    </div>
  );
}
