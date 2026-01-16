import { useState, useRef, useCallback } from 'react';
import type { AudioEngine } from '../audio/AudioEngine';
import { VideoExporter } from '../export/VideoExporter';
import {
  EXPORT_RESOLUTIONS,
  type ExportResolution,
  type ExportProgress,
} from '../export/types';
import './ExportPanel.css';

/**
 * Props for ExportPanel component
 */
export interface ExportPanelProps {
  /** Canvas element to capture for export */
  canvas: HTMLCanvasElement | null;
  /** Audio engine for audio capture */
  audioEngine: AudioEngine | null;
  /** Whether the panel is disabled */
  disabled?: boolean;
}

/**
 * Download a blob as a file
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Generate export filename with timestamp
 */
const generateFilename = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `beatforge-export-${timestamp}.webm`;
};

/**
 * ExportPanel - UI for exporting visualizer to video
 *
 * Allows users to select resolution, start/stop export, and shows progress.
 */
export function ExportPanel({
  canvas,
  audioEngine,
  disabled = false,
}: ExportPanelProps) {
  const [selectedResolution, setSelectedResolution] = useState<ExportResolution>(
    EXPORT_RESOLUTIONS[1] ?? EXPORT_RESOLUTIONS[0]! // Default to 1080p
  );
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exporterRef = useRef<VideoExporter | null>(null);

  // Can only export when canvas and audio are available
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

  // Get status text based on export state
  const getStatusText = () => {
    if (!exportProgress) return '';
    switch (exportProgress.state) {
      case 'preparing':
        return 'Preparing...';
      case 'recording':
        return `Recording ${Math.round(exportProgress.progress * 100)}%`;
      case 'encoding':
        return 'Encoding...';
      case 'complete':
        return 'Complete! Downloading...';
      case 'error':
        return exportProgress.error ?? 'Export failed';
      default:
        return '';
    }
  };

  return (
    <div className={`export-panel ${disabled ? 'export-panel--disabled' : ''}`}>
      <div className="export-panel-header">
        <h3 className="export-panel-title">Export</h3>
      </div>

      {/* Resolution selector */}
      <div className="export-resolution-selector">
        {EXPORT_RESOLUTIONS.map((resolution) => (
          <button
            key={resolution.id}
            className={`export-resolution-btn ${selectedResolution.id === resolution.id ? 'active' : ''}`}
            onClick={() => setSelectedResolution(resolution)}
            disabled={isExporting}
          >
            {resolution.label}
          </button>
        ))}
      </div>

      {/* Export controls */}
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

      {/* Progress bar */}
      {isExporting && exportProgress && (
        <div className="export-progress">
          <div
            className="export-progress-bar"
            style={{ width: `${exportProgress.progress * 100}%` }}
          />
        </div>
      )}

      {/* Status text */}
      {exportProgress && (
        <div className={`export-status ${exportProgress.state === 'error' ? 'export-status--error' : ''}`}>
          {getStatusText()}
        </div>
      )}
    </div>
  );
}
