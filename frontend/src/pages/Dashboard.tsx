import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { useSchedule } from '../services/useSchedule';
import { AvailabilityGrid } from '../component/Schedule/AvailabilityGrid';
import { IRASParseModal } from '../component/Schedule/IRASParseModal';
import { Button } from '../component/UI/Button';
import { DemoRoleBar } from '../component/UI/DemoRoleBar';
import { Building2, User, Shield, LogOut, ShieldAlert, FileText, ArrowRight, Download } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { slots, toggleSlot, parseIRASText, loadDemoData, resetGrid } = useSchedule();
  const location = useLocation();
  const state = location.state as { accessDenied?: boolean; message?: string } | null;

  const [isParseModalOpen, setIsParseModalOpen] = useState<boolean>(false);

  const handleExportPNG = () => {
    alert('Schedule PNG export utility will generate visual grid snapshot.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Demo Interactive Role Bar */}
      <DemoRoleBar />

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

        {/* Access Denied Warning Banner */}
        {state?.accessDenied && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm text-amber-900 block">Access Restricted</span>
              <p>{state.message || 'You do not have permission to access the requested page.'}</p>
            </div>
          </div>
        )}

        {/* Profile & Control Toolbar */}
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

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                onClick={() => setIsParseModalOpen(true)}
                className="!py-2 !px-3 text-xs gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Parse IRAS Timetable</span>
              </Button>

              <Button
                variant="secondary"
                onClick={handleExportPNG}
                className="!py-2 !px-3 text-xs gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export PNG</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Weekly Availability Grid Component */}
        <AvailabilityGrid
          slots={slots}
          onToggleSlot={toggleSlot}
          onResetGrid={resetGrid}
          onLoadDemoData={loadDemoData}
        />

        {/* Admin Navigation Quick Links */}
        <div className="card-enterprise p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">Manager & Admin Controls</h4>
              <p className="text-[11px] text-slate-500">Access duty slot management and financial approval pipeline</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/manager/duties">
              <Button variant="secondary" className="!py-1.5 !px-3 text-xs gap-1.5">
                <span>Duty Manager</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>

            <Link to="/admin/billing">
              <Button variant="outline" className="!py-1.5 !px-3 text-xs gap-1.5">
                <span>Billing Pipeline</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>

      </main>

      {/* IRAS Parse Modal */}
      <IRASParseModal
        isOpen={isParseModalOpen}
        onClose={() => setIsParseModalOpen(false)}
        onParse={parseIRASText}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Departmental Student on Duty System &bull; Version 1.0
      </footer>
    </div>
  );
};
