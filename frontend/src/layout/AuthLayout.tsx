import React from 'react';
import { Building2, Calendar, ShieldCheck, FileSpreadsheet } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Main Enterprise Card Container */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Panel: Institutional Branding */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between text-left">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-600 text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Department Portal
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white leading-snug">
                Student on Duty Management System
              </h1>
              <p className="text-slate-400 text-xs leading-relaxed">
                Centralized platform for schedule coordination, duty assignment, shift trades, and billing verification.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3 text-slate-300 text-xs">
                <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                <span>IRAS Timetable Integration</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Automated Conflict Verification</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-xs">
                <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Verified Billing & Payroll Pipeline</span>
              </div>
            </div>
          </div>

          <div className="pt-6 text-[11px] text-slate-500 border-t border-slate-800">
            Department of Computer Science & Engineering
          </div>
        </div>

        {/* Right Panel: Form View */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-white">
          <div className="mb-6 text-left">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
            <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
          </div>
          {children}
        </div>

      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-center text-xs text-slate-500">
        SoD Management System &copy; {new Date().getFullYear()} • Departmental Operations
      </div>
    </div>
  );
};
