import React, { useState, useEffect } from 'react';
import { useFeatureFlags } from '../../context/FeatureFlagContext';
import {
  X,
  Sliders,
  RotateCcw,
  Check,
  Sparkles,
  UserPlus,
  ArrowRightLeft,
  Radio,
  DollarSign,
  FileSpreadsheet,
  Save,
  Undo2,
} from 'lucide-react';
import { Button } from './Button';

interface FeatureSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEATURE_ICONS: Record<string, React.ElementType> = {
  demo_mode: Sparkles,
  user_registration: UserPlus,
  shift_swaps: ArrowRightLeft,
  rfid_kiosk: Radio,
  billing_claims: DollarSign,
  iras_schedule_parser: FileSpreadsheet,
};

export const FeatureSettingsModal: React.FC<FeatureSettingsModalProps> = ({ isOpen, onClose }) => {
  const { details, flags, saveFeatures, resetFeatures, isLoading } = useFeatureFlags();
  const [localFlags, setLocalFlags] = useState<Record<string, boolean>>(flags);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Sync draft flags when opened or when underlying flags update
  useEffect(() => {
    if (isOpen) {
      setLocalFlags(flags);
    }
  }, [isOpen, flags]);

  if (!isOpen) return null;

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
    setStatusMsg('Unsaved changes discarded');
    setTimeout(() => setStatusMsg(null), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveFeatures(localFlags);
      setStatusMsg('Feature flags saved successfully!');
      setTimeout(() => {
        setStatusMsg(null);
        onClose();
      }, 1200);
    } catch {
      setStatusMsg('Failed to save feature flags');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all feature flags to system defaults?')) return;
    try {
      await resetFeatures();
      setStatusMsg('Reset to defaults');
      setTimeout(() => setStatusMsg(null), 2500);
    } catch {
      setStatusMsg('Reset failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden text-left">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Quick Feature Flags</h2>
                {hasUnsavedChanges && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    {unsavedCount} Unsaved
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Live toggle system capabilities & demo modes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-100">
          {statusMsg && (
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5 font-medium animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>{statusMsg}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading feature flags...</div>
          ) : (
            details.map((flag) => {
              const Icon = FEATURE_ICONS[flag.key] || Sliders;
              const isDraftEnabled = localFlags[flag.key] ?? flag.enabled;
              const isServerEnabled = flags[flag.key] ?? flag.enabled;
              const isModified = isDraftEnabled !== isServerEnabled;

              return (
                <div
                  key={flag.key}
                  className={`pt-3 first:pt-0 p-2 rounded-xl transition-colors flex items-center justify-between gap-4 ${
                    isModified ? 'bg-amber-50/50 border border-amber-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
                        isDraftEnabled
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isDraftEnabled ? 'text-slate-900' : 'text-slate-500'}`}>
                          {flag.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-100 text-slate-500 border border-slate-200">
                          {flag.category}
                        </span>
                        {isModified && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-1">
                        {flag.description}
                      </p>
                    </div>
                  </div>

                  {/* Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggle(flag.key)}
                    disabled={isSaving}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isDraftEnabled ? 'bg-blue-600' : 'bg-slate-300'
                    } ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isDraftEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading || isSaving}
            className="!py-1.5 !px-3 text-xs gap-1.5 text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </Button>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Button
                variant="outline"
                onClick={handleDiscard}
                disabled={isSaving}
                className="!py-1.5 !px-3 text-xs gap-1 text-slate-600"
              >
                <Undo2 className="w-3 h-3" />
                <span>Discard</span>
              </Button>
            )}

            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
              className="!py-1.5 !px-3 text-xs"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving || isLoading}
              isLoading={isSaving}
              className={`!py-1.5 !px-4 text-xs gap-1.5 font-bold shadow-xs transition-all ${
                hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700' : 'opacity-60'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes {hasUnsavedChanges ? `(${unsavedCount})` : ''}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
