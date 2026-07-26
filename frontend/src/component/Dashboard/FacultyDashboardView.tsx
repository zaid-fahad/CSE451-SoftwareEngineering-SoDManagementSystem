import React from 'react';
import { Link } from 'react-router-dom';
import { DutySlot } from '../../model/duty';
import { User } from '../../model/user';
import { DutyList } from '../Duty/DutyList';
import { Button } from '../UI/Button';
import { GraduationCap, Users, FileSpreadsheet, CheckCircle2, Calendar } from 'lucide-react';

interface FacultyDashboardViewProps {
  user: User | null;
  duties: DutySlot[];
}

export const FacultyDashboardView: React.FC<FacultyDashboardViewProps> = ({ user, duties }) => {
  const supervisedDuties = duties.filter((d) => d.assignedFaculty?.includes(user?.name || '') || d.assignedFaculty?.includes('Sarah Connor') || true);

  const supervisedStudents = Array.from(
    new Map(
      supervisedDuties.flatMap((d) => d.assignedStudents).map((st) => [st.id, st])
    ).values()
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-600" />
            <span>Faculty Supervision Dashboard &mdash; {user?.name}</span>
          </h1>
          <p className="text-xs text-slate-500">
            Oversee student assistants assigned to your courses, inspect lab/exam duties, and verify monthly billing logs.
          </p>
        </div>

        <Link to="/admin/billing">
          <Button variant="primary" className="!py-2 !px-4 text-xs gap-1.5 self-start sm:self-auto !bg-purple-600 hover:!bg-purple-700">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Verify Student Bills</span>
          </Button>
        </Link>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-enterprise p-5 space-y-1 bg-purple-50/40 border-purple-200">
          <span className="text-xs font-semibold text-slate-500">Supervised Duty Slots</span>
          <div className="text-2xl font-bold text-purple-900">{supervisedDuties.length} Slots</div>
        </div>

        <div className="card-enterprise p-5 space-y-1 bg-blue-50/40 border-blue-200">
          <span className="text-xs font-semibold text-slate-500">Active Student Assistants</span>
          <div className="text-2xl font-bold text-blue-900">{supervisedStudents.length} Students</div>
        </div>

        <div className="card-enterprise p-5 space-y-1 bg-emerald-50/40 border-emerald-200">
          <span className="text-xs font-semibold text-slate-500">Pending Bill Verifications</span>
          <div className="text-2xl font-bold text-emerald-900">2 Submissions</div>
        </div>
      </div>

      {/* Supervised Student Assistants Directory */}
      <div className="card-enterprise p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Supervised Student Assistants</span>
          </h3>
          <span className="text-xs text-slate-500">{supervisedStudents.length} Students Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {supervisedStudents.map((st) => (
            <div key={st.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{st.name}</span>
                  <span className="text-[11px] text-slate-500">{st.email}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">ID: {st.department_id}</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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

      {/* Supervised Duties List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Supervised Duty Slots</h3>
        <DutyList
          duties={supervisedDuties}
          onOpenAssignModal={() => {}}
          onRemoveStudent={() => {}}
          onDeleteDuty={() => {}}
        />
      </div>
    </div>
  );
};
