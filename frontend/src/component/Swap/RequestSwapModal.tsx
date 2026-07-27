import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { SwapCreatePayload } from '../../model/swap';
import { useDuties } from '../../services/useDuties';
import { useAuth } from '../../services/useAuth';

interface RequestSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSwap: (payload: SwapCreatePayload) => Promise<any>;
}

export const RequestSwapModal: React.FC<RequestSwapModalProps> = ({
  isOpen,
  onClose,
  onRequestSwap,
}) => {
  const { user } = useAuth();
  const { duties } = useDuties();

  const myAssignedDuties = duties.filter((d) =>
    d.assignedStudents.some((s) => String(s.id) === String(user?.id))
  );

  const [selectedDutyId, setSelectedDutyId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (myAssignedDuties.length > 0 && !selectedDutyId) {
      setSelectedDutyId(myAssignedDuties[0].id);
    }
  }, [myAssignedDuties, selectedDutyId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const targetDuty = myAssignedDuties.find((d) => d.id === selectedDutyId);
    if (!targetDuty) {
      setError('Please select one of your assigned duties to swap.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRequestSwap({
        originalDutyId: targetDuty.id,
        dutyTitle: targetDuty.title,
        location: targetDuty.location,
        day: targetDuty.day,
        time: `${targetDuty.startTime} - ${targetDuty.endTime}`,
        reason: reason.trim() || 'Schedule conflict trade request',
      });

      onClose();
      setReason('');
    } catch (err: any) {
      setError(err.message || 'Failed to broadcast shift swap request.');
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
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Request Shift Swap</h3>
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

          <div className="flex flex-col space-y-1.5 w-full text-left">
            <label htmlFor="dutySelect" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Select Assigned Duty to Trade
            </label>
            {myAssignedDuties.length === 0 ? (
              <p className="text-xs text-rose-600 font-medium p-2 border border-rose-100 bg-rose-50 rounded">
                You have no active duties assigned to request a swap for.
              </p>
            ) : (
              <select
                id="dutySelect"
                value={selectedDutyId}
                onChange={(e) => setSelectedDutyId(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs rounded-md p-2.5 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
              >
                {myAssignedDuties.map((duty) => (
                  <option key={duty.id} value={duty.id}>
                    {duty.title} ({duty.day} {duty.startTime})
                  </option>
                ))}
              </select>
            )}
          </div>

          <Input
            label="Reason / Note (Optional)"
            placeholder="e.g. Have an exam at the same hour"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={myAssignedDuties.length === 0}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="!py-2 !px-3 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={myAssignedDuties.length === 0}
              className="!py-2 !px-4 text-xs"
            >
              Broadcast Swap Request
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
