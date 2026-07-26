import React, { useState } from 'react';
import { X, UserPlus, Check, AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../UI/Button';
import { DutySlot, ScheduleConflict } from '../../model/duty';
import { User } from '../../model/user';
import { DayOfWeek } from '../../model/schedule';
import { MOCK_STUDENTS } from '../../services/useDuties';

interface AssignStudentModalProps {
  isOpen: boolean;
  duty: DutySlot | null;
  onClose: () => void;
  onAssign: (dutyId: string, student: User) => boolean;
  checkStudentConflict: (studentId: string, day: DayOfWeek, startTime: string) => ScheduleConflict;
}

export const AssignStudentModal: React.FC<AssignStudentModalProps> = ({
  isOpen,
  duty,
  onClose,
  onAssign,
  checkStudentConflict,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !duty) return null;

  const isFull = duty.assignedStudents.length >= duty.maxStudents;

  const handleAssign = () => {
    setError(null);
    if (!selectedStudentId) {
      setError('Please select an available student from the list.');
      return;
    }

    const studentToAssign = MOCK_STUDENTS.find((s) => s.id === selectedStudentId);
    if (!studentToAssign) return;

    // Check conflict guard
    const conflict = checkStudentConflict(studentToAssign.id, duty.day, duty.startTime);
    if (conflict.hasConflict) {
      setError(`Cannot assign student: ${conflict.reason}`);
      return;
    }

    const success = onAssign(duty.id, studentToAssign);
    if (success) {
      onClose();
      setSelectedStudentId('');
    } else {
      setError('Student assignment failed. Slot may be full or student already assigned.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-lg overflow-hidden text-left animate-fadeIn">
        
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Select Available Student
                </label>
                <span className="text-[10px] text-slate-500 font-medium">
                  Real-time Schedule Conflict Check Active
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {MOCK_STUDENTS.map((student) => {
                  const isAssigned = duty.assignedStudents.some((s) => s.id === student.id);
                  const conflict = checkStudentConflict(student.id, duty.day, duty.startTime);
                  const isSelected = selectedStudentId === student.id;

                  return (
                    <div
                      key={student.id}
                      onClick={() => !isAssigned && !conflict.hasConflict && setSelectedStudentId(student.id)}
                      className={`p-3 rounded-lg border text-xs transition-all ${
                        isAssigned
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : conflict.hasConflict
                          ? 'bg-rose-50/70 border-rose-200 text-rose-900 cursor-not-allowed opacity-90'
                          : isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-900 cursor-pointer shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold block text-sm">{student.name}</span>
                          <span className="text-[11px] text-slate-500">{student.email} &bull; Dept ID: {student.department_id}</span>
                        </div>

                        {isAssigned ? (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Assigned</span>
                        ) : conflict.hasConflict ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>Conflict: {conflict.type === 'Class' ? `Class ${conflict.conflictingCourse}` : 'Busy Override'}</span>
                          </span>
                        ) : isSelected ? (
                          <Check className="w-4 h-4 text-blue-600 mt-1" />
                        ) : null}
                      </div>

                      {conflict.hasConflict && (
                        <div className="mt-1.5 pt-1.5 border-t border-rose-200/60 text-[11px] text-rose-600 font-medium">
                          {conflict.reason}
                        </div>
                      )}
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
