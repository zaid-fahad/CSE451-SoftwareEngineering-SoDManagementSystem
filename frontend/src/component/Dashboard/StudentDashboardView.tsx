import React from 'react';
import { Link } from 'react-router-dom';
import { AvailabilityGrid } from '../Schedule/AvailabilityGrid';
import { StudentDutyList } from '../Duty/StudentDutyList';
import { Button } from '../UI/Button';
import { AvailabilitySlot } from '../../model/schedule';
import { DutySlot } from '../../model/duty';
import { User } from '../../model/user';
import { useFeatureFlags } from '../../context/FeatureFlagContext';
import { useSemesters } from '../../context/SemesterContext';
import { FileText, ArrowRightLeft, DollarSign, CalendarDays, Lock, CheckCircle2, Calendar } from 'lucide-react';

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
  onOpenParseModal,
  onExportPNG,
}) => {
  const { isFeatureEnabled } = useFeatureFlags();
  const { semesters, activeSemester } = useSemesters();

  const currentSemesterName = selectedSemester || activeSemester?.name || (semesters[0]?.name ?? 'Autumn 2026');
  const currentSemesterObj = semesters.find((s) => s.name === currentSemesterName) || activeSemester;
  const isOnboardingOpen = Boolean(currentSemesterObj?.is_onboarding_open);

  return (
    <div className="space-y-6">
      {/* Student Action Header (Top Position) */}
      <div className="card-enterprise p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900">
            Welcome back, {user?.name} (Student Portal)
          </h1>
          <p className="text-xs text-slate-500">
            Manage your weekly class timetable, view assigned lab duties, or submit monthly payroll billing claims.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isFeatureEnabled('shift_swaps') && (
            <Link to="/swaps">
              <Button variant="secondary" className="!py-2 !px-3 text-xs gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                <span>Shift Swap Portal</span>
              </Button>
            </Link>
          )}

          {isFeatureEnabled('billing_claims') && (
            <Link to="/submit-bill">
              <Button
                variant="outline"
                className="!py-2 !px-3 text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50 bg-emerald-50/50"
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Submit Monthly Bill</span>
              </Button>
            </Link>
          )}

          {isFeatureEnabled('iras_schedule_parser') && (
            <Button
              variant="primary"
              onClick={onOpenParseModal}
              disabled={!isOnboardingOpen}
              className={`!py-2 !px-3 text-xs gap-1.5 ${
                !isOnboardingOpen
                  ? 'opacity-50 cursor-not-allowed bg-slate-400 hover:bg-slate-400'
                  : ''
              }`}
              title={
                !isOnboardingOpen
                  ? 'Schedule onboarding is closed for this semester. Timetable parsing is disabled.'
                  : 'Parse your IRAS routine text to automatically fill class slots.'
              }
            >
              <FileText className="w-4 h-4" />
              <span>Parse IRAS Timetable</span>
            </Button>
          )}
        </div>
      </div>

      {/* Semester Context & Onboarding State Bar */}
      <div className="card-enterprise p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Viewing Academic Semester
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {semesters.length > 0 ? (
                <select
                  value={currentSemesterName}
                  onChange={(e) => onSelectSemester?.(e.target.value)}
                  className="text-sm font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-blue-600 cursor-pointer pr-4"
                >
                  {semesters.map((sem) => (
                    <option key={sem.id} value={sem.name}>
                      {sem.name} {sem.is_active ? '★ (Active)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-sm font-bold text-slate-900">{currentSemesterName}</span>
              )}
            </div>
          </div>
        </div>

        {/* Onboarding Status Chip */}
        <div>
          {isOnboardingOpen ? (
            <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Onboarding Open: Student Editing Enabled</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-semibold flex items-center gap-2 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Onboarding Closed: Schedule Locked</span>
            </div>
          )}
        </div>
      </div>

      {/* 2ND TOP POSITION: WEEKLY AVAILABILITY CALENDAR GRID WITH BOUND EXPORT BUTTON */}
      <div className="space-y-2 text-left">
        <AvailabilityGrid
          slots={slots}
          onToggleSlot={onToggleSlot}
          onResetGrid={onResetGrid}
          onLoadDemoData={onLoadDemoData}
          onExportPNG={onExportPNG}
          isLocked={!isOnboardingOpen}
          lockMessage={`Schedule onboarding for '${currentSemesterName}' has closed. Your availability slots cannot be modified directly. Contact your Department Manager or Lab Manager to request a manual override.`}
        />
      </div>

      {/* 3RD POSITION: MY ASSIGNED DUTY SLOTS */}
      <div className="space-y-3 text-left">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
          <CalendarDays className="w-4 h-4 text-blue-600" />
          <span>My Assigned Duty Slots ({currentSemesterName})</span>
        </h2>
        <StudentDutyList duties={duties} user={user} />
      </div>
    </div>
  );
};
