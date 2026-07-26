import React from 'react';
import { useAuth } from '../../services/useAuth';
import { UserRole } from '../../model/user';
import { Sparkles, User, ShieldCheck } from 'lucide-react';

export const DemoRoleBar: React.FC = () => {
  const { user, switchRole } = useAuth();

  const roles: { role: UserRole; label: string }[] = [
    { role: 'Student', label: 'Student View' },
    { role: 'Faculty', label: 'Faculty View' },
    { role: 'LabManager', label: 'Lab Manager View' },
    { role: 'DeptManager', label: 'Dept Manager View' },
  ];

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
      <div className="flex items-center gap-2 text-slate-300">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-200">Interactive Demo Preview Bar:</span>
        <span className="text-slate-400 hidden sm:inline text-[11px]">Click any role below to test RBAC guards and permissions live</span>
      </div>

      <div className="flex items-center gap-1.5">
        {roles.map((r) => {
          const isActive = user?.role === r.role;
          return (
            <button
              key={r.role}
              onClick={() => switchRole(r.role)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isActive ? <ShieldCheck className="w-3 h-3 text-white" /> : <User className="w-3 h-3 text-slate-400" />}
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
