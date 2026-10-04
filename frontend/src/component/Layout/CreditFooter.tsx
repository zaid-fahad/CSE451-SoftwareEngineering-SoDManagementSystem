import React from 'react';
import { Code2 } from 'lucide-react';

interface CreditFooterProps {
  className?: string;
  variant?: 'default' | 'card';
}

export const CreditFooter: React.FC<CreditFooterProps> = ({
  className = '',
  variant = 'default',
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`w-full py-4 px-4 text-center text-xs text-slate-500 transition-colors ${
        variant === 'card'
          ? 'bg-transparent border-t-0'
          : 'border-t border-slate-200/80 bg-white/60'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-xs">
        <span className="font-medium text-slate-600">
          Student on Duty Management System &copy; {currentYear}
        </span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <Code2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Developed by</span>
          <a
            href="https://github.com/Momotaj-Happy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-800 hover:text-blue-600 hover:underline transition-colors cursor-pointer"
            title="Momotaj Akther Happy GitHub Profile"
          >
            Momotaj Akther Happy
          </a>
          <span className="text-slate-400">&amp;</span>
          <a
            href="https://github.com/zaid-fahad"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-800 hover:text-blue-600 hover:underline transition-colors cursor-pointer"
            title="Mohammad Zaid Iqbal Fahad GitHub Profile"
          >
            Mohammad Zaid Iqbal Fahad
          </a>
        </div>
      </div>
    </footer>
  );
};
