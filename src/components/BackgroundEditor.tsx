import { useCallback, useRef } from 'react';
import type {
  BackgroundConfig,
  SolidBackground,
  GradientBackground,
  GradientStop,
  ImageBackground,
} from '../background';
import { DEFAULT_GRADIENT, DEFAULT_IMAGE } from '../background';

/**
 * Props for BackgroundEditor component
 */
export interface BackgroundEditorProps {
  /** Current background configuration */
  config: BackgroundConfig;
  /** Callback when configuration changes */
  onConfigChange: (config: BackgroundConfig) => void;
  /** Whether the editor is disabled */
  disabled?: boolean;
}

/**
 * BackgroundEditor - UI for customizing background settings
 *
 * Supports:
 * - Solid color with color picker
 * - Gradient with type, angle, and color stops
 * - Image with upload, fit mode, and opacity
 */
export function BackgroundEditor({
  config,
  onConfigChange,
  disabled = false,
}: BackgroundEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle background type change
  const handleTypeChange = useCallback(
    (type: BackgroundConfig['type']) => {
      if (type === config.type) return;

      switch (type) {
        case 'solid':
          onConfigChange({ type: 'solid', color: '#1a1a1a' });
          break;
        case 'gradient':
          onConfigChange({ ...DEFAULT_GRADIENT });
          break;
        case 'image':
          // Don't switch to image without a source - trigger file picker
          fileInputRef.current?.click();
          break;
      }
    },
    [config.type, onConfigChange]
  );

  // Handle solid color change
  const handleSolidColorChange = useCallback(
    (color: string) => {
      onConfigChange({ type: 'solid', color } as SolidBackground);
    },
    [onConfigChange]
  );

  // Handle gradient changes
  const handleGradientTypeChange = useCallback(
    (gradientType: 'linear' | 'radial') => {
      if (config.type !== 'gradient') return;
      onConfigChange({ ...config, gradientType });
    },
    [config, onConfigChange]
  );

  const handleGradientAngleChange = useCallback(
    (angle: number) => {
      if (config.type !== 'gradient') return;
      onConfigChange({ ...config, angle });
    },
    [config, onConfigChange]
  );

  const handleGradientStopColorChange = useCallback(
    (index: number, color: string) => {
      if (config.type !== 'gradient') return;
      const stops = [...config.stops];
      if (stops[index]) {
        stops[index] = { ...stops[index], color };
        onConfigChange({ ...config, stops } as GradientBackground);
      }
    },
    [config, onConfigChange]
  );

  const handleGradientStopPositionChange = useCallback(
    (index: number, position: number) => {
      if (config.type !== 'gradient') return;
      const stops = [...config.stops];
      if (stops[index]) {
        stops[index] = { ...stops[index], position };
        onConfigChange({ ...config, stops } as GradientBackground);
      }
    },
    [config, onConfigChange]
  );

  const handleAddGradientStop = useCallback(() => {
    if (config.type !== 'gradient' || config.stops.length >= 4) return;
    const lastStop = config.stops[config.stops.length - 1];
    const newStop: GradientStop = {
      color: lastStop?.color ?? '#ffffff',
      position: Math.min(1, (lastStop?.position ?? 0.5) + 0.25),
    };
    onConfigChange({ ...config, stops: [...config.stops, newStop] });
  }, [config, onConfigChange]);

  const handleRemoveGradientStop = useCallback(
    (index: number) => {
      if (config.type !== 'gradient' || config.stops.length <= 2) return;
      const stops = config.stops.filter((_, i) => i !== index);
      onConfigChange({ ...config, stops });
    },
    [config, onConfigChange]
  );

  // Handle image changes
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        if (src) {
          onConfigChange({
            ...DEFAULT_IMAGE,
            type: 'image',
            src,
          } as ImageBackground);
        }
      };
      reader.readAsDataURL(file);

      // Reset input
      e.target.value = '';
    },
    [onConfigChange]
  );

  const handleImageFitChange = useCallback(
    (fit: 'cover' | 'contain' | 'stretch') => {
      if (config.type !== 'image') return;
      onConfigChange({ ...config, fit });
    },
    [config, onConfigChange]
  );

  const handleImageOpacityChange = useCallback(
    (opacity: number) => {
      if (config.type !== 'image') return;
      onConfigChange({ ...config, opacity });
    },
    [config, onConfigChange]
  );

  return (
    <div className={`background-editor ${disabled ? 'background-editor--disabled' : ''}`}>
      <div className="background-editor-header">
        <h3 className="background-editor-title">Background</h3>
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      {/* Type selector */}
      <div className="background-editor-section">
        <div className="background-editor-type-selector">
          <button
            className={`background-type-btn ${config.type === 'solid' ? 'active' : ''}`}
            onClick={() => handleTypeChange('solid')}
            disabled={disabled}
          >
            Solid
          </button>
          <button
            className={`background-type-btn ${config.type === 'gradient' ? 'active' : ''}`}
            onClick={() => handleTypeChange('gradient')}
            disabled={disabled}
          >
            Gradient
          </button>
          <button
            className={`background-type-btn ${config.type === 'image' ? 'active' : ''}`}
            onClick={() => handleTypeChange('image')}
            disabled={disabled}
          >
            Image
          </button>
        </div>
      </div>

      {/* Solid color controls */}
      {config.type === 'solid' && (
        <div className="background-editor-section">
          <div className="background-editor-field">
            <label>Color</label>
            <div className="background-editor-color-row">
              <input
                type="color"
                value={config.color}
                onChange={(e) => handleSolidColorChange(e.target.value)}
                disabled={disabled}
              />
              <span className="background-editor-color-value">{config.color}</span>
            </div>
          </div>
        </div>
      )}

      {/* Gradient controls */}
      {config.type === 'gradient' && (
        <div className="background-editor-section">
          <div className="background-editor-field">
            <label>Type</label>
            <div className="background-editor-toggle">
              <button
                className={`background-toggle-btn ${config.gradientType === 'linear' ? 'active' : ''}`}
                onClick={() => handleGradientTypeChange('linear')}
                disabled={disabled}
              >
                Linear
              </button>
              <button
                className={`background-toggle-btn ${config.gradientType === 'radial' ? 'active' : ''}`}
                onClick={() => handleGradientTypeChange('radial')}
                disabled={disabled}
              >
                Radial
              </button>
            </div>
          </div>

          {config.gradientType === 'linear' && (
            <div className="background-editor-field">
              <label>Angle ({config.angle}°)</label>
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                value={config.angle}
                onChange={(e) => handleGradientAngleChange(parseInt(e.target.value, 10))}
                disabled={disabled}
              />
            </div>
          )}

          <div className="background-editor-field">
            <label>Color Stops</label>
            <div className="background-gradient-stops">
              {config.stops.map((stop, index) => (
                <div key={index} className="background-gradient-stop">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => handleGradientStopColorChange(index, e.target.value)}
                    disabled={disabled}
                  />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={stop.position}
                    onChange={(e) =>
                      handleGradientStopPositionChange(index, parseFloat(e.target.value))
                    }
                    disabled={disabled}
                  />
                  <span className="background-stop-position">
                    {Math.round(stop.position * 100)}%
                  </span>
                  {config.stops.length > 2 && (
                    <button
                      className="background-stop-remove"
                      onClick={() => handleRemoveGradientStop(index)}
                      disabled={disabled}
                      aria-label="Remove stop"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {config.stops.length < 4 && (
                <button
                  className="background-stop-add"
                  onClick={handleAddGradientStop}
                  disabled={disabled}
                >
                  + Add Stop
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image controls */}
      {config.type === 'image' && (
        <div className="background-editor-section">
          <div className="background-editor-field">
            <label>Image</label>
            <div className="background-image-controls">
              <button
                className="background-image-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                Choose Image
              </button>
              {config.src && (
                <div
                  className="background-image-preview"
                  style={{ backgroundImage: `url(${config.src})` }}
                />
              )}
            </div>
          </div>

          <div className="background-editor-field">
            <label>Fit Mode</label>
            <div className="background-editor-toggle background-editor-toggle--3">
              <button
                className={`background-toggle-btn ${config.fit === 'cover' ? 'active' : ''}`}
                onClick={() => handleImageFitChange('cover')}
                disabled={disabled}
              >
                Cover
              </button>
              <button
                className={`background-toggle-btn ${config.fit === 'contain' ? 'active' : ''}`}
                onClick={() => handleImageFitChange('contain')}
                disabled={disabled}
              >
                Contain
              </button>
              <button
                className={`background-toggle-btn ${config.fit === 'stretch' ? 'active' : ''}`}
                onClick={() => handleImageFitChange('stretch')}
                disabled={disabled}
              >
                Stretch
              </button>
            </div>
          </div>

          <div className="background-editor-field">
            <label>Opacity ({Math.round(config.opacity * 100)}%)</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.opacity}
              onChange={(e) => handleImageOpacityChange(parseFloat(e.target.value))}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}
