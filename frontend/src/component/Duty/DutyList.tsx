import React from 'react';
import { DutySlot } from '../../model/duty';
import { MapPin, Clock, Users, UserPlus, Trash2, CheckCircle2, GraduationCap } from 'lucide-react';
import { Button } from '../UI/Button';

interface DutyListProps {
  duties: DutySlot[];
  onOpenAssignModal: (duty: DutySlot) => void;
  onRemoveStudent: (dutyId: string, studentId: string) => void;
  onDeleteDuty: (dutyId: string) => void;
}

export const DutyList: React.FC<DutyListProps> = ({
  duties,
  onOpenAssignModal,
  onRemoveStudent,
  onDeleteDuty,
}) => {
  if (duties.length === 0) {
    return (
      <div className="card-enterprise p-8 text-center text-slate-500 space-y-2">
        <p className="text-sm font-medium">No duty slots created yet.</p>
        <p className="text-xs">Click "Create Duty Slot" to add a new lab or exam duty window.</p>
      </div>
    );
  }

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'LabDuty':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ExamDuty':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
      {duties.map((duty) => {
        const isFull = duty.assignedStudents.length >= duty.maxStudents;

        return (
          <div key={duty.id} className="card-enterprise p-5 flex flex-col justify-between space-y-4">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className={`px-2.5 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${getBadgeStyle(duty.type)}`}>
                  {duty.type === 'LabDuty' ? 'Lab Duty' : duty.type === 'ExamDuty' ? 'Exam Duty' : 'General Duty'}
                </span>
                <button
                  onClick={() => onDeleteDuty(duty.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded cursor-pointer"
                  title="Delete Duty Slot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{duty.title}</h3>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{duty.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{duty.day} {duty.startTime} - {duty.endTime}</span>
                </div>
              </div>

              {duty.assignedFaculty && (
                <div className="text-[11px] text-purple-700 font-medium flex items-center gap-1 pt-1">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  <span>Supervisor: <strong>{duty.assignedFaculty}</strong></span>
                </div>
              )}
            </div>

            {/* Assigned Students Section */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assigned Students</span>
                </span>
                <span className={`font-mono text-[11px] font-bold ${isFull ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {duty.assignedStudents.length} / {duty.maxStudents}
                </span>
              </div>

              {duty.assignedStudents.length === 0 ? (
                <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-400 text-center">
                  No students assigned to this slot yet.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {duty.assignedStudents.map((st) => (
                    <div key={st.id} className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-medium text-slate-800">{st.name}</span>
                        <span className="text-[10px] text-slate-500">({st.department_id})</span>
                      </div>
                      <button
                        onClick={() => onRemoveStudent(duty.id, st.id)}
                        className="text-slate-400 hover:text-red-600 text-[10px] underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="pt-2">
              <Button
                variant={isFull ? 'secondary' : 'outline'}
                onClick={() => onOpenAssignModal(duty)}
                disabled={isFull}
                fullWidth
                className="!py-1.5 text-xs gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isFull ? 'Slot Full' : 'Assign Student'}</span>
              </Button>
            </div>

          </div>
        );
      })}
    </div>
  );
};
