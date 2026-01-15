import { useState, useRef, useEffect } from 'react';
import type { AudioEngine } from '../audio/AudioEngine';
import { useRenderer } from '../hooks/useRenderer';
import { useBeatDetector } from '../hooks/useBeatDetector';
import { EqualizerVisualizer } from './EqualizerVisualizer';
import { WaveformVisualizer } from './WaveformVisualizer';
import { CircularSpectrumVisualizer } from './CircularSpectrumVisualizer';
import { TextLayerRenderer, type TextLayer } from '../text';
import type { VisualizerType } from './types';

interface AudioDataState {
  frequencyData: Float32Array | null;
  timeDomainData: Float32Array | null;
}

interface VisualizerContainerProps {
  audioEngine: AudioEngine | null;
  textLayers?: TextLayer[];
  className?: string;
}

/**
 * Container component that hosts visualizers with a selector UI
 * Manages audio data polling and passes it to the selected visualizer
 */
export function VisualizerContainer({
  audioEngine,
  textLayers,
  className,
}: VisualizerContainerProps) {
  const [selectedVisualizer, setSelectedVisualizer] = useState<VisualizerType>('equalizer');
  const [audioData, setAudioData] = useState<AudioDataState>({
    frequencyData: null,
    timeDomainData: null,
  });

  // Canvas and renderer
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { renderer } = useRenderer(canvasRef, { height: 400 });

  // Beat detection for isBeat and intensity
  const { beatInfo } = useBeatDetector(audioEngine);

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

  // Common props for all visualizers
  const visualizerProps = {
    renderer,
    frequencyData: audioData.frequencyData,
    timeDomainData: audioData.timeDomainData,
    isBeat: beatInfo?.isBeat ?? false,
    beatIntensity: beatInfo?.intensity ?? 0,
    width: renderer?.width ?? 800,
    height: renderer?.height ?? 400,
  };

  return (
    <div className={`visualizer-container ${className ?? ''}`}>
      {/* Visualizer selector buttons */}
      <div className="visualizer-selector">
        <button
          className={`visualizer-selector-btn ${selectedVisualizer === 'equalizer' ? 'active' : ''}`}
          onClick={() => setSelectedVisualizer('equalizer')}
        >
          Equalizer
        </button>
        <button
          className={`visualizer-selector-btn ${selectedVisualizer === 'waveform' ? 'active' : ''}`}
          onClick={() => setSelectedVisualizer('waveform')}
        >
          Waveform
        </button>
        <button
          className={`visualizer-selector-btn ${selectedVisualizer === 'circular' ? 'active' : ''}`}
          onClick={() => setSelectedVisualizer('circular')}
        >
          Circular
        </button>
      </div>

      {/* Canvas for visualizer rendering */}
      <div className="visualizer-canvas-wrapper">
        <canvas ref={canvasRef} className="visualizer-canvas" />
      </div>

      {/* Render selected visualizer (registers render callback) */}
      {selectedVisualizer === 'equalizer' && <EqualizerVisualizer {...visualizerProps} />}
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
