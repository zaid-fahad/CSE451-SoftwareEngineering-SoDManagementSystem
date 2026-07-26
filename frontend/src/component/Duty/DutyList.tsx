import React, { useState } from 'react';
import { DutySlot } from '../../model/duty';
import { MapPin, Clock, Users, UserPlus, Trash2, CheckCircle2, GraduationCap, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selectedDutyIds, setSelectedDutyIds] = useState<string[]>([]);

  // Filter duties by search query and type filter
  const filteredDuties = duties.filter((d) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      d.title.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      d.day.toLowerCase().includes(q) ||
      (d.assignedFaculty && d.assignedFaculty.toLowerCase().includes(q)) ||
      d.assignedStudents.some((s) => s.name.toLowerCase().includes(q) || s.department_id.toLowerCase().includes(q));

    const matchesType = typeFilter === 'All' || d.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDutyIds(filteredDuties.map((d) => d.id));
    } else {
      setSelectedDutyIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedDutyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedDutyIds.length} selected duty slots?`)) {
      selectedDutyIds.forEach((id) => onDeleteDuty(id));
      setSelectedDutyIds([]);
    }
  };

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
    <div className="space-y-4 text-left">
      {/* Search & Filter Toolbar */}
      <div className="card-enterprise p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Select All Checkbox */}
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer pr-2 border-r border-slate-200">
            <input
              type="checkbox"
              checked={filteredDuties.length > 0 && selectedDutyIds.length === filteredDuties.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>Select All ({filteredDuties.length})</span>
          </label>

          {/* Duty Type Filter Tabs */}
          {['All', 'LabDuty', 'ExamDuty', 'GeneralDuty'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'All' ? 'All Types' : t === 'LabDuty' ? 'Lab Duty' : t === 'ExamDuty' ? 'Exam Duty' : 'General Duty'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search duty title, room, day or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-900 text-xs rounded-md py-2 pl-9 pr-3 border border-slate-300 focus:border-blue-600 outline-none"
          />
        </div>
      </div>

      {/* Batch Actions Bar */}
      {selectedDutyIds.length > 0 && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between text-xs animate-fadeIn">
          <span className="font-bold">
            {selectedDutyIds.length} Duty Slots Selected
          </span>
          <Button
            variant="outline"
            onClick={handleBatchDelete}
            className="!py-1 !px-2.5 text-xs text-red-700 border-red-300 hover:bg-red-50 gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected ({selectedDutyIds.length})</span>
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredDuties.length === 0 ? (
        <div className="card-enterprise p-8 text-center text-slate-500 space-y-2">
          <p className="text-sm font-medium">No matching duty slots found.</p>
          <p className="text-xs">Try adjusting your search query or filter settings.</p>
        </div>
      ) : (
        /* Duty Slots Cards Grid with Selection Checkboxes */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDuties.map((duty) => {
            const isFull = duty.assignedStudents.length >= duty.maxStudents;
            const isSelected = selectedDutyIds.includes(duty.id);

            return (
              <div
                key={duty.id}
                className={`card-enterprise p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20' : ''
                }`}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(duty.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`px-2.5 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${getBadgeStyle(duty.type)}`}>
                        {duty.type === 'LabDuty' ? 'Lab Duty' : duty.type === 'ExamDuty' ? 'Exam Duty' : 'General Duty'}
                      </span>
                    </div>

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
      )}
    </div>
  );
};
