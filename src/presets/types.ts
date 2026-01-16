/**
 * Preset System Type Definitions
 *
 * Presets compose existing configuration types (background, text, visualizer, effects)
 * into cohesive visual themes for different use cases.
 */

import type { VisualizerType, CircularSettings, ClubSettings } from '../visualizers/types';
import type { TextLayer } from '../text/types';
import type { BackgroundConfig } from '../background/types';
import type { EffectsConfig } from '../effects/types';

/**
 * Unique identifier for each preset
 */
export type PresetId = 'tiktok' | 'youtube' | 'lyric' | 'club';

/**
 * Aspect ratio configuration for canvas sizing
 */
export interface AspectRatio {
  /** Width ratio component (e.g., 16 for 16:9) */
  width: number;
  /** Height ratio component (e.g., 9 for 16:9) */
  height: number;
  /** Display label (e.g., "16:9", "9:16") */
  label: string;
}

/**
 * Visualizer configuration within a preset
 */
export interface PresetVisualizerConfig {
  /** Which visualizer to use */
  type: VisualizerType;
  /** Settings for circular visualizer (if type is 'circular') */
  circularSettings?: CircularSettings;
  /** Settings for club/equalizer-v2 visualizer (if type is 'equalizer-v2') */
  clubSettings?: ClubSettings;
}

/**
 * Complete preset configuration
 * Composes all visual elements into a cohesive theme
 */
export interface PresetConfig {
  /** Unique preset identifier */
  id: PresetId;
  /** Display name */
  name: string;
  /** Short description of the preset's style */
  description: string;
  /** Canvas aspect ratio */
  aspectRatio: AspectRatio;
  /** Visualizer type and settings */
  visualizer: PresetVisualizerConfig;
  /** Background configuration */
  background: BackgroundConfig;
  /** Default text layers (user can modify/remove) */
  defaultTextLayers: TextLayer[];
  /** Effects configuration (camera shake, vignette) */
  effects: EffectsConfig;
}

/**
 * Common aspect ratios used by presets
 */
export const ASPECT_RATIOS = {
  /** 9:16 portrait (TikTok, Instagram Reels, YouTube Shorts) */
  portrait: { width: 9, height: 16, label: '9:16' },
  /** 16:9 landscape (YouTube, standard video) */
  landscape: { width: 16, height: 9, label: '16:9' },
  /** 1:1 square (Instagram posts) */
  square: { width: 1, height: 1, label: '1:1' },
} as const;
