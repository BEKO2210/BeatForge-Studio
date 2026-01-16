/**
 * Tier levels for the application
 */
export type TierLevel = 'free' | 'pro';

/**
 * Configuration for each tier
 */
export interface TierConfig {
  /** Tier level */
  level: TierLevel;
  /** Maximum export resolution (720 or 1080) */
  maxResolution: 720 | 1080;
  /** Whether to show watermark on canvas */
  showWatermark: boolean;
  /** Features available in this tier */
  features: string[];
}

/**
 * Free tier configuration
 */
export const FREE_TIER_CONFIG: TierConfig = {
  level: 'free',
  maxResolution: 720,
  showWatermark: true,
  features: [
    'All visualizers',
    'All presets',
    'Text layers',
    'Background customization',
    'Effects',
    '720p export',
  ],
};

/**
 * Pro tier configuration
 */
export const PRO_TIER_CONFIG: TierConfig = {
  level: 'pro',
  maxResolution: 1080,
  showWatermark: false,
  features: [
    ...FREE_TIER_CONFIG.features.filter(f => f !== '720p export'),
    '1080p export',
    'No watermark',
  ],
};

/**
 * Get tier config by level
 */
export function getTierConfig(level: TierLevel): TierConfig {
  return level === 'pro' ? PRO_TIER_CONFIG : FREE_TIER_CONFIG;
}
