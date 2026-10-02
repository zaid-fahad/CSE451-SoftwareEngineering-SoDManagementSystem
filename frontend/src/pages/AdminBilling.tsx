import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { useBilling } from '../services/useBilling';
import { useSemesters } from '../context/SemesterContext';
import { useDuties } from '../services/useDuties';
import { BillApprovalList } from '../component/Billing/BillApprovalList';
import { ManualBillModal } from '../component/Billing/ManualBillModal';
import { FileSpreadsheet, CheckCircle2, ShieldCheck, Filter, Archive, Plus } from 'lucide-react';

export const AdminBilling: React.FC = () => {
  const { user } = useAuth();
  const { semesters, activeSemester } = useSemesters();
  const [searchParams] = useSearchParams();
  const urlSemester = searchParams.get('semester');

  const [selectedSemester, setSelectedSemester] = useState<string>(urlSemester || '');

  useEffect(() => {
    if (urlSemester) {
      setSelectedSemester(urlSemester);
    } else if (activeSemester && !selectedSemester) {
      setSelectedSemester(activeSemester.name);
    } else if (!selectedSemester && semesters.length > 0) {
      setSelectedSemester(semesters[0].name);
    }
  }, [urlSemester, activeSemester, selectedSemester, semesters]);

  const {
    bills,
    createManualBill,
    verifyByFaculty,
    approveByManager,
    directPayout,
    disputeBill,
    exportPayrollCsv,
    refreshClaims,
  } = useBilling();
  const { students } = useDuties();

  useEffect(() => {
    if (selectedSemester) {
      refreshClaims(selectedSemester);
    }
  }, [selectedSemester, refreshClaims]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  const selectedSemObj = semesters.find((s) => s.name === selectedSemester);
  const isArchived = Boolean(selectedSemObj?.is_archived);
  const isDeptManager = user?.role === 'DeptManager';

  const totalSubmitted = bills.filter((b) => b.state === 'Submitted').length;
  const totalVerified = bills.filter((b) => b.state === 'Faculty_Verified').length;
  const totalApprovedPayout = bills
    .filter((b) => b.state === 'Manager_Approved' || b.state === 'Paid')
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

  const handleDirectPayout = async (billId: string) => {
    try {
      await directPayout(billId);
      setToastMsg('Direct fast-track payout released successfully!');
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Direct payout failed.');
    }
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

          <div className="flex flex-wrap items-center gap-2">
            {/* Semester Filter Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-600">Semester:</span>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="bg-transparent font-bold text-blue-700 outline-none cursor-pointer"
              >
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.name}>
                    {sem.name} {sem.is_archived ? '(Archived)' : sem.is_active ? '★ (Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <span className="px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Active Role: {user?.role}</span>
            </span>

            {(user?.role === 'Faculty' || user?.role === 'DeptManager') && (
              <button
                onClick={exportPayrollCsv}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border-0 outline-none"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Payroll CSV</span>
              </button>
            )}

            {(user?.role === 'DeptManager' || user?.role === 'LabManager') && (
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border-0 outline-none"
              >
                <Plus className="w-4 h-4" />
                <span>Create Manual Bill</span>
              </button>
            )}
          </div>
        </div>

        {/* Historical Archive Banner */}
        {isArchived && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Historical Billing & Payroll Archive (Read-Only):</strong> Academic semester <strong>'{selectedSemester}'</strong> has concluded and is archived. All student duty claims, review stages, and disbursements are archived records.
                {isDeptManager && ' DeptManager retains emergency override authority.'}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] shrink-0 uppercase tracking-wider">
              Archived Payroll
            </span>
          </div>
        )}

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
        onDirectPayout={handleDirectPayout}
        onDispute={handleDispute}
        isReadOnly={isArchived && !isDeptManager}
      />

      {/* Manual Bill Creation Modal */}
      <ManualBillModal
        isOpen={isManualModalOpen}
        students={students}
        currentSemester={selectedSemester}
        onClose={() => setIsManualModalOpen(false)}
        onCreateManualBill={async (payload) => {
          await createManualBill(payload);
          setToastMsg('Manual billing claim created and submitted successfully!');
          setTimeout(() => setToastMsg(null), 3500);
        }}
      />
    </div>
  );
};
