export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  updated_at: string;
}

export interface FeatureFlagsSummary {
  flags: Record<string, boolean>;
  details: FeatureFlag[];
}
