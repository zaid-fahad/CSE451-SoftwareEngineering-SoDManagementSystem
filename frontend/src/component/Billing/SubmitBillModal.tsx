import React, { useState } from 'react';
import { X, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { BillSubmitPayload } from '../../model/billing';
import { useDuties } from '../../services/useDuties';

interface SubmitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitBill: (payload: BillSubmitPayload) => Promise<any>;
}

export const SubmitBillModal: React.FC<SubmitBillModalProps> = ({
  isOpen,
  onClose,
  onSubmitBill,
}) => {
  const { duties } = useDuties();
  const [month, setMonth] = useState<string>('July 2026');
  const [hours, setHours] = useState<number>(20);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (hours <= 0) {
      setError('Please enter a valid number of completed duty hours.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitBill({
        month,
        hoursCompleted: hours,
      });

      onClose();
      setHours(20);
    } catch {
      setError('Failed to submit bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden text-left animate-fadeIn">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Submit Monthly Duty Bill</h3>
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
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Month Selection Chips */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 uppercase tracking-wider block">
              Billing Month
            </label>
            <div className="flex flex-wrap gap-2">
              {['July 2026', 'August 2026', 'September 2026'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonth(m)}
                  className={`px-3 py-1.5 rounded-md border font-semibold cursor-pointer transition-all ${
                    month === m
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Duty Slots Breakdown */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 uppercase tracking-wider block">
              Associated Assigned Student Duty Slots
            </label>
            <div className="space-y-1.5 p-3 rounded-lg border border-slate-200 bg-slate-50 max-h-36 overflow-y-auto">
              {duties.slice(0, 3).map((d) => (
                <div key={d.id} className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{d.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">📍 {d.location} ({d.day})</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold font-mono">
                    {d.startTime} - {d.endTime}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Input
            label="Total Completed Duty Hours"
            type="number"
            min={1}
            max={100}
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value, 10) || 0)}
            helperText={`Calculated payout: $${(hours * 15).toFixed(2)} ($15.00/hr rate)`}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="!py-2 !px-3 text-xs">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="!py-2 !px-4 text-xs">
              Submit Bill for Verification
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
