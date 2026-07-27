import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Tag, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { DutyCreateRequest } from '../../model/duty';
import { DAYS, HOURS } from '../../services/useSchedule';
import { User } from '../../model/user';

interface CreateDutyModalProps {
  isOpen: boolean;
  students: User[];
  onClose: () => void;
  onCreate: (data: DutyCreateRequest) => Promise<any>;
}

export const CreateDutyModal: React.FC<CreateDutyModalProps> = ({ isOpen, students, onClose, onCreate }) => {
  const [formData, setFormData] = useState<DutyCreateRequest>({
    title: '',
    location: '',
    day: 'Monday',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    type: 'LabDuty',
    maxStudents: 2,
    assignedStudentId: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxStudents' ? parseInt(value, 10) || 1 : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.location.trim()) {
      setError('Please provide a title and location for the duty slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(formData);
      onClose();
      setFormData({
        title: '',
        location: '',
        day: 'Monday',
        startTime: '09:00 AM',
        endTime: '11:00 AM',
        type: 'LabDuty',
        maxStudents: 2,
        assignedStudentId: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create duty slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-lg overflow-hidden text-left animate-fadeIn">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Create Duty Slot</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Duty Title"
            name="title"
            placeholder="e.g. Software Engineering Lab Duty"
            value={formData.title}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Location / Room"
              name="location"
              placeholder="e.g. Lab Room 302"
              icon={MapPin}
              value={formData.location}
              onChange={handleChange}
            />

            <div className="flex flex-col space-y-1.5 w-full text-left">
              <label htmlFor="type" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Duty Type
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <Tag className="w-4 h-4" />
                </div>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-white text-slate-900 text-sm rounded-md py-2.5 pl-9 pr-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"
                >
                  <option value="LabDuty">Lab Duty</option>
                  <option value="ExamDuty">Exam Duty</option>
                  <option value="GeneralDuty">General Duty</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="flex flex-col space-y-1.5 w-full text-left">
              <label htmlFor="day" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Day of Week
              </label>
              <select
                id="day"
                name="day"
                value={formData.day}
                onChange={handleChange}
                className="w-full bg-white text-slate-900 text-sm rounded-md py-2.5 px-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col space-y-1.5 w-full text-left">
              <label htmlFor="startTime" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Start Time
              </label>
              <select
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full bg-white text-slate-900 text-sm rounded-md py-2.5 px-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col space-y-1.5 w-full text-left">
              <label htmlFor="endTime" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                End Time
              </label>
              <select
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full bg-white text-slate-900 text-sm rounded-md py-2.5 px-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Max Capacity"
              type="number"
              min={1}
              max={10}
              name="maxStudents"
              icon={Users}
              value={formData.maxStudents}
              onChange={handleChange}
            />

            <div className="flex flex-col space-y-1.5 w-full text-left col-span-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Initial Student Assignment (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 border border-slate-200 rounded">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, assignedStudentId: '' }))}
                  className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer border transition-colors ${
                    !formData.assignedStudentId
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  None
                </button>
                {students.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, assignedStudentId: st.id }))}
                    className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer border transition-colors ${
                      formData.assignedStudentId === st.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {st.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="!py-2 !px-3 text-xs">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="!py-2 !px-4 text-xs">
              Create Duty Slot
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
