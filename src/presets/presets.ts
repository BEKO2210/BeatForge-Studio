/**
 * Preset Definitions
 *
 * Four distinct visual styles for different use cases:
 * - TikTok: High energy, 9:16, bold text
 * - YouTube: Cinematic, 16:9, minimal text
 * - Lyric Video: Text-centric, soft backgrounds
 * - Club Visualizer: Dark, neon, rave aesthetic
 */

import type { PresetConfig, PresetId } from './types';
import { ASPECT_RATIOS } from './types';
import type { TextLayer } from '../text/types';
import { DEFAULT_BEAT_EFFECTS } from '../text/types';

/**
 * Helper to create a text layer with defaults
 */
function createTextLayer(
  id: string,
  content: string,
  overrides: Partial<TextLayer>
): TextLayer {
  return {
    id,
    content,
    position: { x: 0.5, y: 0.5, anchor: 'center' },
    style: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 48,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    animation: 'pulse',
    beatReactive: true,
    visible: true,
    createdAt: Date.now(),
    beatEffects: DEFAULT_BEAT_EFFECTS,
    ...overrides,
  };
}

/**
 * TikTok Preset (PRE-01)
 *
 * High energy vertical format for short-form content.
 * Bold, centered text with strong beat reactivity.
 */
export const TIKTOK_PRESET: PresetConfig = {
  id: 'tiktok',
  name: 'TikTok',
  description: 'High energy, vertical format, bold text',
  aspectRatio: ASPECT_RATIOS.portrait,
  visualizer: {
    type: 'circular',
    circularSettings: {
      ringGap: 0.2,
      barSpread: 1.2,
      sensitivity: 0.8,
      rotationSpeed: 1.5,
      startAngle: 0,
      energySpread: 'log',
    },
  },
  background: {
    type: 'gradient',
    gradientType: 'linear',
    angle: 135,
    stops: [
      { color: '#1a0a2e', position: 0 },
      { color: '#3d1a5c', position: 0.5 },
      { color: '#1a0a2e', position: 1 },
    ],
  },
  defaultTextLayers: [
    createTextLayer('tiktok-title', 'YOUR TRACK', {
      position: { x: 0.5, y: 0.15, anchor: 'center' },
      style: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 64,
        fontWeight: 'bold',
        color: '#ffffff',
        shadow: {
          color: '#ff00ff',
          blur: 20,
          offsetX: 0,
          offsetY: 0,
        },
      },
      animation: 'pulse',
      beatEffects: {
        sensitivity: 0.8,
        beatStrength: 0.9,
        smoothness: 0.4,
        shakeIntensity: 0.7,
        glowIntensity: 0.9,
      },
    }),
  ],
  effects: {
    cameraShake: {
      enabled: true,
      maxOffset: 12,
      decayMs: 80,
      threshold: 0.5,
    },
    vignette: {
      enabled: true,
      intensity: 0.45,
      softness: 0.4,
    },
  },
};

/**
 * YouTube Preset (PRE-02)
 *
 * Cinematic widescreen format with calm transitions.
 * Minimal, subtle text in the corner.
 */
export const YOUTUBE_PRESET: PresetConfig = {
  id: 'youtube',
  name: 'YouTube',
  description: 'Cinematic, widescreen, calm vibes',
  aspectRatio: ASPECT_RATIOS.landscape,
  visualizer: {
    type: 'equalizer-v2',
    clubSettings: {
      bassGain: 1.0,
      sensitivity: 0.4,
      verticalScale: 0.8,
      decay: 0.7,
    },
  },
  background: {
    type: 'gradient',
    gradientType: 'linear',
    angle: 180,
    stops: [
      { color: '#0a0a1a', position: 0 },
      { color: '#1a1a3a', position: 0.6 },
      { color: '#0a0a1a', position: 1 },
    ],
  },
  defaultTextLayers: [
    createTextLayer('youtube-title', 'Track Title', {
      position: { x: 0.05, y: 0.9, anchor: 'left' },
      style: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 24,
        fontWeight: 'normal',
        color: 'rgba(255, 255, 255, 0.7)',
      },
      animation: 'fade',
      beatReactive: false,
      beatEffects: {
        sensitivity: 0.3,
        beatStrength: 0.2,
        smoothness: 0.8,
        shakeIntensity: 0.1,
        glowIntensity: 0.2,
      },
    }),
  ],
  effects: {
    cameraShake: {
      enabled: true,
      maxOffset: 4,
      decayMs: 150,
      threshold: 0.7,
    },
    vignette: {
      enabled: true,
      intensity: 0.25,
      softness: 0.6,
    },
  },
};

/**
 * Lyric Video Preset (PRE-03)
 *
 * Text-centric design with soft, pastel backgrounds.
 * Karaoke-style centered text with glow animation.
 */
export const LYRIC_PRESET: PresetConfig = {
  id: 'lyric',
  name: 'Lyric Video',
  description: 'Text-focused, soft backgrounds, karaoke style',
  aspectRatio: ASPECT_RATIOS.landscape,
  visualizer: {
    type: 'waveform',
  },
  background: {
    type: 'gradient',
    gradientType: 'radial',
    angle: 0,
    stops: [
      { color: '#2d1b4e', position: 0 },
      { color: '#1a1028', position: 0.7 },
      { color: '#0d0810', position: 1 },
    ],
  },
  defaultTextLayers: [
    createTextLayer('lyric-main', 'Your lyrics here...', {
      position: { x: 0.5, y: 0.5, anchor: 'center' },
      style: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 56,
        fontWeight: 'bold',
        color: '#ffffff',
        shadow: {
          color: '#8b5cf6',
          blur: 30,
          offsetX: 0,
          offsetY: 0,
        },
      },
      animation: 'glow',
      beatEffects: {
        sensitivity: 0.6,
        beatStrength: 0.5,
        smoothness: 0.7,
        shakeIntensity: 0.2,
        glowIntensity: 1.0,
      },
    }),
  ],
  effects: {
    cameraShake: {
      enabled: false,
      maxOffset: 0,
      decayMs: 100,
      threshold: 1.0,
    },
    vignette: {
      enabled: true,
      intensity: 0.3,
      softness: 0.5,
    },
  },
};

/**
 * Club Visualizer Preset (PRE-04)
 *
 * Dark, neon aesthetic with maximum energy.
 * Strong equalizer with rave-inspired colors.
 */
export const CLUB_PRESET: PresetConfig = {
  id: 'club',
  name: 'Club Visualizer',
  description: 'Dark, neon, maximum energy rave aesthetic',
  aspectRatio: ASPECT_RATIOS.landscape,
  visualizer: {
    type: 'equalizer-v2',
    clubSettings: {
      bassGain: 1.8,
      sensitivity: 0.9,
      verticalScale: 1.3,
      decay: 0.3,
    },
  },
  background: {
    type: 'solid',
    color: '#000000',
  },
  defaultTextLayers: [
    createTextLayer('club-title', 'DROP THE BASS', {
      position: { x: 0.5, y: 0.85, anchor: 'center' },
      style: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#00ffff',
        strokeColor: '#ff00ff',
        strokeWidth: 2,
        shadow: {
          color: '#00ffff',
          blur: 25,
          offsetX: 0,
          offsetY: 0,
        },
      },
      animation: 'shake',
      beatEffects: {
        sensitivity: 0.9,
        beatStrength: 1.0,
        smoothness: 0.3,
        shakeIntensity: 1.0,
        glowIntensity: 1.0,
      },
    }),
  ],
  effects: {
    cameraShake: {
      enabled: true,
      maxOffset: 15,
      decayMs: 60,
      threshold: 0.4,
    },
    vignette: {
      enabled: true,
      intensity: 0.5,
      softness: 0.35,
    },
  },
};

/**
 * All available presets
 */
export const PRESETS: Record<PresetId, PresetConfig> = {
  tiktok: TIKTOK_PRESET,
  youtube: YOUTUBE_PRESET,
  lyric: LYRIC_PRESET,
  club: CLUB_PRESET,
};

/**
 * Ordered list of presets for UI display
 */
export const PRESET_LIST: PresetConfig[] = [
  TIKTOK_PRESET,
  YOUTUBE_PRESET,
  LYRIC_PRESET,
  CLUB_PRESET,
];

/**
 * Default preset to use when app loads
 */
export const DEFAULT_PRESET_ID: PresetId = 'youtube';
export const DEFAULT_PRESET: PresetConfig = YOUTUBE_PRESET;
