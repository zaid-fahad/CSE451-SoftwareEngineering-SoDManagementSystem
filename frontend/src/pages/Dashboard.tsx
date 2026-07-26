import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { Button } from '../component/UI/Button';
import { UserCheck, Shield, LogOut, ShieldAlert, DollarSign } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const state = location.state as { accessDenied?: boolean; message?: string } | null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Access Denied Warning Toast Banner */}
        {state?.accessDenied && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium flex items-start gap-3 shadow-xl animate-fadeIn">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">Access Restricted</span>
              <p>{state.message || 'GIVEN a student attempts to navigate directly to restricted pages, the system redirects to /dashboard with an access denied banner.'}</p>
            </div>
          </div>
        )}

        {/* User Info Header */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
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

        {/* Action & Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6 space-y-3 text-left">
            <div className="flex items-center gap-3 text-emerald-400 font-semibold text-sm">
              <Shield className="w-4 h-4" />
              <span>RBAC Guard Test</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Test frontend router guards by attempting to access the restricted billing pipeline.
            </p>
            <Link to="/admin/billing" className="inline-block pt-1">
              <Button variant="secondary" className="!py-2 !px-3 text-xs gap-2">
                <DollarSign className="w-3.5 h-3.5" />
                Go to /admin/billing
              </Button>
            </Link>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-3 text-left">
            <div className="flex items-center gap-3 text-teal-400 font-semibold text-sm">
              <UserCheck className="w-4 h-4" />
              <span>Sprint 1 Status</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Authentication endpoints `/auth/register` and `/auth/login` are integrated with token persistence.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
