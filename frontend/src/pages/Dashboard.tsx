import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { Button } from '../component/UI/Button';
import { Building2, User, Shield, LogOut, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const state = location.state as { accessDenied?: boolean; message?: string } | null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Enterprise Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-600 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 block leading-tight">SoD Portal</span>
              <span className="text-[11px] text-slate-500 block leading-none">Dept. of Computer Science</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-md border border-slate-200 text-xs">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium text-slate-800">{user?.name}</span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                {user?.role || 'Student'}
              </span>
            </div>

            <Button variant="outline" onClick={logout} className="!py-1.5 !px-3 text-xs gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">

        {/* Access Denied Warning Toast Banner */}
        {state?.accessDenied && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm text-amber-900 block">Access Restricted</span>
              <p>{state.message || 'You do not have permission to access the requested page.'}</p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="card-enterprise p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-bold text-slate-900">{user?.name}</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user?.email} &bull; Dept ID: <span className="font-mono text-slate-700">{user?.department_id}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Role: <strong>{user?.role}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Test RBAC Guard Card */}
          <div className="card-enterprise p-6 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">RBAC Security Guard</h3>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">Active</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Test frontend route permission enforcement by attempting to open the restricted billing portal.
            </p>
            <div className="pt-2">
              <Link to="/admin/billing">
                <Button variant="secondary" className="!py-2 !px-3 text-xs gap-2">
                  <span>Open /admin/billing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* System Status Card */}
          <div className="card-enterprise p-6 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Sprint 1 Verification</h3>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              User registration and authentication endpoints are connected with bearer token persistence.
            </p>
            <div className="text-[11px] text-slate-500 font-medium pt-1">
              Ready for Sprint 2 IRAS Parser Integration
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Departmental Student on Duty System &bull; Version 1.0
      </footer>
    </div>
  );
};
