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

      {/* 2. 3 QUICK ACTION BUTTONS IN 1 ROW (Mobile & Desktop) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Button 1: Schedule Setup */}
        <button
          type="button"
          onClick={onOpenOnboardingWizard}
          disabled={!isOnboardingOpen || isArchived}
          className={`p-2.5 sm:p-3.5 rounded-xl border text-center sm:text-left transition-all flex flex-col sm:flex-row items-center sm:justify-between gap-1.5 sm:gap-3 group cursor-pointer shadow-2xs ${
            !isOnboardingCompleted && isOnboardingOpen && !isArchived
              ? 'bg-blue-50/70 border-blue-300 hover:border-blue-500 hover:bg-blue-100/50'
              : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/70'
          } ${(!isOnboardingOpen || isArchived) ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                Schedule Setup
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 truncate hidden sm:block">
                IRAS &amp; Busy Slots
              </div>
            </div>
          </div>
          {!isOnboardingCompleted && isOnboardingOpen && !isArchived ? (
            <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
              Setup
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold bg-slate-100 text-slate-600 shrink-0">
              Ready
            </span>
          )}
        </button>

        {/* Button 2: My Duties */}
        <Link
          to="/my-duties"
          className="p-2.5 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/70 text-center sm:text-left transition-all flex flex-col sm:flex-row items-center sm:justify-between gap-1.5 sm:gap-3 group cursor-pointer shadow-2xs"
        >
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                My Duties
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 truncate hidden sm:block">
                Roster &amp; Shifts
              </div>
            </div>
          </div>
          <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            {myDuties.length} {myDuties.length === 1 ? 'Shift' : 'Shifts'}
          </span>
        </Link>

        {/* Button 3: Payroll Claims / Shift Swaps */}
        {isFeatureEnabled('billing_claims') ? (
          <Link
            to="/submit-bill"
            className="p-2.5 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/70 text-center sm:text-left transition-all flex flex-col sm:flex-row items-center sm:justify-between gap-1.5 sm:gap-3 group cursor-pointer shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                  Payroll Claims
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 truncate hidden sm:block">
                  Duty Bills
                </div>
              </div>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              Bill
            </span>
          </Link>
        ) : isFeatureEnabled('shift_swaps') ? (
          <Link
            to="/swaps"
            className="p-2.5 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/70 text-center sm:text-left transition-all flex flex-col sm:flex-row items-center sm:justify-between gap-1.5 sm:gap-3 group cursor-pointer shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                  Shift Swaps
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 truncate hidden sm:block">
                  Trade Coverage
                </div>
              </div>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-semibold text-slate-500 shrink-0">
              Swaps
            </span>
          </Link>
        ) : (
          <div className="p-2.5 sm:p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-slate-400">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[11px] sm:text-xs">No Actions</span>
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
          <div className="space-y-2">
            {myDuties.map((duty) => (
              <div
                key={duty.id}
                className="card-enterprise p-3 sm:p-3.5 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4"
              >
                {/* Left: Prominent Day & Time Pill */}
                <div className="flex items-center gap-2.5">
                  <div className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex sm:flex-col items-center justify-center gap-1 sm:gap-0 min-w-[76px] text-center shrink-0">
                    <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-tight text-blue-700">
                      {duty.day.slice(0, 3)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600">
                      {duty.startTime}
                    </span>
                  </div>

                  {/* Center: Duty Name, Type, and Location */}
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {duty.title}
                      </span>
                      <span className="px-1.5 py-0.2 rounded border border-slate-200 bg-slate-50 text-slate-700 text-[10px] font-semibold">
                        {duty.type === 'LabDuty' ? 'Lab Duty' : duty.type === 'ExamDuty' ? 'Exam Duty' : 'General'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {duty.location}
                      </span>
                      <span>&bull;</span>
                      <span>
                        {duty.startTime} - {duty.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Faculty Supervisor Tag */}
                {duty.assignedFaculty ? (
                  <div className="flex items-center gap-1.5 self-start sm:self-auto sm:text-right shrink-0 bg-slate-50 sm:bg-transparent px-2 py-1 sm:p-0 rounded-md border border-slate-100 sm:border-0">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wide block hidden sm:block">Supervisor</span>
                      <span className="text-xs font-semibold text-slate-800">
                        {duty.assignedFaculty}
                      </span>
                    </div>
                  </div>
                ) : null}
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
