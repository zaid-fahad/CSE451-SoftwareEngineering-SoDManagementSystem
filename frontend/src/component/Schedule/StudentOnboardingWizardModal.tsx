import React, { useState } from 'react';
import {
  X,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  Calendar,
  Layers,
  HelpCircle,
  Check,
  Eye,
  ChevronDown,
  ChevronUp,
  ExternalLink,
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
  const [showExamplePreview, setShowExamplePreview] = useState<boolean>(false);

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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden text-left flex flex-col my-auto max-h-[92vh] animate-fadeIn">
        {/* Professional Flat Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Student Availability & Schedule Setup
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-800 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-slate-600" />
                  <span>{semesterName}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Register your weekly timetable: import class hours from IRAS, then configure personal busy slots.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Flat Progress Breadcrumb */}
        <div className="px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 sm:gap-6 w-full max-w-2xl mx-auto text-xs">
            {/* Step 1 Indicator */}
            <div
              className={`flex items-center gap-2 font-semibold ${
                currentStep === 1
                  ? 'text-blue-700'
                  : currentStep > 1
                  ? 'text-emerald-700'
                  : 'text-slate-500'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                  currentStep === 1
                    ? 'bg-blue-600 text-white border-blue-600'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-300'
                }`}
              >
                {currentStep > 1 ? <Check className="w-3 h-3 stroke-[2.5]" /> : '1'}
              </div>
              <span className="hidden sm:inline">1. Import IRAS Routine</span>
            </div>

            <div className="flex-1 h-px bg-slate-300" />

            {/* Step 2 Indicator */}
            <div
              className={`flex items-center gap-2 font-semibold ${
                currentStep === 2
                  ? 'text-blue-700'
                  : currentStep > 2
                  ? 'text-emerald-700'
                  : 'text-slate-500'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                  currentStep === 2
                    ? 'bg-blue-600 text-white border-blue-600'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-300'
                }`}
              >
                {currentStep > 2 ? <Check className="w-3 h-3 stroke-[2.5]" /> : '2'}
              </div>
              <span className="hidden sm:inline">2. Add Busy Slots</span>
            </div>

            <div className="flex-1 h-px bg-slate-300" />

            {/* Step 3 Indicator */}
            <div
              className={`flex items-center gap-2 font-semibold ${
                currentStep === 3 ? 'text-blue-700' : 'text-slate-500'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                  currentStep === 3
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300'
                }`}
              >
                3
              </div>
              <span className="hidden sm:inline">3. Confirm & Save</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: IMPORT FROM IRAS */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Step 1: Paste Your Official IRAS Class Timetable</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Paste the timetable text from your student IRAS portal. Lectures and labs are automatically identified and locked so you will not be assigned duty shifts during class hours.
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
                  <label htmlFor="irasScheduleInput" className="font-semibold text-xs text-slate-700 uppercase tracking-wider">
                    Raw Timetable Text <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseSample}
                    className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer underline flex items-center gap-1"
                  >
                    <span>Insert Sample Template</span>
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
                  placeholder="Paste your raw IRAS schedule text block here..."
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3.5 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-mono transition-colors"
                />

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>Accepted Formats:</strong> IRAS portal table copy-pastes or lines formatted as{' '}
                        <code className="text-slate-800 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          [CourseCode] - [Day] - [Start]-[End]
                        </code>{' '}
                        (e.g.{' '}
                        <code className="text-slate-800 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          CSE451 - SAT - 09:30-11:00
                        </code>
                        ).
                      </div>
                    </div>
                  </div>

                  {/* Example Schedule Text to Copy Guide */}
                  <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span>How-To: Copying your routine from IRAS</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowExamplePreview(!showExamplePreview)}
                          className="font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{showExamplePreview ? 'Hide Example' : 'View Example'}</span>
                          {showExamplePreview ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        <a
                          href="https://meetchuthere.com/assets/onboarding/paste-schedule-example.png"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline"
                        >
                          <span>Open Image</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {showExamplePreview && (
                      <div className="mt-1 rounded-lg border border-slate-200 bg-white p-2 space-y-1.5">
                        <div className="text-[11px] font-medium text-slate-500">
                          Select and copy your routine text directly from the IRAS timetable page as shown below:
                        </div>
                        <div className="overflow-hidden rounded border border-slate-100 max-h-72 bg-slate-50 flex items-center justify-center">
                          <img
                            src="https://meetchuthere.com/assets/onboarding/paste-schedule-example.png"
                            alt="Example of schedule text to copy from IRAS"
                            className="w-full h-auto object-contain"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ADD BUSY SLOTS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Clock className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>Step 2: Add Busy Slots & Personal Overrides</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your IRAS class slots are parsed and locked in <strong className="text-rose-700">red</strong> below. Click on any free slot to toggle it as <strong className="text-amber-800">Busy (amber)</strong> for your extracurriculars, club activities, or study hours.
                </p>
              </div>

              {parsedCount !== null && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Imported <strong>{parsedCount} class slot{parsedCount === 1 ? '' : 's'}</strong> from IRAS timetable.
                  </span>
                </div>
              )}

              {/* Status Metric Counters */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-lg font-bold text-emerald-700">{freeCount}</div>
                  <div className="text-[11px] font-semibold text-slate-600">Free Slots (Duty Eligible)</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-lg font-bold text-rose-700">{classCount}</div>
                  <div className="text-[11px] font-semibold text-slate-600">IRAS Classes (Locked)</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-lg font-bold text-amber-700">{busyCount}</div>
                  <div className="text-[11px] font-semibold text-slate-600">Manual Busy Overrides</div>
                </div>
              </div>

              {/* Timetable Matrix */}
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

          {/* STEP 3: SUMMARY & SAVE */}
          {currentStep === 3 && (
            <div className="space-y-5 text-center py-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  Availability Schedule Saved
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your academic availability profile for <strong>{semesterName}</strong> has been registered successfully.
                </p>
              </div>

              {/* Profile Summary Card */}
              <div className="card-enterprise p-5 max-w-lg mx-auto bg-slate-50/70 border-slate-200 space-y-3 text-left">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Configured Availability Summary</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="block text-base font-bold text-rose-700">{classCount}</span>
                    <span className="text-[10px] text-slate-600 uppercase font-semibold">Classes</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="block text-base font-bold text-amber-700">{busyCount}</span>
                    <span className="text-[10px] text-slate-600 uppercase font-semibold">Busy Overrides</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="block text-base font-bold text-emerald-700">{freeCount}</span>
                    <span className="text-[10px] text-slate-600 uppercase font-semibold">Free for Duties</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
                  Department Managers and Lab Managers will reference your <strong>{freeCount} free slots</strong> when creating shift assignments. You can review or edit your schedule at any time from your student portal.
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
                className="!py-2 !px-5 text-xs gap-1.5 font-semibold"
              >
                <span>Import & Proceed to Busy Slots</span>
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
                className="!py-2 !px-5 text-xs gap-1.5 font-semibold"
              >
                <span>Save Availability</span>
                <Check className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end w-full">
              <Button
                type="button"
                variant="primary"
                onClick={handleFinalDone}
                className="!py-2 !px-6 text-xs gap-1.5 font-semibold"
              >
                <span>Confirm & Return to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
