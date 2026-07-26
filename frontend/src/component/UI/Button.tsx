import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold text-sm rounded-xl px-5 py-3 transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg';

  const variants = {
    primary:
      'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 focus:ring-emerald-500/30 glow-emerald font-bold',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-700/50',
    outline:
      'bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 focus:ring-slate-700/40',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white focus:ring-rose-500/30',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
