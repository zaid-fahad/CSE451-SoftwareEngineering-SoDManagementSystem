import React from 'react';
import { useAuth } from '../services/useAuth';
import { Button } from '../component/UI/Button';
import { DollarSign, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminBilling: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="!py-2 !px-3 gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Restricted Admin Area ({user?.role})
          </span>
        </div>

        <div className="glass-panel-glow rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Departmental Billing & Approval Pipeline</h1>
              <p className="text-sm text-slate-400">Sprint 4 Financial Audit Portal • Role Authorized: Faculty & Department Manager</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="text-sm font-semibold text-emerald-400">RBAC Guard Check Passed</h3>
            <p className="text-xs text-slate-300">
              User <strong>{user?.name}</strong> ({user?.email}) successfully authenticated with role <strong>{user?.role}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
