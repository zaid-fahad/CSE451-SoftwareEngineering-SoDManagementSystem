import React, { useState } from 'react';
import { useDuties } from '../services/useDuties';
import { useAttendance } from '../services/useAttendance';
import { Button } from '../component/UI/Button';
import { Input } from '../component/UI/Input';
import { ClipboardCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { AttendanceStatus } from '../model/attendance';

export const AttendanceManagerPage: React.FC = () => {
  const { duties } = useDuties();
  const { attendanceRecords, markAttendance } = useAttendance();

  const [selectedDutyId, setSelectedDutyId] = useState<string>(duties[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [date, setDate] = useState<string>('2026-07-26');
  const [status, setStatus] = useState<AttendanceStatus>('Present');
  const [hoursCompleted, setHoursCompleted] = useState<number>(2.0);
  const [notes, setNotes] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const currentDuty = duties.find((d) => d.id === selectedDutyId) || duties[0];
  const assignedStudents = currentDuty?.assignedStudents || [];

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const student = assignedStudents.find((s) => s.id === selectedStudentId) || assignedStudents[0];
    if (!student) {
      alert('Please select an assigned student assistant.');
      return;
    }

    markAttendance({
      dutyId: currentDuty.id,
      dutyTitle: currentDuty.title,
      studentId: student.id,
      studentName: student.name,
      date,
      status,
      hoursCompleted,
      notes,
    });

    setToastMsg(`Attendance for ${student.name} logged as '${status}' (${hoursCompleted} hrs)!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            <span>Student Duty Attendance & Work Hours Logger</span>
          </h1>
          <p className="text-xs text-slate-500">
            Log student assistant shift attendance, verify completed duty hours, and record supervisor notes for payroll release.
          </p>
        </div>
      </div>

      {/* Attendance Form Section */}
      <div className="card-enterprise p-6 space-y-5">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Record Duty Attendance & Hours Log
        </h3>

        <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
          
          {/* Duty Slot Selection Chips */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 uppercase tracking-wider block">
              1. Select Department Duty Slot
            </label>
            <div className="flex flex-wrap gap-2">
              {duties.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setSelectedDutyId(d.id);
                    if (d.assignedStudents.length > 0) {
                      setSelectedStudentId(d.assignedStudents[0].id);
                    }
                  }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedDutyId === d.id
                      ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500 text-blue-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs">{d.title}</div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                    <span>📍 {d.location}</span>
                    <span>🕒 {d.day} ({d.startTime} - {d.endTime})</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Student Assistant Custom Selection Chips */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 uppercase tracking-wider block">
              2. Select Assigned Student Assistant
            </label>
            {assignedStudents.length === 0 ? (
              <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>No students assigned to this duty slot yet. Assign students first in Duty Slot Manager.</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {assignedStudents.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStudentId(st.id)}
                    className={`px-3 py-2 rounded-md border text-xs font-semibold cursor-pointer transition-all ${
                      selectedStudentId === st.id
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    👤 {st.name} ({st.department_id})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date & Hours & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Input
              label="Shift Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <Input
              label="Completed Work Hours (hrs)"
              type="number"
              step="0.5"
              min="0.5"
              max="10"
              value={hoursCompleted}
              onChange={(e) => setHoursCompleted(parseFloat(e.target.value) || 0)}
            />

            {/* Attendance Status Radio Chips */}
            <div className="flex flex-col space-y-1.5 w-full text-left">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Attendance Status
              </label>
              <div className="flex items-center gap-2 pt-1">
                {(['Present', 'Late', 'Absent'] as AttendanceStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`px-3 py-2 rounded-md border text-xs font-bold transition-all cursor-pointer ${
                      status === st
                        ? st === 'Present'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : st === 'Late'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Input
            label="Supervisor Shift Notes (Optional)"
            placeholder="e.g. Completed lab assistance smoothly."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={assignedStudents.length === 0} className="!py-2 !px-5 text-xs gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Attendance Record</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Attendance Log History Table */}
      <div className="card-enterprise p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Logged Attendance & Work Hours History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="p-3 border-r border-slate-200">Date</th>
                <th className="p-3 border-r border-slate-200">Duty Slot</th>
                <th className="p-3 border-r border-slate-200">Student Assistant</th>
                <th className="p-3 border-r border-slate-200 text-center">Status</th>
                <th className="p-3 border-r border-slate-200 text-center">Logged Hours</th>
                <th className="p-3">Supervisor Notes</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((rec) => (
                <tr key={rec.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors">
                  <td className="p-3 border-r border-slate-200 font-mono font-medium text-slate-700">{rec.date}</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900">{rec.dutyTitle}</td>
                  <td className="p-3 border-r border-slate-200 font-medium text-slate-800">{rec.studentName}</td>
                  <td className="p-3 border-r border-slate-200 text-center">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rec.status === 'Present'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : rec.status === 'Late'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="p-3 border-r border-slate-200 font-mono font-bold text-center text-blue-800">
                    {rec.hoursCompleted} hrs
                  </td>
                  <td className="p-3 text-slate-600 font-medium">{rec.notes || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
