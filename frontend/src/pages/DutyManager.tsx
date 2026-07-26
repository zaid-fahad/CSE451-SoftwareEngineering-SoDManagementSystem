import React, { useState } from 'react';
import { useAuth } from '../services/useAuth';
import { useDuties } from '../services/useDuties';
import { DutyList } from '../component/Duty/DutyList';
import { CreateDutyModal } from '../component/Duty/CreateDutyModal';
import { AssignStudentModal } from '../component/Duty/AssignStudentModal';
import { Button } from '../component/UI/Button';
import { Plus, Calendar, ShieldCheck } from 'lucide-react';
import { DutySlot } from '../model/duty';

export const DutyManager: React.FC = () => {
  const { user } = useAuth();
  const { duties, createDuty, assignStudent, removeStudent, deleteDuty, checkStudentConflict } = useDuties();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [assignModalDuty, setAssignModalDuty] = useState<DutySlot | null>(null);

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
            Define lab and exam duty windows, assign supervising Faculty members, and manage student capacities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{user?.role || 'LabManager'}</span>
          </span>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="!py-2 !px-4 text-xs gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Duty Slot</span>
          </Button>
        </div>
      </div>

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
      />

      {/* Modals */}
      <CreateDutyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createDuty}
      />

      <AssignStudentModal
        isOpen={!!assignModalDuty}
        duty={assignModalDuty}
        onClose={() => setAssignModalDuty(null)}
        onAssign={assignStudent}
        checkStudentConflict={checkStudentConflict}
      />
    </div>
  );
};
