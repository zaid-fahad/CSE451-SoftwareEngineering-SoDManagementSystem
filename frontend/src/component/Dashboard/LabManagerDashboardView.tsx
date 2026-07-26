import React from 'react';
import { Link } from 'react-router-dom';
import { DutySlot } from '../../model/duty';
import { User } from '../../model/user';
import { MOCK_STUDENTS } from '../../services/useDuties';
import { DutyList } from '../Duty/DutyList';
import { Button } from '../UI/Button';
import { Building2, CalendarSearch, Plus, Calendar, ArrowRight } from 'lucide-react';

interface LabManagerDashboardViewProps {
  user: User | null;
  duties: DutySlot[];
  onOpenCreateModal: () => void;
}

export const LabManagerDashboardView: React.FC<LabManagerDashboardViewProps> = ({
  user,
  duties,
  onOpenCreateModal,
}) => {
  const totalSlots = duties.length;
  const totalAssigned = duties.reduce((sum, d) => sum + d.assignedStudents.length, 0);
  const totalCapacity = duties.reduce((sum, d) => sum + d.maxStudents, 0);

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Lab Manager Duty Operations &mdash; {user?.name}</span>
          </h1>
          <p className="text-xs text-slate-500">
            Define lab and exam duty windows, assign student capacity, and inspect student weekly timetables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/manager/student-calendars">
            <Button variant="secondary" className="!py-2 !px-3.5 text-xs gap-1.5">
              <CalendarSearch className="w-4 h-4 text-blue-600" />
              <span>Inspect Student Calendars</span>
            </Button>
          </Link>

          <Button variant="primary" onClick={onOpenCreateModal} className="!py-2 !px-4 text-xs gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Create Duty Slot</span>
          </Button>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-enterprise p-5 space-y-1 bg-blue-50/40 border-blue-200">
          <span className="text-xs font-semibold text-slate-500">Active Duty Windows</span>
          <div className="text-2xl font-bold text-blue-900">{totalSlots} Slots</div>
        </div>

        <div className="card-enterprise p-5 space-y-1 bg-emerald-50/40 border-emerald-200">
          <span className="text-xs font-semibold text-slate-500">Assigned Student Capacity</span>
          <div className="text-2xl font-bold text-emerald-900">{totalAssigned} / {totalCapacity} Filled</div>
        </div>

        <div className="card-enterprise p-5 space-y-1 bg-purple-50/40 border-purple-200">
          <span className="text-xs font-semibold text-slate-500">Enrolled Student Pool</span>
          <div className="text-2xl font-bold text-purple-900">{MOCK_STUDENTS.length} Candidates</div>
        </div>
      </div>

      {/* Student Timetable Quick Inspection Cards */}
      <div className="card-enterprise p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarSearch className="w-4 h-4 text-blue-600" />
            <span>Student Timetable Calendar Quick Inspector</span>
          </h3>
          <Link to="/manager/student-calendars" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
            <span>View Full Inspector</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {MOCK_STUDENTS.map((st) => (
            <div key={st.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{st.name}</span>
                <span className="text-[11px] text-slate-500 font-mono">{st.department_id}</span>
              </div>
              <Link to="/manager/student-calendars">
                <Button variant="outline" fullWidth className="!py-1 text-[11px] gap-1">
                  <Calendar className="w-3 h-3 text-blue-600" />
                  <span>Inspect Calendar</span>
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Active Department Duty Slots */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Active Department Duty Slots</h3>
        <DutyList
          duties={duties}
          onOpenAssignModal={() => {}}
          onRemoveStudent={() => {}}
          onDeleteDuty={() => {}}
        />
      </div>
    </div>
  );
};
