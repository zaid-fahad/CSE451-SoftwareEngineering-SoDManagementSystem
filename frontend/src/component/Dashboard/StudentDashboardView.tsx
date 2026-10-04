import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AvailabilityGrid } from '../Schedule/AvailabilityGrid';
import { AvailabilitySlot } from '../../model/schedule';
import { DutySlot } from '../../model/duty';
import { User } from '../../model/user';
import { useFeatureFlags } from '../../context/FeatureFlagContext';
import { useSemesters } from '../../context/SemesterContext';
import {
  CalendarCheck,
  ClipboardCheck,
  ArrowRightLeft,
  DollarSign,
  Calendar,
  Lock,
  Unlock,
  Archive,
  MapPin,
  Clock,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';

interface StudentDashboardViewProps {
  user: User | null;
  slots: AvailabilitySlot[];
  duties: DutySlot[];
  selectedSemester?: string;
  onSelectSemester?: (semester: string) => void;
  onToggleSlot: (day: any, time: string) => void;
  onResetGrid: () => void;
  onLoadDemoData: () => void;
  onOpenParseModal: () => void;
  onOpenBillModal: () => void;
  onExportPNG: () => void;
  onOpenOnboardingWizard?: () => void;
  isOnboardingCompleted?: boolean;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  user,
  slots,
  duties,
  selectedSemester,
  onSelectSemester,
  onToggleSlot,
  onResetGrid,
  onLoadDemoData,
  onExportPNG,
  onOpenOnboardingWizard,
  isOnboardingCompleted = true,
}) => {
  const { isFeatureEnabled } = useFeatureFlags();
  const { semesters, activeSemester } = useSemesters();

  const currentSemesterName = selectedSemester || activeSemester?.name || (semesters[0]?.name ?? 'Autumn 2026');
  const currentSemesterObj = semesters.find((s) => s.name === currentSemesterName) || activeSemester;
  const isArchived = Boolean(currentSemesterObj?.is_archived);
  const isOnboardingOpen = !isArchived && Boolean(currentSemesterObj?.is_onboarding_open);

  // Filter duties assigned to the current student
  const myDuties = useMemo(() => {
    return duties.filter((d) =>
      d.assignedStudents.some((st) => st.email === user?.email || st.id === user?.id)
    );
  }, [duties, user]);

  return (
    <div className="space-y-5 text-left">
      {/* 1. MINIMAL STREAMLINED HEADER */}
      <div className="card-enterprise p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Hi, {user?.name?.split(' ')[0] || user?.name}
          </h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Student
          </span>
        </div>

        {/* Minimal Semester selector + status dot */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={currentSemesterName}
              onChange={(e) => onSelectSemester?.(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer pr-1"
            >
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.name}>
                  {sem.name}
                </option>
              ))}
            </select>
          </div>

          {isArchived ? (
            <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
              <Archive className="w-3 h-3 text-slate-500" />
              <span>Archived</span>
            </span>
          ) : isOnboardingOpen ? (
            <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Unlock className="w-3 h-3 text-emerald-600" />
              <span>Open</span>
            </span>
          ) : (
            <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Locked</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. 1X3 QUICK ACTION BUTTON GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Button 1: Schedule Setup */}
        <button
          type="button"
          onClick={onOpenOnboardingWizard}
          disabled={!isOnboardingOpen || isArchived}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-2xs ${
            !isOnboardingCompleted && isOnboardingOpen && !isArchived
              ? 'bg-blue-50/70 border-blue-300 hover:border-blue-500 hover:bg-blue-100/50'
              : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/70'
          } ${(!isOnboardingOpen || isArchived) ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Schedule Setup
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                IRAS &amp; Busy Slots
              </div>
            </div>
          </div>
          {!isOnboardingCompleted && isOnboardingOpen && !isArchived ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
              Setup
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 shrink-0">
              Ready
            </span>
          )}
        </button>

        {/* Button 2: My Duties */}
        <Link
          to="/my-duties"
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/70 text-left transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                My Duties
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Roster &amp; Shifts
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            {myDuties.length} {myDuties.length === 1 ? 'Shift' : 'Shifts'}
          </span>
        </Link>

        {/* Button 3: Payroll Claims / Shift Swaps */}
        {isFeatureEnabled('billing_claims') ? (
          <Link
            to="/submit-bill"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/70 text-left transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <DollarSign className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Payroll Claims
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Submit Duty Bill
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              Bill
            </span>
          </Link>
        ) : isFeatureEnabled('shift_swaps') ? (
          <Link
            to="/swaps"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/70 text-left transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Shift Swaps
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Trade Coverage
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500 shrink-0">
              Swaps
            </span>
          </Link>
        ) : (
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center gap-3 text-slate-400">
            <Clock className="w-5 h-5" />
            <span className="text-xs">No pending requests</span>
          </div>
        )}
      </div>

      {/* 3. ASSIGNED LAB DUTIES (INFO AT A GLANCE) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
              Assigned Lab Duties ({currentSemesterName})
            </h2>
          </div>
          <Link
            to="/my-duties"
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>Full Roster</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myDuties.length === 0 ? (
          <div className="card-enterprise p-5 text-center space-y-1 bg-slate-50/60 border-slate-200">
            <div className="text-xs font-bold text-slate-700">No Duties Assigned Yet</div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Your supervisor will allocate duties based on your registered availability.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {myDuties.map((duty) => (
              <div
                key={duty.id}
                className="card-enterprise p-3.5 hover:border-blue-300 transition-all flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{duty.title}</span>
                    <span className="px-1.5 py-0.2 rounded border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold">
                      {duty.type === 'LabDuty' ? 'Lab' : duty.type === 'ExamDuty' ? 'Exam' : 'Duty'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {duty.day} {duty.startTime} - {duty.endTime}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {duty.location}
                    </span>
                  </div>
                </div>

                {duty.assignedFaculty && (
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] text-slate-400 block">Supervisor</span>
                    <span className="text-[11px] font-medium text-purple-700 flex items-center gap-0.5">
                      <GraduationCap className="w-3 h-3" />
                      {duty.assignedFaculty}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. WEEKLY AVAILABILITY CALENDAR GRID */}
      <div className="space-y-2">
        <AvailabilityGrid
          slots={slots}
          onToggleSlot={onToggleSlot}
          onResetGrid={onResetGrid}
          onLoadDemoData={onLoadDemoData}
          onExportPNG={onExportPNG}
          isLocked={!isOnboardingOpen || isArchived}
          lockMessage={
            isArchived
              ? `Semester '${currentSemesterName}' has concluded and is archived.`
              : `Schedule onboarding for '${currentSemesterName}' is currently closed.`
          }
        />
      </div>
    </div>
  );
};
