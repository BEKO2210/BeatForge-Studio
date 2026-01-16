import { useCallback, useState } from 'react';
import type { TextLayer, TextAnimation, TextPosition, BeatEffectSettings } from '../text/types';
import { DEFAULT_BEAT_EFFECTS } from '../text/types';

/**
 * Props for TextEditor component
 */
export interface TextEditorProps {
  /** Current text layers */
  layers: TextLayer[];
  /** Callback when layers change */
  onLayersChange: (layers: TextLayer[]) => void;
  /** Whether the editor is disabled */
  disabled?: boolean;
}

/** Available font families */
const FONT_FAMILIES = [
  'Inter, system-ui, sans-serif',
  'Arial, sans-serif',
  'Georgia, serif',
  'Courier New, monospace',
  'Impact, sans-serif',
];

/** Available animation types grouped by category */
const ANIMATION_OPTIONS: { value: TextAnimation; label: string; group: string }[] = [
  // Basic
  { value: 'none', label: 'None', group: 'Basic' },
  { value: 'fade', label: 'Fade In', group: 'Basic' },
  { value: 'scale', label: 'Scale In', group: 'Basic' },
  // Slides
  { value: 'slide-up', label: 'Slide Up', group: 'Slide' },
  { value: 'slide-down', label: 'Slide Down', group: 'Slide' },
  { value: 'slide-left', label: 'Slide Left', group: 'Slide' },
  { value: 'slide-right', label: 'Slide Right', group: 'Slide' },
  // Beat Effects
  { value: 'pulse', label: 'Pulse', group: 'Beat' },
  { value: 'shake', label: 'Shake', group: 'Beat' },
  { value: 'wobble', label: 'Wobble', group: 'Beat' },
  { value: 'glow', label: 'Glow', group: 'Beat' },
];

/** Available anchor options */
const ANCHOR_OPTIONS: { value: TextPosition['anchor']; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

/**
 * TextEditor - UI for managing text layers
 *
 * Allows users to add, edit, and remove text layers with full control
 * over content, position, styling, animations, and beat effects.
 */
export function TextEditor({
  layers,
  onLayersChange,
  disabled = false,
}: TextEditorProps) {
  // Track which layers are expanded
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());

  const handleAddLayer = useCallback(() => {
    const newLayer: TextLayer = {
      id: crypto.randomUUID(),
      content: 'New Text',
      position: { x: 0.5, y: 0.5, anchor: 'center' },
      style: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
      },
      animation: 'pulse', // Default to a beat-reactive animation
      beatReactive: true,
      visible: true,
      createdAt: Date.now(),
      beatEffects: { ...DEFAULT_BEAT_EFFECTS },
    };

    onLayersChange([...layers, newLayer]);
    // Auto-expand the new layer
    setExpandedLayers((prev) => new Set([...prev, newLayer.id]));
  }, [layers, onLayersChange]);

  const handleDeleteLayer = useCallback(
    (id: string) => {
      onLayersChange(layers.filter((layer) => layer.id !== id));
      setExpandedLayers((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [layers, onLayersChange]
  );

  const handleUpdateLayer = useCallback(
    (id: string, updates: Partial<TextLayer>) => {
      onLayersChange(
        layers.map((layer) =>
          layer.id === id ? { ...layer, ...updates } : layer
        )
      );
    },
    [layers, onLayersChange]
  );

  const handleUpdateBeatEffects = useCallback(
    (id: string, updates: Partial<BeatEffectSettings>) => {
      onLayersChange(
        layers.map((layer) =>
          layer.id === id
            ? { ...layer, beatEffects: { ...layer.beatEffects, ...updates } }
            : layer
        )
      );
    },
    [layers, onLayersChange]
  );

  const toggleExpanded = useCallback((id: string) => {
    setExpandedLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Check if animation is beat-reactive
  const isBeatAnimation = (anim: TextAnimation) =>
    ['pulse', 'shake', 'wobble', 'glow'].includes(anim);

  // Replay intro animation by resetting createdAt
  const handleReplayIntro = useCallback(
    (id: string) => {
      handleUpdateLayer(id, { createdAt: Date.now() });
    },
    [handleUpdateLayer]
  );

  return (
    <div className={`text-editor ${disabled ? 'text-editor--disabled' : ''}`}>
      <div className="text-editor-header">
        <h3 className="text-editor-title">Text Layers</h3>
        <button
          className="text-editor-add-btn"
          onClick={handleAddLayer}
          disabled={disabled}
        >
          + Add Text
        </button>
      </div>

      {layers.length === 0 && (
        <p className="text-editor-empty">No text layers. Click "Add Text" to create one.</p>
      )}

      <div className="text-editor-layers">
        {layers.map((layer, index) => {
          const isExpanded = expandedLayers.has(layer.id);
          const showBeatControls = isBeatAnimation(layer.animation) || layer.beatReactive;

          return (
            <div key={layer.id} className="text-editor-layer">
              <div
                className="text-editor-layer-header"
                onClick={() => toggleExpanded(layer.id)}
              >
                <span className="text-editor-layer-expand">
                  {isExpanded ? '▼' : '▶'}
                </span>
                <span className="text-editor-layer-name">
                  Layer {index + 1}: {layer.content.slice(0, 20)}
                  {layer.content.length > 20 ? '...' : ''}
                </span>
                <div className="text-editor-layer-actions">
                  <label
                    className="text-editor-visibility"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={(e) =>
                        handleUpdateLayer(layer.id, { visible: e.target.checked })
                      }
                      disabled={disabled}
                    />
                    <span className="text-editor-visibility-icon">
                      {layer.visible ? '👁' : '👁‍🗨'}
                    </span>
                  </label>
                  <button
                    className="text-editor-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLayer(layer.id);
                    }}
                    disabled={disabled}
                    aria-label="Delete layer"
                  >
                    ×
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="text-editor-layer-content">
                  {/* Text Content */}
                  <div className="text-editor-field">
                    <label>Content</label>
                    <input
                      type="text"
                      value={layer.content}
                      onChange={(e) =>
                        handleUpdateLayer(layer.id, { content: e.target.value })
                      }
                      disabled={disabled}
                    />
                  </div>

                  {/* Position */}
                  <div className="text-editor-section">
                    <h4>Position</h4>
                    <div className="text-editor-row">
                      <div className="text-editor-field text-editor-field--small">
                        <label>X ({Math.round(layer.position.x * 100)}%)</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={layer.position.x}
                          onChange={(e) =>
                            handleUpdateLayer(layer.id, {
                              position: {
                                ...layer.position,
                                x: parseFloat(e.target.value),
                              },
                            })
                          }
                          disabled={disabled}
                        />
                      </div>
                      <div className="text-editor-field text-editor-field--small">
                        <label>Y ({Math.round(layer.position.y * 100)}%)</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={layer.position.y}
                          onChange={(e) =>
                            handleUpdateLayer(layer.id, {
                              position: {
                                ...layer.position,
                                y: parseFloat(e.target.value),
                              },
                            })
                          }
                          disabled={disabled}
                        />
                      </div>
                    </div>
                    <div className="text-editor-field">
                      <label>Anchor</label>
                      <select
                        value={layer.position.anchor}
                        onChange={(e) =>
                          handleUpdateLayer(layer.id, {
                            position: {
                              ...layer.position,
                              anchor: e.target.value as TextPosition['anchor'],
                            },
                          })
                        }
                        disabled={disabled}
                      >
                        {ANCHOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Style */}
                  <div className="text-editor-section">
                    <h4>Style</h4>
                    <div className="text-editor-field">
                      <label>Font Family</label>
                      <select
                        value={layer.style.fontFamily}
                        onChange={(e) =>
                          handleUpdateLayer(layer.id, {
                            style: { ...layer.style, fontFamily: e.target.value },
                          })
                        }
                        disabled={disabled}
                      >
                        {FONT_FAMILIES.map((font) => (
                          <option key={font} value={font}>
                            {font.split(',')[0]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-editor-row">
                      <div className="text-editor-field text-editor-field--small">
                        <label>Size ({layer.style.fontSize}px)</label>
                        <input
                          type="range"
                          min="12"
                          max="150"
                          step="1"
                          value={layer.style.fontSize}
                          onChange={(e) =>
                            handleUpdateLayer(layer.id, {
                              style: {
                                ...layer.style,
                                fontSize: parseInt(e.target.value, 10),
                              },
                            })
                          }
                          disabled={disabled}
                        />
                      </div>
                      <div className="text-editor-field text-editor-field--small">
                        <label>Weight</label>
                        <div className="text-editor-toggle">
                          <button
                            className={`text-editor-toggle-btn ${
                              layer.style.fontWeight === 'normal' ? 'active' : ''
                            }`}
                            onClick={() =>
                              handleUpdateLayer(layer.id, {
                                style: { ...layer.style, fontWeight: 'normal' },
                              })
                            }
                            disabled={disabled}
                          >
                            Normal
                          </button>
                          <button
                            className={`text-editor-toggle-btn ${
                              layer.style.fontWeight === 'bold' ? 'active' : ''
                            }`}
                            onClick={() =>
                              handleUpdateLayer(layer.id, {
                                style: { ...layer.style, fontWeight: 'bold' },
                              })
                            }
                            disabled={disabled}
                          >
                            Bold
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-editor-field">
                      <label>Color</label>
                      <div className="text-editor-color-row">
                        <input
                          type="color"
                          value={layer.style.color}
                          onChange={(e) =>
                            handleUpdateLayer(layer.id, {
                              style: { ...layer.style, color: e.target.value },
                            })
                          }
                          disabled={disabled}
                        />
                        <span className="text-editor-color-value">
                          {layer.style.color}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Animation */}
                  <div className="text-editor-section">
                    <h4>Animation</h4>
                    <div className="text-editor-field">
                      <label>Effect Type</label>
                      <select
                        value={layer.animation}
                        onChange={(e) =>
                          handleUpdateLayer(layer.id, {
                            animation: e.target.value as TextAnimation,
                          })
                        }
                        disabled={disabled}
                      >
                        <optgroup label="Intro (one-time)">
                          {ANIMATION_OPTIONS.filter(o => o.group === 'Basic').map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Slide In">
                          {ANIMATION_OPTIONS.filter(o => o.group === 'Slide').map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Beat Reactive">
                          {ANIMATION_OPTIONS.filter(o => o.group === 'Beat').map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    {layer.animation !== 'none' && (
                      <button
                        className="text-editor-replay-btn"
                        onClick={() => handleReplayIntro(layer.id)}
                        disabled={disabled}
                      >
                        Replay Intro Animation
                      </button>
                    )}
                    {!isBeatAnimation(layer.animation) && (
                      <div className="text-editor-field">
                        <label className="text-editor-checkbox-label">
                          <input
                            type="checkbox"
                            checked={layer.beatReactive}
                            onChange={(e) =>
                              handleUpdateLayer(layer.id, {
                                beatReactive: e.target.checked,
                              })
                            }
                            disabled={disabled}
                          />
                          Add Beat Effects
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Beat Effect Controls - Show when using beat animations or beatReactive */}
                  {showBeatControls && (
                    <div className="text-editor-section">
                      <h4>Beat Controls</h4>
                      <div className="text-editor-field">
                        <label>
                          Sensitivity ({Math.round(layer.beatEffects.sensitivity * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={layer.beatEffects.sensitivity}
                          onChange={(e) =>
                            handleUpdateBeatEffects(layer.id, {
                              sensitivity: parseFloat(e.target.value),
                            })
                          }
                          disabled={disabled}
                        />
                      </div>
                      <div className="text-editor-field">
                        <label>
                          Beat Strength ({Math.round(layer.beatEffects.beatStrength * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={layer.beatEffects.beatStrength}
                          onChange={(e) =>
                            handleUpdateBeatEffects(layer.id, {
                              beatStrength: parseFloat(e.target.value),
                            })
                          }
                          disabled={disabled}
                        />
                      </div>
                      <div className="text-editor-field">
                        <label>
                          Shake Intensity ({Math.round(layer.beatEffects.shakeIntensity * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={layer.beatEffects.shakeIntensity}
                          onChange={(e) =>
                            handleUpdateBeatEffects(layer.id, {
                              shakeIntensity: parseFloat(e.target.value),
                            })
                          }
                          disabled={disabled}
                        />
                      </div>
                      <div className="text-editor-field">
                        <label>
                          Glow Intensity ({Math.round(layer.beatEffects.glowIntensity * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={layer.beatEffects.glowIntensity}
                          onChange={(e) =>
                            handleUpdateBeatEffects(layer.id, {
                              glowIntensity: parseFloat(e.target.value),
                            })
                          }
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
