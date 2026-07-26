import React from 'react';
import { useAuth } from '../services/useAuth';
import { Button } from '../component/UI/Button';
import { UserCheck, Shield, LogOut } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{user?.name || 'Student Portal'}</h1>
              <p className="text-xs text-slate-400">{user?.email} • Dept ID: {user?.department_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              {user?.role || 'Student'}
            </span>
            <Button variant="outline" onClick={logout} className="!py-2 !px-3">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Departmental SoD Portal Active</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Your registration is active. In Sprint 2, the IRAS Schedule Parser and Interactive Availability Grid will load here.
          </p>
        </div>
      </div>
    </div>
  );
};
