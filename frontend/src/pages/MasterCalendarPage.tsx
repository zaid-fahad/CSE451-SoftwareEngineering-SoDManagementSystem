import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { useDuties } from '../services/useDuties';
import { useSemesters } from '../context/SemesterContext';
import { DAYS, HOURS } from '../services/useSchedule';
import { DayOfWeek } from '../model/schedule';
import { DutySlot } from '../model/duty';
import { CreateDutyModal } from '../component/Duty/CreateDutyModal';
import { AssignStudentModal } from '../component/Duty/AssignStudentModal';
import { Button } from '../component/UI/Button';
import { Calendar, MapPin, Clock, Users, Search, Plus, UserPlus, Filter, Archive } from 'lucide-react';

export const MasterCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { semesters, activeSemester } = useSemesters();
  const [searchParams] = useSearchParams();
  const urlSemester = searchParams.get('semester');

  const [selectedSemester, setSelectedSemester] = useState<string>(urlSemester || '');

  useEffect(() => {
    if (urlSemester) {
      setSelectedSemester(urlSemester);
    } else if (activeSemester && !selectedSemester) {
      setSelectedSemester(activeSemester.name);
    } else if (!selectedSemester && semesters.length > 0) {
      setSelectedSemester(semesters[0].name);
    }
  }, [urlSemester, activeSemester, selectedSemester, semesters]);

  const { duties, students, createDuty, assignStudent, checkStudentConflict, refreshData } = useDuties();

  useEffect(() => {
    if (selectedSemester) {
      refreshData(selectedSemester);
    }
  }, [selectedSemester, refreshData]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [assignModalDuty, setAssignModalDuty] = useState<DutySlot | null>(null);

  const selectedSemObj = semesters.find((s) => s.name === selectedSemester);
  const isArchived = Boolean(selectedSemObj?.is_archived);
  const isDeptManager = user?.role === 'DeptManager';

  const filteredDuties = duties.filter((d: DutySlot) => {
    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      d.day.toLowerCase().includes(q) ||
      (d.assignedFaculty && d.assignedFaculty.toLowerCase().includes(q)) ||
      d.assignedStudents.some((s) => s.name.toLowerCase().includes(q) || s.department_id.toLowerCase().includes(q))
    );
  });

  const getDutyBadgeColor = (type: string) => {
    switch (type) {
      case 'LabDuty':
        return 'bg-blue-600 text-white border-blue-700';
      case 'ExamDuty':
        return 'bg-purple-600 text-white border-purple-700';
      default:
        return 'bg-slate-700 text-white border-slate-800';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>Master Department Schedule & Duty Operations</span>
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive weekly timetable overview of all departmental lab duties, exam proctoring windows, room locations, and assigned student assistants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
                  {sem.name} {sem.is_archived ? '(Archived)' : sem.is_active ? '★ (Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Live Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search duties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs rounded-md py-2 pl-9 pr-3 border border-slate-300 focus:border-blue-600 outline-none"
            />
          </div>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isArchived && !isDeptManager}
            className={`!py-2 !px-4 text-xs gap-1.5 shrink-0 ${
              isArchived && !isDeptManager ? 'opacity-50 cursor-not-allowed bg-slate-400 hover:bg-slate-400' : ''
            }`}
            title={
              isArchived && !isDeptManager
                ? 'Semester is archived. Only Department Managers can create emergency duty slots.'
                : undefined
            }
          >
            <Plus className="w-4 h-4" />
            <span>Create Duty Slot</span>
          </Button>
        </div>
      </div>

      {/* Historical Archive Banner */}
      {isArchived && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Historical Master Schedule (Read-Only):</strong> Viewing concluded semester <strong>'{selectedSemester}'</strong>. Departmental duty assignments and room allocations are archived for historical inspection.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] shrink-0 uppercase tracking-wider">
            Archived Calendar
          </span>
        </div>
      )}

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-enterprise p-4 space-y-1 bg-blue-50/40 border-blue-200">
          <span className="text-xs font-semibold text-slate-500">Master Department Duty Windows</span>
          <div className="text-2xl font-bold text-blue-900">{duties.length} Slots</div>
        </div>

        <div className="card-enterprise p-4 space-y-1 bg-purple-50/40 border-purple-200">
          <span className="text-xs font-semibold text-slate-500">Total Student Capacity</span>
          <div className="text-2xl font-bold text-purple-900">
            {duties.reduce((sum, d) => sum + d.assignedStudents.length, 0)} / {duties.reduce((sum, d) => sum + d.maxStudents, 0)} Filled
          </div>
        </div>

        <div className="card-enterprise p-4 space-y-1 bg-emerald-50/40 border-emerald-200">
          <span className="text-xs font-semibold text-slate-500">Supervising Faculty Pool</span>
          <div className="text-2xl font-bold text-emerald-900">2 Faculty Supervisors</div>
        </div>
      </div>

      {/* Unified Master Weekly Schedule Grid */}
      <div className="card-enterprise p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Weekly Master Timetable (Sun - Fri)</h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-blue-600"></span> Lab Duty
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-purple-600"></span> Exam Duty
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-700"></span> General Duty
            </span>
          </div>
        </div>

        {/* Master Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold text-center">
                <th className="p-3 border-r border-slate-200 w-24">Time Window</th>
                {DAYS.map((d) => (
                  <th key={d} className="p-3 border-r border-slate-200 last:border-r-0">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((h: string) => (
                <tr key={h} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/50">
                  {/* Time Label */}
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-600 bg-slate-50/50 text-center font-mono text-[11px]">
                    {h}
                  </td>

                  {/* Day Cells */}
                  {DAYS.map((day: DayOfWeek) => {
                    // Match duty slots occurring on this day and time hour
                    const cellDuties = filteredDuties.filter((d: DutySlot) => {
                      if (d.day !== day) return false;
                      const startHour = parseInt(d.startTime.split(':')[0], 10);
                      const currentHour = parseInt(h.split(':')[0], 10);
                      return startHour === currentHour;
                    });

                    return (
                      <td key={day} className="p-2 border-r border-slate-200 last:border-r-0 align-top h-24">
                        {cellDuties.length === 0 ? (
                          !isArchived || isDeptManager ? (
                            <button
                              onClick={() => setIsCreateModalOpen(true)}
                              className="w-full h-full rounded border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 transition-colors flex items-center justify-center text-[10px] text-slate-400 hover:text-blue-600 gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Duty</span>
                            </button>
                          ) : (
                            <div className="w-full h-full rounded border border-slate-100 bg-slate-50/30" />
                          )
                        ) : (
                          <div className="space-y-1.5">
                            {cellDuties.map((duty: DutySlot) => {
                              const isFull = duty.assignedStudents.length >= duty.maxStudents;
                              return (
                                <div
                                  key={duty.id}
                                  className={`p-2 rounded-md border shadow-xs text-left space-y-1 ${getDutyBadgeColor(duty.type)}`}
                                >
                                  <div className="font-bold text-xs leading-snug">{duty.title}</div>
                                  <div className="text-[10px] opacity-90 flex items-center gap-1 font-mono">
                                    <MapPin className="w-3 h-3" />
                                    <span>{duty.location}</span>
                                  </div>
                                  <div className="text-[10px] opacity-90 flex items-center gap-1 font-mono">
                                    <Clock className="w-3 h-3" />
                                    <span>{duty.startTime} - {duty.endTime}</span>
                                  </div>

                                  {duty.assignedStudents.length > 0 && (
                                    <div className="pt-1 border-t border-white/20 text-[10px] space-y-0.5">
                                      <div className="font-semibold flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        <span>Assigned ({duty.assignedStudents.length}):</span>
                                      </div>
                                      <div className="truncate font-medium opacity-95">
                                        {duty.assignedStudents.map((s) => s.name).join(', ')}
                                      </div>
                                    </div>
                                  )}

                                  {(!isArchived || isDeptManager) && (
                                    <div className="pt-1">
                                      <button
                                        onClick={() => setAssignModalDuty(duty)}
                                        disabled={isFull}
                                        className="w-full py-0.5 px-1.5 rounded bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                                      >
                                        <UserPlus className="w-3 h-3" />
                                        <span>{isFull ? 'Slot Full' : 'Assign Student'}</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateDutyModal
        isOpen={isCreateModalOpen}
        students={students}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(data) => createDuty({ ...data, semester: selectedSemester })}
      />

      <AssignStudentModal
        isOpen={!!assignModalDuty}
        duty={assignModalDuty}
        students={students}
        onClose={() => setAssignModalDuty(null)}
        onAssign={assignStudent}
        checkStudentConflict={checkStudentConflict}
      />
    </div>
  );
};
