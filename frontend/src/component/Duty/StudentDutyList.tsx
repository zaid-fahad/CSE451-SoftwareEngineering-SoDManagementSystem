import React, { useState } from 'react';
import { DutySlot } from '../../model/duty';
import { User } from '../../model/user';
import { useAttendance } from '../../services/useAttendance';
import { MapPin, Clock, GraduationCap, CheckCircle2, Calendar, Search } from 'lucide-react';
import { DataTable, ColumnDef } from '../UI/DataTable';
import { AttendanceRecord } from '../../model/attendance';

interface StudentDutyListProps {
  duties: DutySlot[];
  user: User | null;
  compactOverview?: boolean;
}

export const StudentDutyList: React.FC<StudentDutyListProps> = ({ duties, user, compactOverview = true }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { getStudentAttendance, getStudentTotalHours } = useAttendance();

  // Filter duties where current user is in assignedStudents
  const myDuties = duties.filter((d) =>
    d.assignedStudents.some((st) => st.email === user?.email || st.id === user?.id)
  );

  const studentName = user?.name || 'Alice Smith';
  const attendanceLogs = getStudentAttendance(studentName);
  const totalLoggedHours = getStudentTotalHours(studentName);
  const estimatedPayout = totalLoggedHours * 15; // $15 / hr

  const filteredDuties = myDuties.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      d.day.toLowerCase().includes(q) ||
      (d.assignedFaculty && d.assignedFaculty.toLowerCase().includes(q))
    );
  });

  const attendanceColumns: ColumnDef<AttendanceRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      accessor: (rec) => rec.date,
      render: (rec) => <span className="font-mono font-medium text-slate-700">{rec.date}</span>,
    },
    {
      key: 'dutyTitle',
      header: 'Duty Slot',
      sortable: true,
      accessor: (rec) => rec.dutyTitle,
      render: (rec) => <span className="font-bold text-slate-900">{rec.dutyTitle}</span>,
    },
    {
      key: 'status',
      header: 'Attendance Status',
      sortable: true,
      align: 'center',
      accessor: (rec) => rec.status,
      render: (rec) => (
        <span
          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
            rec.status === 'Present'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : rec.status === 'Late'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {rec.status}
        </span>
      ),
    },
    {
      key: 'hours',
      header: 'Verified Hours',
      sortable: true,
      align: 'center',
      accessor: (rec) => rec.hoursCompleted,
      render: (rec) => (
        <span className="font-mono font-bold text-blue-800">{rec.hoursCompleted} hrs</span>
      ),
    },
    {
      key: 'notes',
      header: 'Supervisor Notes',
      sortable: false,
      render: (rec) => <span className="text-slate-600 font-medium">{rec.notes || 'N/A'}</span>,
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Student Work Hours & Earnings Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-enterprise p-4 space-y-1 bg-blue-50/40 border-blue-200">
          <span className="text-xs font-semibold text-slate-500">Total Logged Duty Hours</span>
          <div className="text-2xl font-bold text-blue-900 font-mono">{totalLoggedHours.toFixed(1)} hrs</div>
        </div>

        <div className="card-enterprise p-4 space-y-1 bg-emerald-50/40 border-emerald-200">
          <span className="text-xs font-semibold text-slate-500">Estimated Monthly Earnings</span>
          <div className="text-2xl font-bold text-emerald-900 font-mono">${estimatedPayout.toFixed(2)}</div>
        </div>

        <div className="card-enterprise p-4 space-y-1 bg-purple-50/40 border-purple-200">
          <span className="text-xs font-semibold text-slate-500">Attendance Reliability</span>
          <div className="text-2xl font-bold text-purple-900 font-mono">100% Present</div>
        </div>
      </div>

      {/* Search Input Toolbar & Duty Cards (Only shown when not in compact overview mode) */}
      {!compactOverview && (
        <>
          <div className="card-enterprise p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Assigned Duty Slots ({filteredDuties.length})
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search duty title, location, faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs rounded-md py-2 pl-9 pr-3 border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {filteredDuties.length === 0 ? (
            <div className="card-enterprise p-8 text-center text-slate-500 space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Assigned Duty Slots Found</p>
              <p className="text-xs">Your Lab Manager or Department Manager will assign lab/exam duty windows here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDuties.map((duty) => (
                <div key={duty.id} className="card-enterprise p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                        {duty.type === 'LabDuty' ? 'Lab Duty' : duty.type === 'ExamDuty' ? 'Exam Duty' : 'General Duty'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Active Assignment
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">{duty.title}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{duty.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{duty.day} {duty.startTime} - {duty.endTime}</span>
                      </div>
                    </div>
                  </div>

                  {duty.assignedFaculty && (
                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">Supervising Faculty:</span>
                      <span className="font-bold text-purple-800 text-[11px] flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                        {duty.assignedFaculty}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Attendance & Work Hours Log Table */}
      <DataTable<AttendanceRecord>
        title="Attendance Log"
        icon={<Clock className="w-4 h-4 text-emerald-600" />}
        data={attendanceLogs}
        columns={attendanceColumns}
        rowKey={(rec) => rec.id}
        searchPlaceholder="Search logged shifts, notes..."
        emptyTitle="No logged attendance records found yet"
        emptyDescription="Verified shift hours will appear here after attendance verification."
        initialSortKey="date"
        initialPageSize={10}
      />
    </div>
  );
};
