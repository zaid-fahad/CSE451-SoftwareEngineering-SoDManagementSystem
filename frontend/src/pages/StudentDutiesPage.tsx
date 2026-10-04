import React from 'react';
import { useAuth } from '../services/useAuth';
import { useDuties } from '../services/useDuties';
import { StudentDutyList } from '../component/Duty/StudentDutyList';
import { CalendarDays } from 'lucide-react';

export const StudentDutiesPage: React.FC = () => {
  const { user } = useAuth();
  const { duties } = useDuties();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="card-enterprise p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 text-left">
        <div className="space-y-0.5">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span>My Duties &amp; Attendance</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Assigned laboratory shifts, attendance logs, and verified hours.
          </p>
        </div>
      </div>

      {/* Duties List */}
      <StudentDutyList duties={duties} user={user} compactOverview={false} />
    </div>
  );
};
