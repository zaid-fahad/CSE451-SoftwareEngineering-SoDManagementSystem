import React, { useState, useEffect } from 'react';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import { Button } from '../component/UI/Button';
import {
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserPlus,
  ArrowRightLeft,
  Radio,
  DollarSign,
  FileSpreadsheet,
  Clock,
  Layers,
  Save,
  Undo2,
} from 'lucide-react';

const FEATURE_ICONS: Record<string, React.ElementType> = {
  demo_mode: Sparkles,
  user_registration: UserPlus,
  shift_swaps: ArrowRightLeft,
  rfid_kiosk: Radio,
  billing_claims: DollarSign,
  iras_schedule_parser: FileSpreadsheet,
};

export const SystemSettingsPage: React.FC = () => {
  const { details, flags, saveFeatures, resetFeatures, isLoading, refreshFlags } = useFeatureFlags();
  const [localFlags, setLocalFlags] = useState<Record<string, boolean>>(flags);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync draft state with incoming server flags
  useEffect(() => {
    setLocalFlags(flags);
  }, [flags]);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(msg);
      setErrorMessage(null);
    }
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 4000);
  };

  const handleToggle = (key: string) => {
    setLocalFlags((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const unsavedCount = Object.keys(localFlags).filter(
    (key) => localFlags[key] !== (flags[key] ?? true)
  ).length;
  const hasUnsavedChanges = unsavedCount > 0;

  const handleDiscard = () => {
    setLocalFlags(flags);
    showNotification('Unsaved changes discarded.');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveFeatures(localFlags);
      showNotification('Feature flag configurations saved successfully!');
    } catch (err: any) {
      showNotification(err?.response?.data?.detail || 'Failed to save feature flags.', true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all feature flags to system defaults?')) {
      return;
    }
    setIsResetting(true);
    try {
      await resetFeatures();
      showNotification('Feature flags have been reset to default configuration.');
    } catch (err: any) {
      showNotification(err?.response?.data?.detail || 'Failed to reset flags.', true);
    } finally {
      setIsResetting(false);
    }
  };

  // Group features by category
  const categories: Record<string, typeof details> = {};
  details.forEach((item) => {
    const cat = item.category || 'General';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="card-enterprise p-6 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">System Feature Management</h1>
              <p className="text-xs text-slate-500">
                Configure runtime feature toggles and production feature switches across the SoD Management System.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasUnsavedChanges && (
            <Button
              variant="outline"
              onClick={handleDiscard}
              disabled={isSaving || isLoading}
              className="text-xs gap-1.5 !py-2 !px-3 text-slate-600 hover:text-slate-800"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Discard</span>
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving || isLoading}
            isLoading={isSaving}
            className={`text-xs gap-1.5 !py-2 !px-4 shadow-sm font-semibold transition-all ${
              hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-500/30' : 'opacity-60'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes {hasUnsavedChanges ? `(${unsavedCount})` : ''}</span>
          </Button>

          <Button
            variant="outline"
            onClick={refreshFlags}
            disabled={isLoading || isSaving}
            className="text-xs gap-1.5 !py-2 !px-3"
            title="Refresh flags from server"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="danger"
            onClick={handleReset}
            disabled={isResetting || isLoading || isSaving}
            className="text-xs gap-1.5 !py-2 !px-3.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Defaults</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-fadeIn shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2 animate-fadeIn shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Feature Flag Groups */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Loading system feature flags...
        </div>
      ) : details.length === 0 ? (
        <div className="card-enterprise p-8 text-center text-slate-500 text-sm bg-white">
          No feature flags registered in the system database.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(categories).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                <span>{category} Features</span>
                <span className="text-[10px] text-slate-400 font-normal">({items.length} toggles)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((flag) => {
                  const Icon = FEATURE_ICONS[flag.key] || Sliders;
                  const isDraftEnabled = localFlags[flag.key] ?? flag.enabled;
                  const isServerEnabled = flags[flag.key] ?? flag.enabled;
                  const isModified = isDraftEnabled !== isServerEnabled;

                  return (
                    <div
                      key={flag.key}
                      className={`card-enterprise p-5 border transition-all flex flex-col justify-between ${
                        isModified
                          ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20'
                          : isDraftEnabled
                          ? 'bg-white border-slate-200 hover:border-blue-400 shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2.5 rounded-xl border ${
                                isDraftEnabled
                                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                                  : 'bg-slate-200/60 text-slate-400 border-slate-300'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={`text-sm font-bold ${isDraftEnabled ? 'text-slate-900' : 'text-slate-600'}`}>
                                  {flag.name}
                                </h3>
                                {isModified && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                    Modified
                                  </span>
                                )}
                              </div>
                              <code className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono mt-0.5 inline-block">
                                {flag.key}
                              </code>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggle(flag.key)}
                            disabled={isSaving}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isDraftEnabled ? 'bg-blue-600' : 'bg-slate-300'
                            } ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
                            aria-label={`Toggle ${flag.name}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                isDraftEnabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        <p className={`text-xs leading-relaxed ${isDraftEnabled ? 'text-slate-600' : 'text-slate-400'}`}>
                          {flag.description}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              isDraftEnabled ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span className={`font-semibold ${isDraftEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {isDraftEnabled ? 'Active' : 'Disabled'}
                          </span>
                          {isModified && (
                            <span className="text-[10px] text-amber-600 font-medium">
                              (Unsaved: will change to {isDraftEnabled ? 'Active' : 'Disabled'})
                            </span>
                          )}
                        </div>

                        {flag.updated_at && (
                          <div className="flex items-center gap-1 text-[10px]">
                            <Clock className="w-3 h-3" />
                            <span>Updated: {new Date(flag.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Bottom Bar when Unsaved Changes Exist */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-40 bg-white border border-amber-300 rounded-2xl shadow-xl p-4 flex items-center gap-4 animate-bounce-short">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="font-semibold text-slate-800">
              {unsavedCount} unsaved feature flag change{unsavedCount > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDiscard}
              disabled={isSaving}
              className="!py-1.5 !px-3 text-xs gap-1"
            >
              <Undo2 className="w-3 h-3" />
              <span>Discard</span>
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
              className="!py-1.5 !px-4 text-xs gap-1.5 font-bold shadow-xs bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
