import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { useAttendance } from '../services/useAttendance';
import { Button } from '../component/UI/Button';
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Calendar,
  ArrowLeft,
  CheckSquare,
  Square,
  Send,
  Award
} from 'lucide-react';

export const StudentBillSubmitPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { attendanceRecords } = useAttendance();

  const [hourlyRate] = useState<number>(500);
  const [selectedDutyIds, setSelectedDutyIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mock submitted claims history for student view
  const [submittedClaims, setSubmittedClaims] = useState<any[]>([
    {
      id: 'CLAIM-101',
      month: 'July 2026',
      totalHours: 14.5,
      totalAmount: 7250,
      status: 'Approved',
      submittedAt: '2026-07-20',
      notes: 'Completed CENLAB3 lab supervision shifts.',
    },
  ]);

  // Filter completed duty records for this student assistant
  const userRecords = attendanceRecords.filter(
    (rec) => rec.status !== 'Absent'
  );

  const toggleDutySelection = (id: string) => {
    if (selectedDutyIds.includes(id)) {
      setSelectedDutyIds(selectedDutyIds.filter((dId) => dId !== id));
    } else {
      setSelectedDutyIds([...selectedDutyIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedDutyIds.length === userRecords.length) {
      setSelectedDutyIds([]);
    } else {
      setSelectedDutyIds(userRecords.map((r) => r.id));
    }
  };

  // Calculate totals
  const selectedRecords = userRecords.filter((r) => selectedDutyIds.includes(r.id));
  const totalSelectedHours = selectedRecords.reduce((acc, r) => acc + (r.hoursCompleted || 2), 0);
  const totalGrossAmount = totalSelectedHours * hourlyRate;

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDutyIds.length === 0) {
      setErrorMessage('Please select at least one completed duty shift to submit for billing.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const newClaim = {
        id: `CLAIM-${Math.floor(100 + Math.random() * 900)}`,
        month: 'Current Cycle (July 2026)',
        totalHours: totalSelectedHours,
        totalAmount: totalGrossAmount,
        status: 'Submitted',
        submittedAt: new Date().toISOString().split('T')[0],
        notes: notes || 'Submitted via Student Billing Claim Portal',
      };

      setSubmittedClaims([newClaim, ...submittedClaims]);
      setSubmitSuccess(
        `SUCCESS! Monthly Bill Claim ${newClaim.id} for ৳${totalGrossAmount.toLocaleString()} (${totalSelectedHours} hrs) submitted successfully to Department Manager.`
      );
      setSelectedDutyIds([]);
      setNotes('');
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="space-y-6 text-left pb-8 animate-fadeIn">
      {/* Toast Feedback */}
      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{submitSuccess}</span>
          </div>
          <button type="button" onClick={() => setSubmitSuccess(null)} className="text-slate-400 hover:text-slate-600 text-base">
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-slate-400 hover:text-slate-600 text-base">
            ×
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              <span>Student Payroll Bill Submission Portal</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 pl-8">
            Welcome, {user?.name || 'Student Assistant'}. Select completed shift duties, verify gross pay calculations, and submit monthly billing claims to department managers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            Rate: ৳{hourlyRate} / Hour
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Completed Shift Selection Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-enterprise p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Verified Completed Duty Shifts (Select to Bill)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check the shifts you wish to include in this month's payroll claim.
                </p>
              </div>

              <button
                type="button"
                onClick={selectAll}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                {selectedDutyIds.length === userRecords.length ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-emerald-600" /> Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-slate-400" /> Select All ({userRecords.length})
                  </>
                )}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3 w-10 text-center">Select</th>
                    <th className="p-3 border-r border-slate-200">Date & Duty Slot</th>
                    <th className="p-3 border-r border-slate-200">Verified Shift Hours</th>
                    <th className="p-3 border-r border-slate-200 text-center">Status</th>
                    <th className="p-3 text-right">Calculated Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userRecords.map((rec) => {
                    const isSelected = selectedDutyIds.includes(rec.id);
                    const hours = rec.hoursCompleted || 2;
                    const amount = hours * hourlyRate;

                    return (
                      <tr
                        key={rec.id}
                        onClick={() => toggleDutySelection(rec.id)}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'bg-emerald-50/60 font-medium' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 border-r border-slate-100">
                          <div className="font-bold text-slate-900">{rec.dutyTitle}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{rec.date} ({rec.checkInTime || '11:20'} - {rec.checkOutTime || '12:50'})</span>
                          </div>
                        </td>
                        <td className="p-3 border-r border-slate-100 font-bold text-slate-800">
                          {hours} hrs
                        </td>
                        <td className="p-3 border-r border-slate-100 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {rec.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700 text-sm">
                          ৳{amount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}

                  {userRecords.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                        No completed duty shift records available for billing.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Claim Summary & Submission Form */}
        <div className="space-y-4">
          <form onSubmit={handleSubmitClaim} className="card-enterprise p-6 space-y-5 bg-gradient-to-b from-white to-slate-50">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Claim Calculation Summary</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Selected Shifts Count:</span>
                <span className="font-bold text-slate-900">{selectedRecords.length} Shifts</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Verified Hours:</span>
                <span className="font-bold text-slate-900">{totalSelectedHours} Hours</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Hourly Rate Standard:</span>
                <span className="font-mono font-bold text-slate-900">৳{hourlyRate} / hr</span>
              </div>

              <div className="flex justify-between py-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 font-bold text-sm">
                <span>Total Billing Claim:</span>
                <span className="font-mono text-base text-emerald-700">৳{totalGrossAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Verification Notes / Supervisor Ref
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes or supervisor sign-off reference..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 bg-white"
              />
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 text-xs gap-2 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Submit Official Payroll Bill Claim</span>
            </Button>
          </form>

          {/* Past Submitted Claims Table */}
          <div className="card-enterprise p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Previous Billing Claims History
            </h3>
            <div className="space-y-2">
              {submittedClaims.map((claim) => (
                <div key={claim.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{claim.id} ({claim.month})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800">
                      {claim.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span>{claim.totalHours} hrs • Submitted {claim.submittedAt}</span>
                    <span className="font-mono font-bold text-emerald-700">৳{claim.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
