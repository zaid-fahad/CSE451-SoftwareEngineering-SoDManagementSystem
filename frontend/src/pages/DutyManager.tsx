import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { useDuties } from '../services/useDuties';
import { DutyList } from '../component/Duty/DutyList';
import { CreateDutyModal } from '../component/Duty/CreateDutyModal';
import { AssignStudentModal } from '../component/Duty/AssignStudentModal';
import { Button } from '../component/UI/Button';
import { DemoRoleBar } from '../component/UI/DemoRoleBar';
import { Building2, Plus, ArrowLeft, Calendar, ShieldCheck, LogOut } from 'lucide-react';
import { DutySlot } from '../model/duty';

export const DutyManager: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { duties, createDuty, assignStudent, removeStudent, deleteDuty } = useDuties();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [assignModalDuty, setAssignModalDuty] = useState<DutySlot | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Demo Interactive Role Bar */}
      <DemoRoleBar />

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="!py-1.5 !px-3 text-xs gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-blue-600 text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-900">Duty Slot Management</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              {user?.role || 'LabManager'}
            </span>
            <Button variant="outline" onClick={logout} className="!py-1.5 !px-3 text-xs gap-1">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        
        {/* Toolbar Header */}
        <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Department Duty Slots & Assignments</span>
            </h1>
            <p className="text-xs text-slate-500">
              Define lab and exam duty windows, set required student capacities, and assign available students.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="!py-2 !px-4 text-xs gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Duty Slot</span>
          </Button>
        </div>

        {/* Duty Slots List */}
        <DutyList
          duties={duties}
          onOpenAssignModal={(duty) => setAssignModalDuty(duty)}
          onRemoveStudent={removeStudent}
          onDeleteDuty={deleteDuty}
        />

      </main>

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
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Departmental Student on Duty System &bull; Version 1.0
      </footer>
    </div>
  );
};
