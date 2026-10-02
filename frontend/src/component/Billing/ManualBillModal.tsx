import React, { useState } from 'react';
import { X, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { User } from '../../model/user';

interface ManualBillModalProps {
  isOpen: boolean;
  students: User[];
  currentSemester?: string;
  onClose: () => void;
  onCreateManualBill: (payload: {
    studentId: string;
    month: string;
    weekNumber?: number;
    hoursCompleted: number;
    hourlyRate?: number;
    semester?: string;
  }) => Promise<void>;
}

export const ManualBillModal: React.FC<ManualBillModalProps> = ({
  isOpen,
  students,
  currentSemester,
  onClose,
  onCreateManualBill,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.length > 0 ? String(students[0].id) : ''
  );
  const [month, setMonth] = useState<string>('September 2026');
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [hours, setHours] = useState<number>(8);
  const [hourlyRate, setHourlyRate] = useState<number>(150);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => String(s.id) === String(selectedStudentId)) || students[0];
  const weeklyLimit = currentStudent?.weekly_hours_limit ?? 10.0;
  const isOverLimit = hours > weeklyLimit;
  const totalPayout = hours * hourlyRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedStudentId) {
      setError('Please select a student worker.');
      return;
    }

    if (hours <= 0) {
      setError('Please enter a positive number of duty hours.');
      return;
    }

    if (isOverLimit) {
      setError(`Logged hours (${hours} hrs) exceeds student's weekly duty limit (${weeklyLimit} hrs).`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateManualBill({
        studentId: selectedStudentId,
        month,
        weekNumber,
        hoursCompleted: hours,
        hourlyRate,
        semester: currentSemester,
      });
      onClose();
      setHours(8);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create manual bill.');
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
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create Manual Billing Claim</h3>
              <p className="text-[11px] text-slate-500">Record off-cycle or direct student supervisor duty hours</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Selector */}
          <div className="space-y-1.5">
            <label htmlFor="studentSelect" className="font-semibold text-slate-700 uppercase tracking-wider block">
              Student Worker
            </label>
            <select
              id="studentSelect"
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setError(null);
              }}
              className="w-full bg-white text-slate-900 text-xs rounded-md py-2.5 px-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.department_id}) — Weekly Limit: {s.weekly_hours_limit ?? 10.0}h
                </option>
              ))}
            </select>
          </div>

          {/* Period & Week Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="monthInput" className="font-semibold text-slate-700 uppercase tracking-wider block">
                Billing Month / Period
              </label>
              <input
                id="monthInput"
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="e.g. September 2026"
                className="w-full bg-white text-slate-900 text-xs rounded-md py-2 px-3 border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="weekSelect" className="font-semibold text-slate-700 uppercase tracking-wider block">
                Target Week Number
              </label>
              <select
                id="weekSelect"
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value, 10))}
                className="w-full bg-white text-slate-900 text-xs rounded-md py-2 px-3 border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5].map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hours Logged & Hourly Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="hoursInput" className="font-semibold text-slate-700 uppercase tracking-wider block">
                  Logged Duty Hours
                </label>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isOverLimit ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Limit: {weeklyLimit}h
                </span>
              </div>
              <input
                id="hoursInput"
                type="number"
                step="0.5"
                min="0.5"
                max="40"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                className={`w-full bg-white text-slate-900 text-xs rounded-md py-2 px-3 border outline-none ${
                  isOverLimit
                    ? 'border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              {isOverLimit && (
                <p className="text-[10px] text-rose-600 font-semibold">
                  Exceeds student's assigned {weeklyLimit}h weekly duty limit!
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rateInput" className="font-semibold text-slate-700 uppercase tracking-wider block">
                Hourly Rate (৳ / hr)
              </label>
              <input
                id="rateInput"
                type="number"
                min="50"
                max="1000"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-white text-slate-900 text-xs rounded-md py-2 px-3 border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Total Calculation Card */}
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <span className="font-semibold text-emerald-900">Total Calculated Payout:</span>
            <span className="text-base font-extrabold text-emerald-800 font-mono">
              ৳{totalPayout.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="!py-2 !px-3 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isOverLimit || hours <= 0}
              className="!py-2 !px-4 text-xs !bg-emerald-600 hover:!bg-emerald-700"
            >
              Create & Approve Bill
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
