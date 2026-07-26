import React, { useState } from 'react';
import { X, UserPlus, Check, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { DutySlot } from '../../model/duty';
import { User } from '../../model/user';
import { MOCK_STUDENTS } from '../../services/useDuties';

interface AssignStudentModalProps {
  isOpen: boolean;
  duty: DutySlot | null;
  onClose: () => void;
  onAssign: (dutyId: string, student: User) => boolean;
}

export const AssignStudentModal: React.FC<AssignStudentModalProps> = ({
  isOpen,
  duty,
  onClose,
  onAssign,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !duty) return null;

  const isFull = duty.assignedStudents.length >= duty.maxStudents;

  const handleAssign = () => {
    setError(null);
    if (!selectedStudentId) {
      setError('Please select a student from the list.');
      return;
    }

    const studentToAssign = MOCK_STUDENTS.find((s) => s.id === selectedStudentId);
    if (!studentToAssign) return;

    const success = onAssign(duty.id, studentToAssign);
    if (success) {
      onClose();
      setSelectedStudentId('');
    } else {
      setError('Student is already assigned or slot is full.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden text-left animate-fadeIn">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assign Student to Duty</h3>
              <p className="text-[11px] text-slate-500">{duty.title} ({duty.day} {duty.startTime})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {isFull ? (
            <div className="p-4 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              This duty slot is at full capacity ({duty.assignedStudents.length}/{duty.maxStudents}).
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Select Available Student
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {MOCK_STUDENTS.map((student) => {
                  const isAssigned = duty.assignedStudents.some((s) => s.id === student.id);
                  const isSelected = selectedStudentId === student.id;

                  return (
                    <div
                      key={student.id}
                      onClick={() => !isAssigned && setSelectedStudentId(student.id)}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                        isAssigned
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-900 cursor-pointer'
                          : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-800'
                      }`}
                    >
                      <div>
                        <span className="font-bold block">{student.name}</span>
                        <span className="text-[11px] text-slate-500">{student.email} &bull; Dept ID: {student.department_id}</span>
                      </div>
                      {isAssigned ? (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">Assigned</span>
                      ) : isSelected ? (
                        <Check className="w-4 h-4 text-blue-600" />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={onClose} className="!py-2 !px-3 text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={isFull || !selectedStudentId}
              className="!py-2 !px-4 text-xs"
            >
              Assign Selected Student
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
