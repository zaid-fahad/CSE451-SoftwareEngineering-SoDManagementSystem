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
    <div className="flex flex-col space-y-1.5 w-full text-left">
      <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-white text-slate-900 text-sm rounded-md py-2.5 ${
            Icon ? 'pl-9' : 'pl-3'
          } pr-3 border ${
            error
              ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
          } outline-none transition-colors duration-150 placeholder:text-slate-400 ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-600 font-medium flex items-center gap-1 mt-0.5">
          <span>•</span> {error}
        </span>
      )}
      {helperText && !error && (
        <span className="text-xs text-slate-500">{helperText}</span>
      )}
    </div>
  );
};
