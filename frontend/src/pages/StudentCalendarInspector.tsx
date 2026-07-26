import React, { useState } from 'react';
import { MOCK_STUDENTS } from '../services/useDuties';
import { useSchedule } from '../services/useSchedule';
import { AvailabilityGrid } from '../component/Schedule/AvailabilityGrid';
import { CalendarSearch, UserCheck } from 'lucide-react';

export const StudentCalendarInspector: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(MOCK_STUDENTS[0].id);
  const { slots, toggleSlot, loadDemoData } = useSchedule();

  const selectedStudent = MOCK_STUDENTS.find((s) => s.id === selectedStudentId) || MOCK_STUDENTS[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarSearch className="w-5 h-5 text-blue-600" />
            <span>Student Timetable & Duty Calendar Inspector</span>
          </h1>
          <p className="text-xs text-slate-500">
            Inspect individual student weekly class timetables, busy overrides, and assigned duty slots.
          </p>
        </div>

        {/* Student Selector */}
        <div className="flex flex-col space-y-1 text-left shrink-0">
          <label htmlFor="studentSelect" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Select Student to Inspect
          </label>
          <div className="relative flex items-center">
            <select
              id="studentSelect"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-white text-slate-900 text-xs font-bold rounded-md py-2 px-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
            >
              {MOCK_STUDENTS.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.department_id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selected Student Profile Banner */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex flex-wrap items-center justify-between gap-3 text-xs text-left">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Viewing Weekly Calendar for <strong>{selectedStudent.name}</strong> ({selectedStudent.email})</span>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-white font-mono font-bold text-blue-800 text-[11px] border border-blue-200">
          Dept ID: {selectedStudent.department_id}
        </span>
      </div>

      {/* Timetable Grid View */}
      <AvailabilityGrid
        slots={slots}
        onToggleSlot={toggleSlot}
        onLoadDemoData={loadDemoData}
      />
    </div>
  );
};
