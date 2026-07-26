import React from 'react';
import { BillItem, BillState } from '../../model/billing';
import { User } from '../../model/user';
import { CheckCircle2, ShieldCheck, AlertCircle, DollarSign, Clock } from 'lucide-react';
import { Button } from '../UI/Button';

interface BillApprovalListProps {
  bills: BillItem[];
  currentUser: User | null;
  onFacultyVerify: (billId: string) => void;
  onManagerApprove: (billId: string) => void;
  onDispute: (billId: string) => void;
}

export const BillApprovalList: React.FC<BillApprovalListProps> = ({
  bills,
  currentUser,
  onFacultyVerify,
  onManagerApprove,
  onDispute,
}) => {
  const isFaculty = currentUser?.role === 'Faculty' || currentUser?.role === 'DeptManager';
  const isManager = currentUser?.role === 'DeptManager';

  const getStateBadge = (state: BillState) => {
    switch (state) {
      case 'Submitted':
        return <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[10px] uppercase">Submitted</span>;
      case 'Faculty_Verified':
        return <span className="px-2.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 font-bold text-[10px] uppercase">Faculty Verified</span>;
      case 'Manager_Approved':
        return <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px] uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Released</span>;
      case 'Disputed':
        return <span className="px-2.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px] uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3 text-rose-600" /> Disputed</span>;
    }
  };

  return (
    <div className="card-enterprise overflow-x-auto text-left">
      <table className="w-full text-xs text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
            <th className="p-3.5 border-r border-slate-200">Student Info</th>
            <th className="p-3.5 border-r border-slate-200 text-center">Month</th>
            <th className="p-3.5 border-r border-slate-200 text-center">Duty Hours</th>
            <th className="p-3.5 border-r border-slate-200 text-center">Payout Amount</th>
            <th className="p-3.5 border-r border-slate-200 text-center">Pipeline State</th>
            <th className="p-3.5 text-center">Approval Action</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => {
            const canFacultyVerify = isFaculty && bill.state === 'Submitted';
            const canManagerApprove = isManager && bill.state === 'Faculty_Verified';

            return (
              <tr key={bill.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/80 transition-colors">
                
                {/* Student Info */}
                <td className="p-3.5 border-r border-slate-200">
                  <div className="font-bold text-slate-900">{bill.studentName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">Dept ID: {bill.departmentId}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Submitted {bill.submittedAt}</div>
                  <div className="mt-1.5 p-1.5 rounded bg-blue-50/70 border border-blue-200 text-[10px] space-y-0.5">
                    <span className="font-bold text-blue-900 block uppercase">Associated Duty Slots:</span>
                    <div className="text-slate-700 font-medium">📍 CS101 Lab Supervision (Room 302 - Mon 08:00 AM)</div>
                    <div className="text-slate-700 font-medium">📍 CS202 Exam Proctoring (Auditorium B - Wed 10:00 AM)</div>
                  </div>
                </td>

                {/* Month */}
                <td className="p-3.5 border-r border-slate-200 text-center font-medium text-slate-800">
                  {bill.month}
                </td>

                {/* Hours */}
                <td className="p-3.5 border-r border-slate-200 text-center">
                  <div className="font-bold text-slate-900 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{bill.hoursCompleted} hrs</span>
                  </div>
                  <div className="text-[10px] text-slate-500">@ ${bill.hourlyRate.toFixed(2)}/hr</div>
                </td>

                {/* Payout */}
                <td className="p-3.5 border-r border-slate-200 text-center font-bold text-slate-900 text-sm">
                  <span className="text-emerald-700 flex items-center justify-center gap-0.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>{bill.totalPayout.toFixed(2)}</span>
                  </span>
                </td>

                {/* State Badge */}
                <td className="p-3.5 border-r border-slate-200 text-center">
                  <div className="space-y-1">
                    {getStateBadge(bill.state)}
                    {bill.verifiedByFaculty && (
                      <div className="text-[9px] text-slate-500">{bill.verifiedByFaculty}</div>
                    )}
                    {bill.approvedByManager && (
                      <div className="text-[9px] text-emerald-700 font-medium">{bill.approvedByManager}</div>
                    )}
                    {bill.disputeReason && (
                      <div className="text-[9px] text-rose-600 font-medium">{bill.disputeReason}</div>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="p-3.5 text-center">
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
                        className="!py-1 !px-2.5 text-[11px] gap-1 !bg-emerald-600 hover:!bg-emerald-700"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Release Payout</span>
                      </Button>
                    )}

                    {bill.state !== 'Manager_Approved' && bill.state !== 'Disputed' && (
                      <button
                        onClick={() => onDispute(bill.id)}
                        className="text-[10px] text-slate-400 hover:text-red-600 underline cursor-pointer"
                      >
                        Flag Dispute
                      </button>
                    )}

                    {bill.state === 'Manager_Approved' && (
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Paid Out</span>
                    )}
                  </div>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
