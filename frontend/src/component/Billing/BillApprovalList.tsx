import React from 'react';
import { BillItem, BillState } from '../../model/billing';
import { User } from '../../model/user';
import { CheckCircle2, ShieldCheck, AlertCircle, DollarSign, Clock } from 'lucide-react';
import { Button } from '../UI/Button';
import { DataTable, ColumnDef } from '../UI/DataTable';

interface BillApprovalListProps {
  bills: BillItem[];
  currentUser: User | null;
  onFacultyVerify: (billId: string) => void;
  onManagerApprove: (billId: string) => void;
  onDirectPayout?: (billId: string) => void;
  onDispute: (billId: string) => void;
  isReadOnly?: boolean;
}

export const BillApprovalList: React.FC<BillApprovalListProps> = ({
  bills,
  currentUser,
  onFacultyVerify,
  onManagerApprove,
  onDirectPayout,
  onDispute,
  isReadOnly = false,
}) => {
  const isFaculty = !isReadOnly && (currentUser?.role === 'Faculty' || currentUser?.role === 'DeptManager');
  const isManager = currentUser?.role === 'DeptManager';

  const getStateStepIndex = (state: BillState) => {
    switch (state) {
      case 'Submitted': return 1;
      case 'Faculty_Verified': return 2;
      case 'Manager_Approved': return 3;
      case 'Paid': return 4;
      default: return 0;
    }
  };

  const getStateBadge = (state: BillState) => {
    switch (state) {
      case 'Submitted':
        return <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[10px] uppercase">1. Submitted</span>;
      case 'Faculty_Verified':
        return <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 font-bold text-[10px] uppercase">2. Verified</span>;
      case 'Manager_Approved':
        return <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px] uppercase">3. Approved</span>;
      case 'Paid':
        return <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px] uppercase flex items-center gap-1 justify-center"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> 4. Paid</span>;
      case 'Disputed':
        return <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px] uppercase flex items-center gap-1 justify-center"><AlertCircle className="w-3 h-3 text-rose-600" /> Disputed</span>;
    }
  };

  const billColumns: ColumnDef<BillItem>[] = [
    {
      key: 'student',
      header: 'Student Info',
      sortable: true,
      accessor: (bill) => bill.studentName,
      render: (bill) => (
        <div>
          <div className="font-bold text-slate-900">{bill.studentName}</div>
          <div className="text-[11px] text-slate-500 font-mono">Dept ID: {bill.departmentId}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Submitted {bill.submittedAt}</div>
          <div className="mt-1.5 p-1.5 rounded bg-blue-50/70 border border-blue-200 text-[10px] space-y-0.5">
            <span className="font-bold text-blue-900 block uppercase">Associated Duty Slots:</span>
            <div className="text-slate-700 font-medium">📍 CS101 Lab Supervision (Room 302 - Mon 08:00 AM)</div>
            <div className="text-slate-700 font-medium">📍 CS202 Exam Proctoring (Auditorium B - Wed 10:00 AM)</div>
          </div>
        </div>
      ),
    },
    {
      key: 'month',
      header: 'Period',
      sortable: true,
      align: 'center',
      accessor: (bill) => bill.month,
      render: (bill) => (
        <div>
          <span className="font-semibold text-slate-800 block">{bill.month}</span>
          {bill.weekNumber && (
            <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
              Week {bill.weekNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'hours',
      header: 'Duty Hours',
      sortable: true,
      align: 'center',
      accessor: (bill) => bill.hoursCompleted,
      render: (bill) => (
        <div>
          <div className="font-bold text-slate-900 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{bill.hoursCompleted} hrs</span>
          </div>
          <div className="text-[10px] text-slate-500">@ ৳{bill.hourlyRate.toFixed(2)}/hr</div>
        </div>
      ),
    },
    {
      key: 'payout',
      header: 'Payout Amount',
      sortable: true,
      align: 'center',
      accessor: (bill) => bill.totalPayout,
      render: (bill) => (
        <span className="text-emerald-700 font-bold text-sm flex items-center justify-center gap-0.5">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>{bill.totalPayout.toFixed(2)}</span>
        </span>
      ),
    },
    {
      key: 'state',
      header: 'Lifecycle & Audit Trail',
      sortable: true,
      align: 'center',
      accessor: (bill) => bill.state,
      render: (bill) => {
        const step = getStateStepIndex(bill.state);
        return (
          <div className="space-y-2 min-w-[160px] text-left">
            <div className="flex items-center justify-between">
              {getStateBadge(bill.state)}
              <span className="text-[9px] font-mono text-slate-400">Step {step}/4</span>
            </div>

            {/* Visual Stepper */}
            {bill.state !== 'Disputed' && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                <div className={`h-full ${step >= 1 ? 'bg-blue-500' : 'bg-transparent'} w-1/4`} />
                <div className={`h-full ${step >= 2 ? 'bg-purple-500' : 'bg-transparent'} w-1/4`} />
                <div className={`h-full ${step >= 3 ? 'bg-amber-500' : 'bg-transparent'} w-1/4`} />
                <div className={`h-full ${step >= 4 ? 'bg-emerald-500' : 'bg-transparent'} w-1/4`} />
              </div>
            )}

            {/* Audit Stamps */}
            <div className="space-y-0.5 text-[9px] text-slate-500">
              {bill.verifiedByFaculty && (
                <div className="text-purple-700 font-medium">✓ {bill.verifiedByFaculty}</div>
              )}
              {bill.approvedByManager && (
                <div className="text-amber-700 font-medium">✓ {bill.approvedByManager}</div>
              )}
              {bill.paidBy && (
                <div className="text-emerald-700 font-bold">✓ Disbursed by {bill.paidBy}</div>
              )}
              {bill.disputeReason && (
                <div className="text-rose-600 font-bold bg-rose-50 p-1 rounded border border-rose-200">
                  Dispute: {bill.disputeReason}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Approval Action',
      align: 'center',
      render: (bill) => {
        const canFacultyVerify = isFaculty && bill.state === 'Submitted';
        const canManagerApprove = isManager && bill.state === 'Faculty_Verified';
        const canDirectPayout = isManager && bill.state !== 'Paid' && bill.state !== 'Disputed';

        return (
          <div className="flex flex-col items-center justify-center gap-1.5">
            {canFacultyVerify && (
              <Button
                variant="primary"
                onClick={() => onFacultyVerify(bill.id)}
                className="!py-1 !px-2.5 text-[11px] gap-1"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Verify (Faculty)</span>
              </Button>
            )}

            {canManagerApprove && (
              <Button
                variant="primary"
                onClick={() => onManagerApprove(bill.id)}
                className="!py-1 !px-2.5 text-[11px] gap-1 !bg-amber-600 hover:!bg-amber-700"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Approve Payout</span>
              </Button>
            )}

            {canDirectPayout && onDirectPayout && (
              <Button
                variant="primary"
                onClick={() => onDirectPayout(bill.id)}
                className="!py-1 !px-2 text-[10px] gap-1 !bg-emerald-600 hover:!bg-emerald-700 font-bold"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Direct Payout</span>
              </Button>
            )}

            {!isReadOnly && bill.state !== 'Paid' && bill.state !== 'Disputed' && (
              <button
                onClick={() => onDispute(bill.id)}
                className="text-[10px] text-slate-400 hover:text-red-600 underline cursor-pointer"
              >
                Flag Dispute
              </button>
            )}

            {bill.state === 'Paid' && (
              <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Disbursed
              </span>
            )}

            {isReadOnly && bill.state !== 'Paid' && (
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Archived (Read-Only)
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable<BillItem>
      title="Billing Claims"
      icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
      data={bills}
      columns={billColumns}
      rowKey={(b) => b.id}
      searchPlaceholder="Search student assistant, ID, month..."
      searchFilter={(b, q) =>
        b.studentName.toLowerCase().includes(q) ||
        b.departmentId.toLowerCase().includes(q) ||
        b.month.toLowerCase().includes(q) ||
        b.state.toLowerCase().includes(q)
      }
      emptyTitle="No submitted billing claims found"
      emptyDescription="Submitted monthly billing timesheets will appear here for verification and release."
      initialSortKey="month"
      initialPageSize={10}
      wrapInCard={true}
    />
  );
};
