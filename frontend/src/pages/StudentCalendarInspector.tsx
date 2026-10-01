import React, { useState, useEffect, useCallback } from 'react';
import { useDuties, MOCK_STUDENTS } from '../services/useDuties';
import { DAYS, HOURS } from '../services/useSchedule';
import { AvailabilityGrid } from '../component/Schedule/AvailabilityGrid';
import { ManagerScheduleOverrideModal } from '../component/Schedule/ManagerScheduleOverrideModal';
import { useSemesters } from '../context/SemesterContext';
import { useAuth } from '../services/useAuth';
import { api } from '../services/api';
import { AvailabilitySlot } from '../model/schedule';
import {
  CalendarSearch,
  User,
  ArrowLeft,
  Calendar,
  Search,
  GraduationCap,
  Edit3,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Button } from '../component/UI/Button';

const get24HourRange = (timeLabel: string): { start24: string; end24: string } => {
  const parts = timeLabel.split(' ');
  const time = parts[0];
  const ampm = parts[1];
  const hourPart = parseInt(time.split(':')[0], 10);
  const minutePart = time.split(':')[1];

  let hour24 = hourPart;
  if (ampm === 'PM' && hourPart !== 12) {
    hour24 += 12;
  } else if (ampm === 'AM' && hourPart === 12) {
    hour24 = 0;
  }

  const startHourStr = String(hour24).padStart(2, '0');
  const endHourStr = String(hour24 + 1).padStart(2, '0');

  return {
    start24: `${startHourStr}:${minutePart}`,
    end24: `${endHourStr}:${minutePart}`,
  };
};

export const StudentCalendarInspector: React.FC = () => {
  const { user } = useAuth();
  const { semesters, activeSemester } = useSemesters();
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  useEffect(() => {
    if (activeSemester && !selectedSemester) {
      setSelectedSemester(activeSemester.name);
    }
  }, [activeSemester, selectedSemester]);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [studentSlots, setStudentSlots] = useState<AvailabilitySlot[]>([]);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { duties, students, refreshData } = useDuties();

  useEffect(() => {
    if (selectedSemester) {
      refreshData(selectedSemester);
    }
  }, [selectedSemester, refreshData]);

  const allStudents = students && students.length > 0 ? students : MOCK_STUDENTS;
  const selectedStudent = allStudents.find((s) => String(s.id) === String(selectedStudentId));

  const filteredStudents = allStudents.filter((st) => {
    const q = searchQuery.toLowerCase();
    return (
      st.name.toLowerCase().includes(q) ||
      st.email.toLowerCase().includes(q) ||
      (st.department_id && st.department_id.toLowerCase().includes(q))
    );
  });

  const fetchStudentSchedule = useCallback(async () => {
    if (!selectedStudentId) return;

    try {
      const res = await api.get(`/schedule/student/${selectedStudentId}`, {
        params: selectedSemester ? { semester: selectedSemester } : {},
      });
      const dbSlots = res.data;

      const studentDuties = duties.filter((d) =>
        d.assignedStudents.some((s) => String(s.id) === String(selectedStudentId))
      );

      const grid: AvailabilitySlot[] = [];
      DAYS.forEach((day) => {
        HOURS.forEach((time) => {
          const key = `${day}-${time}`;
          const { start24, end24 } = get24HourRange(time);

          // Check if duty assigned
          const dutyMatch = studentDuties.find((d) => d.day === day && d.startTime === time);

          if (dutyMatch) {
            grid.push({
              id: key,
              day,
              time,
              type: 'Duty',
              dutyTitle: dutyMatch.title,
            });
            return;
          }

          // Check DB schedule
          const match = dbSlots.find(
            (dbSlot: any) =>
              dbSlot.day_of_week === day &&
              dbSlot.start_time < end24 &&
              dbSlot.end_time > start24
          );

          if (match) {
            grid.push({
              id: key,
              day,
              time,
              type: match.is_override ? 'Busy' : 'Class',
              courseCode: match.course_code || undefined,
            });
          } else {
            grid.push({
              id: key,
              day,
              time,
              type: 'Free',
            });
          }
        });
      });

      setStudentSlots(grid);
    } catch (err) {
      console.error('Failed to load student schedule:', err);
    }
  }, [selectedStudentId, selectedSemester, duties]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentSchedule();
    }
  }, [selectedStudentId, fetchStudentSchedule]);

  const handleOverridesSaved = () => {
    fetchStudentSchedule();
    setToastMsg(`Schedule overrides for ${selectedStudent?.name} saved successfully.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const isManager = user?.role === 'LabManager' || user?.role === 'DeptManager';

  return (
    <div className="space-y-6 text-left">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarSearch className="w-5 h-5 text-blue-600" />
            <span>Student Directory & Timetable Inspector</span>
          </h1>
          <p className="text-xs text-slate-500">
            Inspect individual student weekly class timetables, busy overrides, and assigned duty slots across semesters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Semester Filter Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">Semester:</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="bg-transparent font-bold text-blue-700 outline-none cursor-pointer"
            >
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.name}>
                  {sem.name} {sem.is_active ? '(Active)' : ''}
                </option>
              ))}
            </select>
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
      </div>

      {/* View 1: Searchable Student Directory Table View */}
      {!selectedStudent ? (
        <div className="card-enterprise p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Student Directory ({filteredStudents.length} Students Enrolled)
              </h2>
              <p className="text-xs text-slate-500">
                Filter by academic semester, search student name, email, or department ID to inspect timetable calendar.
              </p>
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
                  <th className="p-3.5 border-r border-slate-200 text-center">Assigned Duties ({selectedSemester})</th>
                  <th className="p-3.5 border-r border-slate-200">Supervising Faculty</th>
                  <th className="p-3.5 text-center">Timetable Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => {
                  const studentDuties = duties.filter((d) =>
                    d.assignedStudents.some((s) => String(s.id) === String(st.id) || s.email === st.email)
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
                            <div className="text-[11px] text-slate-500 font-mono">ID: {st.department_id || 'N/A'}</div>
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
                          onClick={() => setSelectedStudentId(String(st.id))}
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
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Inspecting Timetable for <strong>{selectedStudent.name}</strong> ({selectedStudent.email}) &mdash;{' '}
                <span className="font-semibold text-blue-800">Semester: {selectedSemester}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-white font-mono font-bold text-blue-800 text-[11px] border border-blue-200">
                Dept ID: {selectedStudent.department_id || 'N/A'}
              </span>

              {isManager && (
                <Button
                  variant="primary"
                  onClick={() => setIsOverrideModalOpen(true)}
                  className="!py-1.5 !px-3 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Availability (Manager Override)</span>
                </Button>
              )}
            </div>
          </div>

          {/* Timetable Grid View */}
          <AvailabilityGrid
            slots={studentSlots}
            onToggleSlot={() => {}}
            isLocked={true}
            lockMessage={
              isManager
                ? `Viewing student availability for '${selectedSemester}'. Use 'Edit Availability (Manager Override)' above to modify busy slots.`
                : `Student availability for '${selectedSemester}' is read-only.`
            }
          />

          {/* Override Modal */}
          {selectedStudent && (
            <ManagerScheduleOverrideModal
              isOpen={isOverrideModalOpen}
              onClose={() => setIsOverrideModalOpen(false)}
              studentId={selectedStudent.id}
              studentName={selectedStudent.name}
              semesterName={selectedSemester}
              existingSlots={studentSlots}
              onOverridesSaved={handleOverridesSaved}
            />
          )}
        </div>
      )}
    </div>
  );
};
