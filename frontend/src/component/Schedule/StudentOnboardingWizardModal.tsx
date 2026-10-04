import React, { useState } from 'react';
import {
  X,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../UI/Button';
import { AvailabilitySlot, DayOfWeek } from '../../model/schedule';
import { AvailabilityGrid } from './AvailabilityGrid';

interface StudentOnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  slots: AvailabilitySlot[];
  onToggleSlot: (day: DayOfWeek, time: string) => void;
  onParse: (rawText: string) => Promise<number>;
  semesterName: string;
  isOnboardingOpen: boolean;
}

export const StudentOnboardingWizardModal: React.FC<StudentOnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  slots,
  onToggleSlot,
  onParse,
  semesterName,
  isOnboardingOpen,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [rawIrasText, setRawIrasText] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedCount, setParsedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const sampleIrasText = `PHY101 - MON - 09:00-11:00\nCSE202 - TUE - 14:00-16:00\nCSE451 - SAT - 09:30-11:00\nMAT212 - SUN - 11:30-13:00`;

  const handleUseSample = () => {
    setRawIrasText(sampleIrasText);
    setErrorMsg(null);
  };

  const handleParseAndContinue = async () => {
    setErrorMsg(null);
    if (!rawIrasText.trim()) {
      setErrorMsg('Please paste your IRAS timetable text before proceeding to busy slots.');
      return;
    }

    setIsParsing(true);
    try {
      const count = await onParse(rawIrasText);
      setParsedCount(count);
      setCurrentStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse timetable text. Please verify formatting.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFinish = () => {
    setCurrentStep(3);
  };

  const handleFinalDone = () => {
    onComplete();
  };

  // Metrics calculation
  const classCount = slots.filter((s) => s.type === 'Class').length;
  const busyCount = slots.filter((s) => s.type === 'Busy').length;
  const freeCount = slots.filter((s) => s.type === 'Free').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden text-left flex flex-col my-auto max-h-[92vh] animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Student Schedule Onboarding Wizard
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-600" />
                  <span>{semesterName}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Set up your academic availability: import classes from IRAS, then configure your busy hours.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Dismiss wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Bar */}
        <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-6 w-full max-w-2xl mx-auto">
            {/* Step 1 Pill */}
            <div
              className={`flex items-center gap-2 text-xs font-semibold ${
                currentStep === 1
                  ? 'text-blue-600'
                  : currentStep > 1
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  currentStep === 1
                    ? 'bg-blue-600 text-white shadow-xs'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className="hidden sm:inline">1. Import from IRAS</span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-200">
              <div
                className={`h-full transition-all duration-300 ${
                  currentStep >= 2 ? 'bg-emerald-500' : 'bg-transparent'
                }`}
              />
            </div>

            {/* Step 2 Pill */}
            <div
              className={`flex items-center gap-2 text-xs font-semibold ${
                currentStep === 2
                  ? 'text-blue-600'
                  : currentStep > 2
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  currentStep === 2
                    ? 'bg-blue-600 text-white shadow-xs'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span className="hidden sm:inline">2. Add Busy Slots</span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-200">
              <div
                className={`h-full transition-all duration-300 ${
                  currentStep >= 3 ? 'bg-emerald-500' : 'bg-transparent'
                }`}
              />
            </div>

            {/* Step 3 Pill */}
            <div
              className={`flex items-center gap-2 text-xs font-semibold ${
                currentStep === 3 ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  currentStep === 3
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </div>
              <span className="hidden sm:inline">3. Complete</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: IMPORT FROM IRAS */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-950">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Step 1: Paste Your Official IRAS Class Timetable</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Copy and paste the raw routine block directly from your university IRAS portal. The system will automatically parse and lock your lecture and lab hours so you cannot be accidentally scheduled for duties during classes.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="irasScheduleInput" className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                    Raw IRAS Schedule Text <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseSample}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline flex items-center gap-1"
                  >
                    <span>Insert Sample Schedule</span>
                  </button>
                </div>

                <textarea
                  id="irasScheduleInput"
                  rows={7}
                  value={rawIrasText}
                  onChange={(e) => {
                    setRawIrasText(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Paste your IRAS schedule here (e.g. PHY101 - MON - 09:00-11:00)..."
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3.5 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none font-mono transition-colors shadow-inner"
                />

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Accepted Formats:</strong> Both spreadsheet tables copied from IRAS or lines formatted as{' '}
                    <code className="text-blue-700 font-mono bg-blue-50 px-1 py-0.5 rounded">
                      [CourseCode] - [Day] - [Start]-[End]
                    </code>{' '}
                    (e.g.{' '}
                    <code className="text-blue-700 font-mono bg-blue-50 px-1 py-0.5 rounded">
                      CSE451 - SAT - 09:30-11:00
                    </code>
                    ) are supported.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ADD BUSY SLOTS */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Step 2: Add Busy Slots & Personal Overrides</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your IRAS class slots are parsed and locked in <strong className="text-rose-700">red</strong> below. Click on any open slot to toggle it as <strong className="text-amber-800">Busy (amber)</strong> for your extracurriculars, club activities, study groups, or prayer times.
                </p>
              </div>

              {parsedCount !== null && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Successfully imported <strong>{parsedCount} class slot{parsedCount === 1 ? '' : 's'}</strong> from your IRAS timetable!
                  </span>
                </div>
              )}

              {/* Status Counters */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-lg font-bold text-emerald-800">{freeCount}</div>
                  <div className="text-[11px] font-semibold text-emerald-600">Free Slots (Duty Eligible)</div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
                  <div className="text-lg font-bold text-rose-800">{classCount}</div>
                  <div className="text-[11px] font-semibold text-rose-600">IRAS Classes (Locked)</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <div className="text-lg font-bold text-amber-800">{busyCount}</div>
                  <div className="text-[11px] font-semibold text-amber-600">Manual Busy Overrides</div>
                </div>
              </div>

              {/* Interactive Availability Grid */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <AvailabilityGrid
                  slots={slots}
                  onToggleSlot={onToggleSlot}
                  isLocked={!isOnboardingOpen}
                  lockMessage="Onboarding for this semester is locked. Slots cannot be adjusted."
                />
              </div>
            </div>
          )}

          {/* STEP 3: ONBOARDING COMPLETE */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center py-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">
                  Onboarding Complete!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your availability profile for <strong>{semesterName}</strong> has been successfully configured and saved to the department database.
                </p>
              </div>

              {/* Profile Summary Card */}
              <div className="card-enterprise p-5 max-w-lg mx-auto bg-slate-50/70 border-slate-200 space-y-3 text-left">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Configured Availability Summary</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100">
                    <span className="block text-base font-bold text-rose-700">{classCount}</span>
                    <span className="text-[10px] text-rose-600 uppercase font-bold">Class Slots</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                    <span className="block text-base font-bold text-amber-700">{busyCount}</span>
                    <span className="text-[10px] text-amber-600 uppercase font-bold">Busy Slots</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="block text-base font-bold text-emerald-700">{freeCount}</span>
                    <span className="text-[10px] text-emerald-600 uppercase font-bold">Free Slots</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
                  Department Managers and Lab Managers will use your <strong>{freeCount} free slots</strong> to assign duties that match your open hours. You can adjust your availability or review duty shifts directly from your dashboard.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          {currentStep === 1 ? (
            <div className="flex items-center justify-between w-full">
              <Button type="button" variant="outline" onClick={onClose} className="!py-2 !px-4 text-xs">
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleParseAndContinue}
                isLoading={isParsing}
                className="!py-2 !px-5 text-xs gap-1.5 font-bold"
              >
                <span>Import from IRAS & Proceed to Busy Slots</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : currentStep === 2 ? (
            <div className="flex items-center justify-between w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="!py-2 !px-4 text-xs gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to IRAS Input</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleFinish}
                className="!py-2 !px-5 text-xs gap-1.5 font-bold !bg-emerald-600 hover:!bg-emerald-700 text-white"
              >
                <span>Finish & Complete Onboarding</span>
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end w-full">
              <Button
                type="button"
                variant="primary"
                onClick={handleFinalDone}
                className="!py-2 !px-6 text-xs gap-1.5 font-bold"
              >
                <span>Go to Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
