import React, { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon: Icon,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-300">
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none transition-colors group-focus-within:text-emerald-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-slate-900/90 text-slate-100 text-sm rounded-xl py-3 ${
            Icon ? 'pl-11' : 'pl-4'
          } pr-4 border ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-800 focus:border-emerald-500/80 focus:ring-emerald-500/20'
          } outline-none focus:ring-4 transition-all duration-200 placeholder:text-slate-500 shadow-inner ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-0.5">
          <span>•</span> {error}
        </span>
      )}
      {helperText && !error && (
        <span className="text-xs text-slate-400">{helperText}</span>
      )}
    </div>
  );
};
