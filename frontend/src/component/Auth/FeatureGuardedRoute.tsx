import React from 'react';
import { useFeatureFlags } from '../../context/FeatureFlagContext';
import { FeatureDisabledPage } from '../../pages/FeatureDisabledPage';
import { AppLayout } from '../../layout/AppLayout';

interface FeatureGuardedRouteProps {
  featureKey: string;
  featureName?: string;
  message?: string;
  wrapWithLayout?: boolean;
  children: React.ReactNode;
}

export const FeatureGuardedRoute: React.FC<FeatureGuardedRouteProps> = ({
  featureKey,
  featureName,
  message,
  wrapWithLayout = false,
  children,
}) => {
  const { isFeatureEnabled } = useFeatureFlags();

  if (!isFeatureEnabled(featureKey)) {
    const disabledContent = (
      <FeatureDisabledPage
        featureName={featureName || featureKey}
        featureKey={featureKey}
        message={message}
      />
    );

    if (wrapWithLayout) {
      return <AppLayout>{disabledContent}</AppLayout>;
    }
    return disabledContent;
  }

  return <>{children}</>;
};
