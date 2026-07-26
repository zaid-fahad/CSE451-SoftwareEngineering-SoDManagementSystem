import React, { useState } from 'react';
import { DutySlot } from '../../model/duty';
import { MapPin, Clock, Users, UserPlus, Trash2, CheckCircle2, GraduationCap, Search, LayoutGrid, Table } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
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

        <div className="flex items-center gap-3">
          {/* View Mode Toggle Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search duty, room or student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs rounded-md py-2 pl-9 pr-3 border border-slate-300 focus:border-blue-600 outline-none"
            />
          </div>
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
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDuties.map((duty) => {
            const isFull = duty.assignedStudents.length >= duty.maxStudents;
            const isSelected = selectedDutyIds.includes(duty.id);
            const fillPct = Math.round((duty.assignedStudents.length / duty.maxStudents) * 100);

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

                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Capacity Completion:</span>
                    <span className="font-bold text-slate-800 font-mono">{duty.assignedStudents.length}/{duty.maxStudents} ({fillPct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${isFull ? 'bg-emerald-600' : fillPct > 0 ? 'bg-blue-600' : 'bg-slate-300'}`}
                      style={{ width: `${fillPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Assigned Students Section */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Assigned Students</span>
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
      ) : (
        /* Enterprise Table View */
        <div className="card-enterprise p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="p-3 border-r border-slate-200 w-10 text-center">Select</th>
                  <th className="p-3 border-r border-slate-200">Duty Slot Title</th>
                  <th className="p-3 border-r border-slate-200">Type & Room</th>
                  <th className="p-3 border-r border-slate-200">Day & Time Window</th>
                  <th className="p-3 border-r border-slate-200 text-center">Assigned Students</th>
                  <th className="p-3 border-r border-slate-200">Supervising Faculty</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDuties.map((duty) => {
                  const isSelected = selectedDutyIds.includes(duty.id);
                  const isFull = duty.assignedStudents.length >= duty.maxStudents;

                  return (
                    <tr key={duty.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors">
                      <td className="p-3 border-r border-slate-200 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(duty.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-3 border-r border-slate-200 font-bold text-slate-900 text-sm">
                        {duty.title}
                      </td>

                      <td className="p-3 border-r border-slate-200 space-y-1">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold block w-fit uppercase ${getBadgeStyle(duty.type)}`}>
                          {duty.type === 'LabDuty' ? 'Lab Duty' : duty.type === 'ExamDuty' ? 'Exam Duty' : 'General Duty'}
                        </span>
                        <div className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{duty.location}</span>
                        </div>
                      </td>

                      <td className="p-3 border-r border-slate-200 font-medium text-slate-700">
                        <div className="font-bold text-slate-900">{duty.day}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{duty.startTime} - {duty.endTime}</div>
                      </td>

                      <td className="p-3 border-r border-slate-200 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${isFull ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                          {duty.assignedStudents.length} / {duty.maxStudents}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[150px]">
                          {duty.assignedStudents.map((s) => s.name).join(', ') || 'None'}
                        </div>
                      </td>

                      <td className="p-3 border-r border-slate-200 text-slate-700">
                        {duty.assignedFaculty ? (
                          <span className="text-purple-800 font-medium text-[11px] flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                            {duty.assignedFaculty}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unassigned</span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => onOpenAssignModal(duty)}
                            disabled={isFull}
                            className="!py-1 !px-2 text-xs"
                          >
                            <span>Assign</span>
                          </Button>
                          <button
                            onClick={() => onDeleteDuty(duty.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded cursor-pointer"
                            title="Delete Duty Slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
