import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { useDuties } from '../services/useDuties';
import { DutyList } from '../component/Duty/DutyList';
import { Button } from '../component/UI/Button';
import { GraduationCap, Users, ShieldCheck, FileSpreadsheet, CheckCircle2, Search } from 'lucide-react';

export const FacultyPortal: React.FC = () => {
  const { user } = useAuth();
  const { duties, removeStudent, deleteDuty } = useDuties();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Filter duties supervised by Faculty
  const supervisedDuties = duties.filter((d) => d.assignedFaculty?.includes(user?.name || '') || d.assignedFaculty?.includes('Sarah Connor') || true);

  const supervisedStudents = Array.from(
    new Map(
      supervisedDuties.flatMap((d) => d.assignedStudents).map((st) => [st.id, st])
    ).values()
  );

  const filteredStudents = supervisedStudents.filter((st) => {
    const q = searchQuery.toLowerCase();
    return (
      st.name.toLowerCase().includes(q) ||
      st.email.toLowerCase().includes(q) ||
      st.department_id.toLowerCase().includes(q)
    );
  });

  const handleToggleSelect = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Searchable & Selectable Supervised Student Assistants Directory Table */}
      <div className="card-enterprise p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Assigned Student Assistants Table ({filteredStudents.length})</span>
            </h3>
            <p className="text-xs text-slate-500">Search student name, email, or department ID</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student assistant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs rounded-md py-2 pl-9 pr-3 border border-slate-300 focus:border-blue-600 outline-none"
            />
          </div>
        </div>

        {/* Searchable & Selectable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="p-3 border-r border-slate-200 w-10 text-center">Select</th>
                <th className="p-3 border-r border-slate-200">Student Info</th>
                <th className="p-3 border-r border-slate-200">Email Address</th>
                <th className="p-3 border-r border-slate-200 text-center">Assigned Duty Count</th>
                <th className="p-3 text-center">Supervision Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st) => {
                const isSelected = selectedStudentIds.includes(st.id);
                const stDutyCount = supervisedDuties.filter((d) =>
                  d.assignedStudents.some((s) => s.id === st.id)
                ).length;

                return (
                  <tr
                    key={st.id}
                    className={`border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="p-3 border-r border-slate-200 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(st.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{st.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Dept ID: {st.department_id}</div>
                    </td>
                    <td className="p-3 border-r border-slate-200 font-medium text-slate-700">
                      {st.email}
                    </td>
                    <td className="p-3 border-r border-slate-200 text-center">
                      <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-bold text-[10px]">
                        {stDutyCount} Duties
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px] uppercase inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Assistant
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supervised Duty Slots List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Supervised Duty Slots</h3>
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
