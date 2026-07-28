import React from 'react';
import { Link } from 'react-router-dom';
import { AvailabilityGrid } from '../Schedule/AvailabilityGrid';
import { StudentDutyList } from '../Duty/StudentDutyList';
import { Button } from '../UI/Button';
import { AvailabilitySlot } from '../../model/schedule';
import { DutySlot } from '../../model/duty';
import { User } from '../../model/user';
import { FileText, ArrowRightLeft, DollarSign, CalendarDays } from 'lucide-react';

interface StudentDashboardViewProps {
  user: User | null;
  slots: AvailabilitySlot[];
  duties: DutySlot[];
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
  onToggleSlot,
  onResetGrid,
  onLoadDemoData,
  onOpenParseModal,
  onExportPNG,
}) => {
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
          <Link to="/swaps">
            <Button variant="secondary" className="!py-2 !px-3 text-xs gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              <span>Shift Swap Portal</span>
            </Button>
          </Link>

          <Link to="/submit-bill">
            <Button
              variant="outline"
              className="!py-2 !px-3 text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50 bg-emerald-50/50"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Submit Monthly Bill</span>
            </Button>
          </Link>

          <Button variant="primary" onClick={onOpenParseModal} className="!py-2 !px-3 text-xs gap-1.5">
            <FileText className="w-4 h-4" />
            <span>Parse IRAS Timetable</span>
          </Button>
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
        />
      </div>

      {/* 3RD POSITION: MY ASSIGNED DUTY SLOTS */}
      <div className="space-y-3 text-left">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
          <CalendarDays className="w-4 h-4 text-blue-600" />
          <span>My Assigned Duty Slots</span>
        </h2>
        <StudentDutyList duties={duties} user={user} />
      </div>
    </div>
  );
};
