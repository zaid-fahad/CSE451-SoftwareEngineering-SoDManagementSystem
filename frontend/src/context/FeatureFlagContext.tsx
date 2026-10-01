import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FeatureFlag, FeatureFlagsSummary } from '../model/featureFlag';
import { api } from '../services/api';

interface FeatureFlagContextType {
  flags: Record<string, boolean>;
  details: FeatureFlag[];
  isLoading: boolean;
  isFeatureEnabled: (key: string) => boolean;
  toggleFeature: (key: string, enabled: boolean) => Promise<void>;
  saveFeatures: (updatedFlags: Record<string, boolean>) => Promise<void>;
  resetFeatures: () => Promise<void>;
  refreshFlags: () => Promise<void>;
}

const DEFAULT_FLAGS: Record<string, boolean> = {
  demo_mode: false,
  user_registration: false,
  shift_swaps: true,
  rfid_kiosk: true,
  billing_claims: true,
  iras_schedule_parser: true,
};

export const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<Record<string, boolean>>(DEFAULT_FLAGS);
  const [details, setDetails] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshFlags = useCallback(async () => {
    try {
      const res = await api.get<FeatureFlagsSummary>('/features');
      if (res.data && res.data.flags) {
        setFlags(res.data.flags);
        setDetails(res.data.details || []);
      }
    } catch (err) {
      console.warn('Failed to load feature flags from server, using default fallbacks.', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFlags();
  }, [refreshFlags]);

  const isFeatureEnabled = useCallback(
    (key: string): boolean => {
      if (key in flags) {
        return Boolean(flags[key]);
      }
      return DEFAULT_FLAGS[key] ?? true;
    },
    [flags]
  );

  const toggleFeature = async (key: string, enabled: boolean) => {
    try {
      const res = await api.patch<FeatureFlag>(`/features/${key}`, { enabled });
      setFlags((prev) => ({
        ...prev,
        [key]: res.data.enabled,
      }));
      setDetails((prev) =>
        prev.map((item) => (item.key === key ? { ...item, enabled: res.data.enabled, updated_at: res.data.updated_at } : item))
      );
    } catch (err) {
      console.error(`Failed to toggle feature flag '${key}':`, err);
      throw err;
    }
  };

  const saveFeatures = async (updatedFlags: Record<string, boolean>) => {
    try {
      const res = await api.put<FeatureFlagsSummary>('/features', { flags: updatedFlags });
      if (res.data && res.data.flags) {
        setFlags(res.data.flags);
        setDetails(res.data.details || []);
      }
    } catch (err) {
      console.error('Failed to save feature flags:', err);
      throw err;
    }
  };

  const resetFeatures = async () => {
    try {
      const res = await api.post<FeatureFlagsSummary>('/features/reset');
      if (res.data && res.data.flags) {
        setFlags(res.data.flags);
        setDetails(res.data.details || []);
      }
    } catch (err) {
      console.error('Failed to reset feature flags:', err);
      throw err;
    }
  };

  return (
    <FeatureFlagContext.Provider
      value={{
        flags,
        details,
        isLoading,
        isFeatureEnabled,
        toggleFeature,
        saveFeatures,
        resetFeatures,
        refreshFlags,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = (): FeatureFlagContextType => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};
