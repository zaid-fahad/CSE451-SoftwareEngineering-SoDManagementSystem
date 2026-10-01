import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { useDuties } from '../services/useDuties';
import { useSemesters } from '../context/SemesterContext';
import { DutyList } from '../component/Duty/DutyList';
import { CreateDutyModal } from '../component/Duty/CreateDutyModal';
import { AssignStudentModal } from '../component/Duty/AssignStudentModal';
import { Button } from '../component/UI/Button';
import { Plus, Calendar, ShieldCheck, Filter, Archive } from 'lucide-react';
import { DutySlot } from '../model/duty';

export const DutyManager: React.FC = () => {
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

  const { duties, students, createDuty, assignStudent, removeStudent, deleteDuty, checkStudentConflict, refreshData } = useDuties();

  useEffect(() => {
    if (selectedSemester) {
      refreshData(selectedSemester);
    }
  }, [selectedSemester, refreshData]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [assignModalDuty, setAssignModalDuty] = useState<DutySlot | null>(null);

  const selectedSemObj = semesters.find((s) => s.name === selectedSemester);
  const isArchived = Boolean(selectedSemObj?.is_archived);
  const isDeptManager = user?.role === 'DeptManager';

  const totalSlots = duties.length;
  const totalAssigned = duties.reduce((sum, d) => sum + d.assignedStudents.length, 0);
  const totalCapacity = duties.reduce((sum, d) => sum + d.maxStudents, 0);
  const fillPercentage = totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 100) : 0;
  const facultyCount = new Set(duties.map((d) => d.assignedFaculty).filter(Boolean)).size;

  return (
    <div className="space-y-6 text-left">
      {/* Toolbar Header */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Department Duty Slots & Student Assignments</span>
          </h1>
          <p className="text-xs text-slate-500">
            Define lab and exam duty windows, assign supervising Faculty members, and manage student capacities across semesters.
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

          <span className="px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{user?.role || 'LabManager'}</span>
          </span>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isArchived && !isDeptManager}
            className={`!py-2 !px-4 text-xs gap-1.5 self-start sm:self-auto ${
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
              <strong>Historical Duty Archive (Read-Only):</strong> Academic semester <strong>'{selectedSemester}'</strong> has concluded and is archived. Duty assignments, supervisor logs, and shift records are locked for historical preservation.
              {isDeptManager && ' You are signed in as DeptManager and retain emergency override privileges.'}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] shrink-0 uppercase tracking-wider">
            Historical Records
          </span>
        </div>
      )}

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-enterprise p-4 space-y-1 bg-blue-50/40 border-blue-200">
          <span className="text-xs font-semibold text-slate-500">Total Duty Windows</span>
          <div className="text-2xl font-bold text-blue-900">{totalSlots} Slots</div>
        </div>

        <div className="card-enterprise p-4 space-y-2 bg-emerald-50/40 border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Assigned Capacity</span>
            <span className="text-xs font-bold text-emerald-800">{fillPercentage}% Filled</span>
          </div>
          <div className="text-xl font-bold text-emerald-900">{totalAssigned} / {totalCapacity} Students</div>
          <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${fillPercentage}%` }}></div>
          </div>
        </div>

        <div className="card-enterprise p-4 space-y-1 bg-purple-50/40 border-purple-200">
          <span className="text-xs font-semibold text-slate-500">Faculty Supervisors</span>
          <div className="text-2xl font-bold text-purple-900">{facultyCount} Faculty</div>
        </div>
      </div>

      {/* Duty Slots List & Table View */}
      <DutyList
        duties={duties}
        onOpenAssignModal={(duty) => setAssignModalDuty(duty)}
        onRemoveStudent={removeStudent}
        onDeleteDuty={deleteDuty}
        isReadOnly={isArchived && !isDeptManager}
      />

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
