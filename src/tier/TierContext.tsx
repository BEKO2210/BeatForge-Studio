import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type TierLevel, type TierConfig, getTierConfig } from './types';

/**
 * Tier context value
 */
interface TierContextValue {
  /** Current tier level */
  tier: TierLevel;
  /** Current tier configuration */
  config: TierConfig;
  /** Set tier level */
  setTier: (level: TierLevel) => void;
  /** Toggle between free and pro (for demo purposes) */
  toggleTier: () => void;
}

const TierContext = createContext<TierContextValue | null>(null);

/**
 * Props for TierProvider
 */
interface TierProviderProps {
  children: ReactNode;
  /** Initial tier level (defaults to 'free') */
  initialTier?: TierLevel;
}

/**
 * Provides tier context to the application
 *
 * Note: Tier state is currently stored in React state only.
 * Actual payment integration and persistence is out of scope.
 */
export function TierProvider({ children, initialTier = 'free' }: TierProviderProps) {
  const [tier, setTierState] = useState<TierLevel>(initialTier);

  const config = getTierConfig(tier);

  const setTier = useCallback((level: TierLevel) => {
    setTierState(level);
  }, []);

  const toggleTier = useCallback(() => {
    setTierState(prev => prev === 'free' ? 'pro' : 'free');
  }, []);

  return (
    <TierContext.Provider value={{ tier, config, setTier, toggleTier }}>
      {children}
    </TierContext.Provider>
  );
}

/**
 * Hook to access tier context
 *
 * @throws Error if used outside TierProvider
 */
export function useTier(): TierContextValue {
  const context = useContext(TierContext);
  if (!context) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
}
