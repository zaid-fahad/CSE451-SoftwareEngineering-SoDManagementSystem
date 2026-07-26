import React from 'react';
import { ShieldCheck, Sparkles, GraduationCap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-900/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side: Branding / Intro (Visible on Desktop) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 text-left p-2">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider w-fit">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>SoD Portal v1.0</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Departmental <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Student on Duty
            </span> <br />
            Management
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            Automated schedule conflict detection, shift swapping, and verified bill pipeline for academic departments.
          </p>

          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-3 text-slate-300 text-xs font-medium">
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>IRAS Raw Timetable Automatic Parser</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-xs font-medium">
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Zero-Conflict Duty Scheduling Guard</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="lg:col-span-7">
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-10 shadow-2xl relative">
            <div className="mb-6 text-left">
              <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
              <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-center text-xs text-slate-600">
        Departmental SoD Management System &copy; {new Date().getFullYear()} • CSE451 Software Engineering
      </div>
    </div>
  );
};
