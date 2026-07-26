import React, { useState } from 'react';
import { MOCK_STUDENTS, useDuties } from '../services/useDuties';
import { useSchedule } from '../services/useSchedule';
import { AvailabilityGrid } from '../component/Schedule/AvailabilityGrid';
import { CalendarSearch, User, ArrowLeft, Calendar, Search, GraduationCap } from 'lucide-react';
import { Button } from '../component/UI/Button';

export const StudentCalendarInspector: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { duties } = useDuties();
  const { slots, toggleSlot, loadDemoData } = useSchedule();

  const selectedStudent = MOCK_STUDENTS.find((s) => s.id === selectedStudentId);

  const filteredStudents = MOCK_STUDENTS.filter((st) => {
    const q = searchQuery.toLowerCase();
    return (
      st.name.toLowerCase().includes(q) ||
      st.email.toLowerCase().includes(q) ||
      st.department_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

      {/* View 1: Searchable Student Directory Table View */}
      {!selectedStudent ? (
        <div className="card-enterprise p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Student Directory ({filteredStudents.length} Students Enrolled)
              </h2>
              <p className="text-xs text-slate-500">Search student name, email, or department ID to inspect timetable calendar</p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, email, or dept ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs rounded-md py-2 pl-9 pr-3 border border-slate-300 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {/* Directory Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="p-3.5 border-r border-slate-200">Student Profile</th>
                  <th className="p-3.5 border-r border-slate-200">University Email</th>
                  <th className="p-3.5 border-r border-slate-200 text-center">Assigned Duties</th>
                  <th className="p-3.5 border-r border-slate-200">Supervising Faculty</th>
                  <th className="p-3.5 text-center">Timetable Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => {
                  const studentDuties = duties.filter((d) =>
                    d.assignedStudents.some((s) => s.id === st.id || s.email === st.email)
                  );
                  const supervisorNames = Array.from(new Set(studentDuties.map((d) => d.assignedFaculty).filter(Boolean)));

                  return (
                    <tr key={st.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors">
                      
                      {/* Student Info */}
                      <td className="p-3.5 border-r border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-800 flex items-center justify-center font-bold text-xs">
                            {st.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{st.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">ID: {st.department_id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-3.5 border-r border-slate-200 font-medium text-slate-700">
                        {st.email}
                      </td>

                      {/* Assigned Duties */}
                      <td className="p-3.5 border-r border-slate-200 text-center">
                        <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-bold text-[11px]">
                          {studentDuties.length} Duties
                        </span>
                      </td>

                      {/* Supervising Faculty */}
                      <td className="p-3.5 border-r border-slate-200">
                        {supervisorNames.length > 0 ? (
                          <div className="text-[11px] font-medium text-purple-800 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                            <span>{supervisorNames.join(', ')}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <Button
                          variant="primary"
                          onClick={() => setSelectedStudentId(st.id)}
                          className="!py-1.5 !px-3 text-xs gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Inspect Timetable Calendar</span>
                        </Button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
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
