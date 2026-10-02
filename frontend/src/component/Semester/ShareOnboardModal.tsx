import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink, Users, Calendar } from 'lucide-react';
import { Button } from '../UI/Button';
import { Semester } from '../../model/semester';

interface ShareOnboardModalProps {
  isOpen: boolean;
  semester: Semester | null;
  onClose: () => void;
}

export const ShareOnboardModal: React.FC<ShareOnboardModalProps> = ({
  isOpen,
  semester,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !semester) return null;

  const registrationUrl = `${window.location.origin}/register?semester=${encodeURIComponent(semester.name)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-left animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Share Student Onboarding Link
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Invite student assistants to register for <strong className="text-slate-700">{semester.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{semester.name} ({semester.code})</span>
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              When prospective student assistants use this link, their registrations will be flagged for <strong>Department Manager approval</strong> with an initial weekly hour limit before receiving active duty assignments.
            </p>
          </div>

          {/* Shareable Link Input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 uppercase tracking-wider block">
              Shareable Onboarding Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={registrationUrl}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 font-mono text-xs text-slate-800 select-all outline-none focus:border-blue-600"
              />
              <Button
                type="button"
                onClick={handleCopy}
                className={`!py-2.5 !px-4 text-xs font-bold shrink-0 gap-1.5 transition-all ${
                  copied ? '!bg-emerald-600 hover:!bg-emerald-700 text-white' : ''
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          {/* Student Guidance Box */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Onboarding Instructions for Students</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
              <li>Open link and register with university ID and departmental email.</li>
              <li>Wait for Department Manager approval and weekly hour assignment.</li>
              <li>Submit IRAS schedule slots upon approval to claim duty shifts.</li>
            </ol>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="!py-2 !px-4 text-xs">
              Close
            </Button>
            <a
              href={registrationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              <span>Test Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
