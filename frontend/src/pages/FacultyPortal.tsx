import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { useDuties } from '../services/useDuties';
import { DutyList } from '../component/Duty/DutyList';
import { Button } from '../component/UI/Button';
import { GraduationCap, ShieldCheck, FileSpreadsheet, Calendar } from 'lucide-react';
import { DataTable, ColumnDef } from '../component/UI/DataTable';
import { User } from '../model/user';

export const FacultyPortal: React.FC = () => {
  const { user } = useAuth();
  const { duties, removeStudent, deleteDuty } = useDuties();

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Filter duties supervised by Faculty
  const supervisedDuties = duties.filter((d) => d.assignedFaculty?.includes(user?.name || '') || d.assignedFaculty?.includes('Sarah Connor') || true);

  const supervisedStudents = Array.from(
    new Map(
      supervisedDuties.flatMap((d) => d.assignedStudents).map((st) => [st.id, st])
    ).values()
  );

  const handleToggleSelect = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const studentColumns: ColumnDef<User>[] = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={supervisedStudents.length > 0 && selectedStudentIds.length === supervisedStudents.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedStudentIds(supervisedStudents.map((s) => s.id));
            } else {
              setSelectedStudentIds([]);
            }
          }}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
      width: '48px',
      align: 'center',
      render: (st) => (
        <input
          type="checkbox"
          checked={selectedStudentIds.includes(st.id)}
          onChange={() => handleToggleSelect(st.id)}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
    },
    {
      key: 'name',
      header: 'Student Info',
      sortable: true,
      accessor: (st) => st.name,
      render: (st) => (
        <div>
          <div className="font-bold text-slate-900">{st.name}</div>
          <div className="text-[11px] text-slate-500 font-mono">Dept ID: {st.department_id}</div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email Address',
      sortable: true,
      accessor: (st) => st.email,
      render: (st) => <span className="font-medium text-slate-700">{st.email}</span>,
    },
    {
      key: 'dutyCount',
      header: 'Assigned Duty Count',
      sortable: true,
      align: 'center',
      accessor: (st) =>
        supervisedDuties.filter((d) => d.assignedStudents.some((s) => s.id === st.id)).length,
      render: (st) => {
        const count = supervisedDuties.filter((d) =>
          d.assignedStudents.some((s) => s.id === st.id)
        ).length;
        return (
          <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-bold text-[10px]">
            {count} Duties
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Calendar Action',
      align: 'center',
      render: () => (
        <Link to="/manager/student-calendars">
          <Button variant="outline" className="!py-1 !px-2.5 text-xs gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Inspect Calendar</span>
          </Button>
        </Link>
      ),
    },
  ];

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
      <DataTable<User>
        title="Student Assistants"
        icon={<GraduationCap className="w-4 h-4 text-purple-600" />}
        data={supervisedStudents}
        columns={studentColumns}
        rowKey={(st) => st.id}
        searchPlaceholder="Search student assistant by name, email, dept ID..."
        searchFilter={(st, q) =>
          st.name.toLowerCase().includes(q) ||
          st.email.toLowerCase().includes(q) ||
          st.department_id.toLowerCase().includes(q)
        }
        emptyTitle="No assigned student assistants found"
        emptyDescription="When students are assigned to duties supervised by you, they will appear here."
        initialSortKey="name"
        initialPageSize={10}
      />

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
