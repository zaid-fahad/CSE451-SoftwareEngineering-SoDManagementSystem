import React, { useState } from 'react';
import { X, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { BillSubmitPayload } from '../../model/billing';

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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col space-y-1.5 w-full text-left">
            <label htmlFor="monthSelect" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Billing Month
            </label>
            <select
              id="monthSelect"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs rounded-md p-2.5 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
            >
              <option value="July 2026">July 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="September 2026">September 2026</option>
            </select>
          </div>

          <Input
            label="Total Completed Duty Hours"
            type="number"
            min={1}
            max={100}
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value, 10) || 0)}
            helperText={`Calculated payout: $${(hours * 15).toFixed(2)} ($15.00/hr)`}
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
