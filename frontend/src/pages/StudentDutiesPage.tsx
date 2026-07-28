import React from 'react';
import { useAuth } from '../services/useAuth';
import { useDuties } from '../services/useDuties';
import { StudentDutyList } from '../component/Duty/StudentDutyList';
import { CalendarDays } from 'lucide-react';

export const StudentDutiesPage: React.FC = () => {
  const { user } = useAuth();
  const { duties } = useDuties();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-enterprise p-6 space-y-1 text-left">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          <span>My Assigned Student Duties</span>
        </h1>
        <p className="text-xs text-slate-500">
          View your assigned lab and exam duty slots, locations, shift hours, and supervising Faculty members.
        </p>
      </div>

      {/* Duties List */}
      <StudentDutyList duties={duties} user={user} compactOverview={false} />
    </div>
  );
};
