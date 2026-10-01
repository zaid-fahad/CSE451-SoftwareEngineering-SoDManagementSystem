import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Settings, Home } from 'lucide-react';
import { Button } from '../component/UI/Button';
import { useAuth } from '../services/useAuth';

interface FeatureDisabledPageProps {
  featureName?: string;
  featureKey?: string;
  message?: string;
}

export const FeatureDisabledPage: React.FC<FeatureDisabledPageProps> = ({
  featureName = 'Feature',
  featureKey,
  message = 'This module is currently disabled by the system administrator.',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = user?.role === 'DeptManager';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/60 text-amber-800 border border-amber-200">
            System Feature Flag Inactive
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {featureName} Disabled
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {message}
          </p>
        </div>

        {featureKey && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 font-mono text-center">
            Flag identifier: <span className="font-semibold text-slate-700">{featureKey}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto text-xs gap-2 !py-2 !px-4"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Button>

          {isManager && (
            <Button
              variant="outline"
              onClick={() => navigate('/admin/settings')}
              className="w-full sm:w-auto text-xs gap-2 !py-2 !px-4"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>System Settings</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
