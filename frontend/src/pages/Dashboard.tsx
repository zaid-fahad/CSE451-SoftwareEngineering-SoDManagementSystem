import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { useAuth } from '../services/useAuth';
import { useSchedule } from '../services/useSchedule';
import { useBilling } from '../services/useBilling';
import { AvailabilityGrid } from '../component/Schedule/AvailabilityGrid';
import { IRASParseModal } from '../component/Schedule/IRASParseModal';
import { SubmitBillModal } from '../component/Billing/SubmitBillModal';
import { Button } from '../component/UI/Button';
import { DemoRoleBar } from '../component/UI/DemoRoleBar';
import { Building2, User, Shield, LogOut, ShieldAlert, FileText, ArrowRight, Download, ArrowRightLeft, DollarSign, CheckCircle2 } from 'lucide-react';
import { BillSubmitPayload } from '../model/billing';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { slots, toggleSlot, parseIRASText, loadDemoData, resetGrid } = useSchedule();
  const { submitBill } = useBilling();
  const location = useLocation();
  const state = location.state as { accessDenied?: boolean; message?: string } | null;

  const [isParseModalOpen, setIsParseModalOpen] = useState<boolean>(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleExportPNG = async () => {
    const gridElem = document.getElementById('availability-grid-container');
    if (!gridElem) return;

    try {
      const canvas = await html2canvas(gridElem, { backgroundColor: '#ffffff', scale: 2 });
      const link = document.createElement('a');
      link.download = `sod_weekly_schedule_${user?.name.replace(' ', '_') || 'student'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setToastMsg('Weekly schedule PNG image generated and downloaded successfully!');
      setTimeout(() => setToastMsg(null), 3500);
    } catch {
      alert('Failed to export schedule PNG image.');
    }
  };

  const handleSubmitBill = async (payload: BillSubmitPayload) => {
    if (!user) return;
    await submitBill(user, payload);
    setToastMsg(`Monthly duty bill for ${payload.month} submitted successfully for Faculty verification!`);
    setTimeout(() => setToastMsg(null), 3500);
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
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-slate-800 font-bold">{user?.name}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold bg-slate-200 px-1.5 py-0.5 rounded">
                {user?.role}
              </span>
            </div>

            <Button variant="outline" onClick={logout} className="!py-1.5 !px-3 text-xs gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        
        {/* Toast Feedback Notification */}
        {toastMsg && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3 shadow-xs animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Access Denied Warning Toast */}
        {state?.accessDenied && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <span>{state.message || 'Access restricted. Insufficient role permissions.'}</span>
          </div>
        )}

        {/* Action Toolbar Header */}
        <div className="card-enterprise p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Weekly Availability & Duty Schedule</span>
            </h1>
            <p className="text-xs text-slate-500">
              Manage your availability timetable, parse IRAS class schedules, request shift swaps, or export visual schedule images.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/swaps">
              <Button
                variant="secondary"
                className="!py-2 !px-3 text-xs gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                <span>Shift Swap Portal</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => setIsBillModalOpen(true)}
              className="!py-2 !px-3 text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Submit Monthly Bill</span>
            </Button>

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

      {/* Modals */}
      <IRASParseModal
        isOpen={isParseModalOpen}
        onClose={() => setIsParseModalOpen(false)}
        onParse={parseIRASText}
      />

      <SubmitBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        onSubmitBill={handleSubmitBill}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Departmental Student on Duty System &bull; Version 1.0
      </footer>
    </div>
  );
};
