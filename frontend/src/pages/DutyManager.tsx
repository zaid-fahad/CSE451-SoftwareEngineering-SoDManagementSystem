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

  return (
    <div className="space-y-6">
      {/* Toolbar Header */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Department Duty Slots & Student Assignments</span>
          </h1>
          <p className="text-xs text-slate-500">
            Define lab and exam duty windows, assign supervising Faculty members, and set student capacities.
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

      {/* Duty Slots List */}
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
