import React from 'react';
import { useAuth } from '../services/useAuth';
import { Button } from '../component/UI/Button';
import { DemoRoleBar } from '../component/UI/DemoRoleBar';
import { ShieldCheck, ArrowLeft, FileSpreadsheet, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminBilling: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Demo Interactive Role Bar */}
      <DemoRoleBar />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="!py-1.5 !px-3 text-xs gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
            <span className="font-bold text-sm text-slate-900">Billing & Payroll Approval</span>
          </div>

          <span className="px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            Restricted Admin Area
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        <div className="card-enterprise p-6 space-y-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Departmental Billing Pipeline</h1>
              <p className="text-xs text-slate-500 mt-0.5">Faculty verification and manager payout approval module</p>
            </div>
          </div>

          <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>RBAC Guard Check Verified</span>
            </div>
            <p className="text-xs text-emerald-700">
              User <strong>{user?.name}</strong> successfully authenticated with role <strong>{user?.role}</strong>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
