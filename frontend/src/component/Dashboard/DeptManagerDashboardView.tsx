import React from 'react';
import { Link } from 'react-router-dom';
import { DutySlot } from '../../model/duty';
import { User } from '../../model/user';
import { DutyList } from '../Duty/DutyList';
import { Button } from '../UI/Button';
import { ShieldCheck, FileSpreadsheet, DollarSign, ArrowRight } from 'lucide-react';

interface DeptManagerDashboardViewProps {
  user: User | null;
  duties: DutySlot[];
}

export const DeptManagerDashboardView: React.FC<DeptManagerDashboardViewProps> = ({ user, duties }) => {
  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>Department Manager Executive Portal &mdash; {user?.name}</span>
          </h1>
          <p className="text-xs text-slate-500">
            Executive overview of departmental duty capacity, faculty supervision, and financial payroll approval pipeline.
          </p>
        </div>

        <Link to="/admin/billing">
          <Button variant="primary" className="!py-2 !px-4 text-xs gap-1.5 self-start sm:self-auto !bg-emerald-600 hover:!bg-emerald-700">
            <DollarSign className="w-4 h-4" />
            <span>Approve Payout Release</span>
          </Button>
        </Link>
      </div>

      {/* Financial & Operational Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-enterprise p-5 space-y-1 bg-emerald-50/40 border-emerald-200">
          <span className="text-xs font-semibold text-slate-500">Released Monthly Payroll</span>
          <div className="text-2xl font-bold text-emerald-900">$450.00</div>
        </div>

        <div className="card-enterprise p-5 space-y-1 bg-purple-50/40 border-purple-200">
          <span className="text-xs font-semibold text-slate-500">Pending Manager Approval</span>
          <div className="text-2xl font-bold text-purple-900">1 Verified Bill</div>
        </div>

        <div className="card-enterprise p-5 space-y-1 bg-blue-50/40 border-blue-200">
          <span className="text-xs font-semibold text-slate-500">Department Active Duties</span>
          <div className="text-2xl font-bold text-blue-900">{duties.length} Duty Slots</div>
        </div>
      </div>

      {/* Financial Pipeline Control Panel */}
      <div className="card-enterprise p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Financial Release & Payout Pipeline</h4>
            <p className="text-[11px] text-slate-500">Inspect Faculty-verified student duty bills and authorize monthly disbursements</p>
          </div>
        </div>

        <Link to="/admin/billing">
          <Button variant="outline" className="!py-1.5 !px-3 text-xs gap-1.5">
            <span>Manage Billing Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* All Department Duty Slots */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">All Departmental Duty Slots</h3>
        <DutyList
          duties={duties}
          onOpenAssignModal={() => {}}
          onRemoveStudent={() => {}}
          onDeleteDuty={() => {}}
        />
      </div>
    </div>
  );
};
