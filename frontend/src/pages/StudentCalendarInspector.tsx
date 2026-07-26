import React, { useState } from 'react';
import { MOCK_STUDENTS, useDuties } from '../services/useDuties';
import { useSchedule } from '../services/useSchedule';
import { AvailabilityGrid } from '../component/Schedule/AvailabilityGrid';
import { CalendarSearch, User, ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '../component/UI/Button';

export const StudentCalendarInspector: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { duties } = useDuties();
  const { slots, toggleSlot, loadDemoData } = useSchedule();

  const selectedStudent = MOCK_STUDENTS.find((s) => s.id === selectedStudentId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarSearch className="w-5 h-5 text-blue-600" />
            <span>Student Directory & Timetable Inspector</span>
          </h1>
          <p className="text-xs text-slate-500">
            Inspect individual student weekly class timetables, busy overrides, and assigned duty slots.
          </p>
        </div>

        {selectedStudent && (
          <Button
            variant="outline"
            onClick={() => setSelectedStudentId(null)}
            className="!py-1.5 !px-3 text-xs gap-1.5 self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Student Directory</span>
          </Button>
        )}
      </div>

      {/* View 1: Student Directory Grid */}
      {!selectedStudent ? (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Student Directory ({MOCK_STUDENTS.length} Enrolled Students)
            </h2>
            <span className="text-xs text-slate-500">Click any student to view their weekly timetable calendar</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_STUDENTS.map((st) => {
              const studentDuties = duties.filter((d) =>
                d.assignedStudents.some((s) => s.id === st.id || s.email === st.email)
              );

              return (
                <div key={st.id} className="card-enterprise p-5 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all shadow-xs">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {st.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{st.name}</h3>
                        <span className="text-[11px] text-slate-500 block font-mono">{st.department_id}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Email:</span>
                        <span className="font-medium text-slate-800 text-[11px]">{st.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Assigned Duties:</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[10px] border border-blue-200">
                          {studentDuties.length} Slots
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => setSelectedStudentId(st.id)}
                    fullWidth
                    className="!py-1.5 text-xs gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>View Timetable Calendar</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* View 2: Student Timetable Calendar Detail */
        <div className="space-y-4 text-left">
          {/* Selected Student Banner */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Inspecting Weekly Calendar for <strong>{selectedStudent.name}</strong> ({selectedStudent.email})</span>
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
      )}
    </div>
  );
};
