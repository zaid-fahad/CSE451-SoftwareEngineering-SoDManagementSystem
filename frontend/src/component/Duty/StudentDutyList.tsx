import React from 'react';
import { DutySlot } from '../../model/duty';
import { User } from '../../model/user';
import { MapPin, Clock, GraduationCap, CheckCircle2, Calendar } from 'lucide-react';

interface StudentDutyListProps {
  duties: DutySlot[];
  user: User | null;
}

export const StudentDutyList: React.FC<StudentDutyListProps> = ({ duties, user }) => {
  // Filter duties where current user is in assignedStudents
  const myDuties = duties.filter((d) =>
    d.assignedStudents.some((st) => st.email === user?.email || st.id === user?.id)
  );

  if (myDuties.length === 0) {
    return (
      <div className="card-enterprise p-8 text-center text-slate-500 space-y-2">
        <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700">No Duty Slots Assigned Yet</p>
        <p className="text-xs">Your Lab Manager or Department Manager will assign lab/exam duty windows here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
      {myDuties.map((duty) => (
        <div key={duty.id} className="card-enterprise p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                {duty.type === 'LabDuty' ? 'Lab Duty' : duty.type === 'ExamDuty' ? 'Exam Duty' : 'General Duty'}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Active Assignment
              </span>
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
          </div>

          {duty.assignedFaculty && (
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Supervising Faculty:</span>
              <span className="font-bold text-purple-800 text-[11px] flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                {duty.assignedFaculty}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
