import React, { useState } from 'react';
import { useAuth } from '../services/useAuth';
import { useBilling } from '../services/useBilling';
import { BillApprovalList } from '../component/Billing/BillApprovalList';
import { FileSpreadsheet, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AdminBilling: React.FC = () => {
  const { user } = useAuth();
  const { bills, verifyByFaculty, approveByManager, disputeBill } = useBilling();

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const totalSubmitted = bills.filter((b) => b.state === 'Submitted').length;
  const totalVerified = bills.filter((b) => b.state === 'Faculty_Verified').length;
  const totalApprovedPayout = bills
    .filter((b) => b.state === 'Manager_Approved')
    .reduce((sum, b) => sum + b.totalPayout, 0);

  const handleFacultyVerify = (billId: string) => {
    verifyByFaculty(billId, `${user?.name || 'Dr. Faculty'} (Faculty)`);
    setToastMsg('Bill entry verified by Faculty. Sent to Department Manager for financial release.');
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleManagerApprove = (billId: string) => {
    approveByManager(billId, `${user?.name || 'Prof. Manager'} (Dept Manager)`);
    setToastMsg('Financial payout approved and released by Department Manager!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDispute = (billId: string) => {
    const reason = prompt('Enter reason for disputing this bill entry:', 'Unverified hours log');
    if (reason) {
      disputeBill(billId, reason);
      setToastMsg('Bill entry flagged as Disputed.');
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3 shadow-xs animate-fadeIn text-left">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Pipeline Summary Toolbar */}
      <div className="card-enterprise p-6 space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Multi-Stage Bill Approval Pipeline</h1>
              <p className="text-xs text-slate-500 mt-0.5">Faculty verification stage &bull; Department Manager financial release stage</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Active Role: {user?.role}</span>
            </span>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 rounded-md bg-blue-50/60 border border-blue-200 text-xs flex items-center justify-between">
            <span className="text-slate-600 font-medium">Pending Faculty Review</span>
            <span className="font-bold text-blue-800 text-sm">{totalSubmitted} Bills</span>
          </div>
          <div className="p-3 rounded-md bg-purple-50/60 border border-purple-200 text-xs flex items-center justify-between">
            <span className="text-slate-600 font-medium">Pending Manager Release</span>
            <span className="font-bold text-purple-800 text-sm">{totalVerified} Bills</span>
          </div>
          <div className="p-3 rounded-md bg-emerald-50/60 border border-emerald-200 text-xs flex items-center justify-between">
            <span className="text-slate-600 font-medium">Total Payout Released</span>
            <span className="font-bold text-emerald-800 text-sm">${totalApprovedPayout.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Bill Approval Table Component */}
      <BillApprovalList
        bills={bills}
        currentUser={user}
        onFacultyVerify={handleFacultyVerify}
        onManagerApprove={handleManagerApprove}
        onDispute={handleDispute}
      />
    </div>
  );
};
