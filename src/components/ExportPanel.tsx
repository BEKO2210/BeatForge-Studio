import { useState, useRef, useCallback } from 'react';
import type { AudioEngine } from '../audio/AudioEngine';
import { VideoExporter } from '../export/VideoExporter';
import {
  EXPORT_RESOLUTIONS,
  type ExportResolution,
  type ExportProgress,
} from '../export/types';
import './ExportPanel.css';

export interface ExportPanelProps {
  canvas: HTMLCanvasElement | null;
  audioEngine: AudioEngine | null;
  disabled?: boolean;
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const generateFilename = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `beatforge-export-${timestamp}.webm`;
};

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Highest-quality default (1080p — last in the array)
const DEFAULT_RESOLUTION =
  EXPORT_RESOLUTIONS[EXPORT_RESOLUTIONS.length - 1] ?? EXPORT_RESOLUTIONS[0]!;

export function ExportPanel({
  canvas,
  audioEngine,
  disabled = false,
}: ExportPanelProps) {
  const [selectedResolution, setSelectedResolution] =
    useState<ExportResolution>(DEFAULT_RESOLUTION);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exporterRef = useRef<VideoExporter | null>(null);

  const canExport = canvas !== null && audioEngine !== null && !disabled;

  const handleStartExport = useCallback(async () => {
    if (!canvas || !audioEngine || isExporting) return;

    setIsExporting(true);
    setExportProgress({ state: 'preparing', progress: 0 });

    try {
      const exporter = new VideoExporter(canvas, audioEngine, {
        onProgress: (progress) => {
          setExportProgress(progress);
        },
        onComplete: (blob) => {
          downloadBlob(blob, generateFilename());
          setIsExporting(false);
          exporterRef.current = null;
        },
      });

      exporterRef.current = exporter;
      await exporter.start({ resolution: selectedResolution });
    } catch (err) {
      console.error('Export failed:', err);
      setExportProgress({
        state: 'error',
        progress: 0,
        error: err instanceof Error ? err.message : 'Export failed',
      });
      setIsExporting(false);
      exporterRef.current = null;
    }
  }, [canvas, audioEngine, isExporting, selectedResolution]);

  const handleCancelExport = useCallback(() => {
    if (exporterRef.current) {
      exporterRef.current.stop();
      setIsExporting(false);
      setExportProgress(null);
      exporterRef.current = null;
    }
  }, []);

  const getStatusText = () => {
    if (!exportProgress) return '';
    const { state, progress, currentTime, totalDuration, error } = exportProgress;
    switch (state) {
      case 'preparing':
        return 'Preparing...';
      case 'recording': {
        const pct = Math.round(progress * 100);
        if (
          typeof currentTime === 'number' &&
          typeof totalDuration === 'number' &&
          totalDuration > 0
        ) {
          const remaining = Math.max(0, totalDuration - currentTime);
          return `Recording ${pct}% · ${formatTime(currentTime)} / ${formatTime(totalDuration)} · ~${formatTime(remaining)} left`;
        }
        return `Recording ${pct}%`;
      }
      case 'encoding':
        return 'Encoding...';
      case 'complete':
        return 'Complete! Downloading...';
      case 'error':
        return error ?? 'Export failed';
      default:
        return '';
    }
  };

  return (
    <div className={`export-panel ${disabled ? 'export-panel--disabled' : ''}`}>
      <div className="export-panel-header">
        <h3 className="export-panel-title">Export</h3>
      </div>

      <div className="export-resolution-selector">
        {EXPORT_RESOLUTIONS.map((resolution) => (
          <button
            key={resolution.id}
            className={`export-resolution-btn ${selectedResolution.id === resolution.id ? 'active' : ''}`}
            onClick={() => setSelectedResolution(resolution)}
            disabled={isExporting}
            title={resolution.label}
          >
            {resolution.label}
          </button>
        ))}
      </div>

      <div className="export-controls">
        {!isExporting ? (
          <button
            className="export-btn"
            onClick={handleStartExport}
            disabled={!canExport}
          >
            Export Video
          </button>
        ) : (
          <button
            className="export-btn export-btn--cancel"
            onClick={handleCancelExport}
          >
            Cancel
          </button>
        )}
      </div>

      {isExporting && exportProgress && (
        <div className="export-progress">
          <div
            className="export-progress-bar"
            style={{ width: `${exportProgress.progress * 100}%` }}
          />
        </div>
      )}

      {exportProgress && (
        <div className={`export-status ${exportProgress.state === 'error' ? 'export-status--error' : ''}`}>
          {getStatusText()}
        </div>
      )}
    </div>
  );
}
