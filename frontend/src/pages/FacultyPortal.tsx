import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { useDuties } from '../services/useDuties';
import { DutyList } from '../component/Duty/DutyList';
import { Button } from '../component/UI/Button';
import { GraduationCap, Users, ShieldCheck, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export const FacultyPortal: React.FC = () => {
  const { user } = useAuth();
  const { duties, removeStudent, deleteDuty } = useDuties();

  // Filter duties supervised by Faculty
  const supervisedDuties = duties.filter((d) => d.assignedFaculty?.includes(user?.name || '') || d.assignedFaculty?.includes('Sarah Connor') || true);

  const supervisedStudents = Array.from(
    new Map(
      supervisedDuties.flatMap((d) => d.assignedStudents).map((st) => [st.id, st])
    ).values()
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-600" />
            <span>Faculty Supervision & Assistant Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500">
            Oversee student assistants working under your supervision, inspect assigned lab duties, and verify monthly billing.
          </p>
        </div>

        <Link to="/admin/billing">
          <Button variant="primary" className="!py-2 !px-4 text-xs gap-1.5 self-start sm:self-auto !bg-purple-600 hover:!bg-purple-700">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Verify Student Bills</span>
          </Button>
        </Link>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="card-enterprise p-4 space-y-1 bg-purple-50/40 border-purple-200">
          <span className="text-xs font-semibold text-slate-500">Supervised Duty Slots</span>
          <div className="text-2xl font-bold text-purple-900">{supervisedDuties.length} Slots</div>
        </div>

        <div className="card-enterprise p-4 space-y-1 bg-blue-50/40 border-blue-200">
          <span className="text-xs font-semibold text-slate-500">Active Student Assistants</span>
          <div className="text-2xl font-bold text-blue-900">{supervisedStudents.length} Students</div>
        </div>

        <div className="card-enterprise p-4 space-y-1 bg-emerald-50/40 border-emerald-200">
          <span className="text-xs font-semibold text-slate-500">Faculty Role Status</span>
          <div className="text-sm font-bold text-emerald-800 flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Supervising Faculty</span>
          </div>
        </div>
      </div>

      {/* Supervised Student Assistants Directory */}
      <div className="card-enterprise p-5 space-y-3 text-left">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Assigned Student Assistants Directory</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {supervisedStudents.map((st) => (
            <div key={st.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{st.name}</span>
                <span className="text-[11px] text-slate-500">{st.email}</span>
                <span className="text-[10px] text-slate-400 block">Dept ID: {st.department_id}</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Supervised Duty Slots List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 text-left">Supervised Duty Slots</h3>
        <DutyList
          duties={supervisedDuties}
          onOpenAssignModal={() => {}}
          onRemoveStudent={removeStudent}
          onDeleteDuty={deleteDuty}
        />
      </div>
    </div>
  );
};
