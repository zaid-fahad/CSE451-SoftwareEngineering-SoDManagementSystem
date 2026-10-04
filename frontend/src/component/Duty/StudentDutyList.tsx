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
      sticky: 'left',
      width: '110px',
      accessor: (rec) => rec.date,
      render: (rec) => <span className="font-mono font-bold text-slate-800">{rec.date}</span>,
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
      header: 'Status',
      sortable: true,
      align: 'center',
      width: '100px',
      accessor: (rec) => rec.status,
      render: (rec) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
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
      header: 'Hours',
      sortable: true,
      align: 'center',
      width: '90px',
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
    <div className="space-y-4 sm:space-y-6 text-left">
      {/* 1. Student Work Hours & Earnings Metric Banner (1 Row on Mobile) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="card-enterprise p-2.5 sm:p-4 space-y-0.5 sm:space-y-1 bg-blue-50/40 border-blue-200 text-center sm:text-left">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-tight truncate block">
            Hours
          </span>
          <div className="text-sm sm:text-2xl font-bold text-blue-900 font-mono">
            {totalLoggedHours.toFixed(1)} <span className="text-[10px] sm:text-sm font-normal">hrs</span>
          </div>
        </div>

        <div className="card-enterprise p-2.5 sm:p-4 space-y-0.5 sm:space-y-1 bg-emerald-50/40 border-emerald-200 text-center sm:text-left">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-tight truncate block">
            Earnings
          </span>
          <div className="text-sm sm:text-2xl font-bold text-emerald-900 font-mono">
            ${estimatedPayout.toFixed(0)}
          </div>
        </div>

        <div className="card-enterprise p-2.5 sm:p-4 space-y-0.5 sm:space-y-1 bg-purple-50/40 border-purple-200 text-center sm:text-left">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-tight truncate block">
            Reliability
          </span>
          <div className="text-sm sm:text-2xl font-bold text-purple-900 font-mono">
            100%
          </div>
        </div>
      </div>

      {/* 2. Search Input Toolbar & Duty Cards */}
      {!compactOverview && (
        <>
          <div className="card-enterprise p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Assigned Duty Shifts ({filteredDuties.length})
              </h3>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search duties, location, supervisor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-lg py-2 pl-9 pr-3 border border-slate-300 focus:bg-white focus:border-blue-600 outline-none transition-colors"
              />
            </div>
          </div>

          {filteredDuties.length === 0 ? (
            <div className="card-enterprise p-6 text-center text-slate-500 space-y-1.5 bg-slate-50/60 border-slate-200">
              <Calendar className="w-7 h-7 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Assigned Duty Slots Found</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Assigned laboratory or examination duty windows will appear here once allocated by your supervisor.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDuties.map((duty) => (
                <div
                  key={duty.id}
                  className="card-enterprise p-3 sm:p-3.5 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4"
                >
                  {/* Left: Day & Start Time Pill */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex sm:flex-col items-center justify-center gap-1 sm:gap-0 min-w-[76px] text-center shrink-0">
                      <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-tight text-blue-700">
                        {duty.day.slice(0, 3)}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600">
                        {duty.startTime}
                      </span>
                    </div>

                    {/* Center: Duty Name, Type, and Location */}
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          {duty.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded border border-slate-200 bg-slate-50 text-slate-700 text-[10px] font-semibold">
                          {duty.type === 'LabDuty' ? 'Lab Duty' : duty.type === 'ExamDuty' ? 'Exam Duty' : 'General Duty'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          Active
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {duty.location}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {duty.startTime} - {duty.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Supervising Faculty Tag */}
                  {duty.assignedFaculty ? (
                    <div className="flex items-center gap-1.5 self-start sm:self-auto sm:text-right shrink-0 bg-slate-50 sm:bg-transparent px-2 py-1 sm:p-0 rounded-md border border-slate-100 sm:border-0">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wide block hidden sm:block">
                          Supervisor
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {duty.assignedFaculty}
                        </span>
                      </div>
                    </div>
                  ) : null}
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
