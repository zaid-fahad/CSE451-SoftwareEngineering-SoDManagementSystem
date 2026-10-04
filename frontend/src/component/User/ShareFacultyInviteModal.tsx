import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Check, ExternalLink, ShieldCheck, Clock, RotateCcw } from 'lucide-react';
import { Button } from '../UI/Button';
import { api } from '../../services/api';

interface ShareFacultyInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareFacultyInviteModal: React.FC<ShareFacultyInviteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generateToken = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.post<{ token: string; invite_url: string; expires_at: string }>('/auth/invites/faculty');
      setToken(res.data.token);
      setExpiresAt(res.data.expires_at);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to generate faculty invite token.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateToken();
    } else {
      setToken(null);
      setExpiresAt(null);
      setCopied(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const inviteUrl = token ? `${window.location.origin}/register/faculty?token=${token}` : '';

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-left animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Faculty Invitation Link
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate a single-use tokenized onboarding link for a faculty member
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
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-purple-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-purple-800">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Restricted Faculty Onboarding</span>
            </div>
            <p className="text-[11px] text-purple-700 leading-relaxed">
              Open registration is restricted. Faculty members require this secure tokenized link to self-register. Upon registration, their account will be queued for your final verification before portal access is enabled.
            </p>
          </div>

          {/* Invite Link Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 uppercase tracking-wider block">
                Single-Use Invite Link
              </label>
              {expiresAt && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Expires: {expiresAt.split(' ')[0]}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="p-6 text-center text-slate-400 flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4 animate-spin text-purple-600" />
                <span>Generating secure token...</span>
              </div>
            ) : token ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 font-mono text-xs text-slate-800 select-all outline-none focus:border-purple-600"
                />
                <Button
                  type="button"
                  onClick={handleCopy}
                  className={`!py-2.5 !px-4 text-xs font-bold shrink-0 gap-1.5 transition-all ${
                    copied ? '!bg-emerald-600 hover:!bg-emerald-700 text-white' : '!bg-purple-600 hover:!bg-purple-700 text-white'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </Button>
              </div>
            ) : (
              <Button type="button" onClick={generateToken} className="!py-2 !px-4 text-xs gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Generate Link</span>
              </Button>
            )}
          </div>

          {/* Workflow Instructions */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>Faculty Onboarding Steps</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
              <li>Share this link with the faculty member.</li>
              <li>Faculty completes registration with department ID and university email.</li>
              <li>Review and approve the new faculty registration in <strong>Pending Approvals &gt; Faculty</strong>.</li>
            </ol>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={generateToken}
              disabled={isLoading}
              className="!py-1.5 !px-3 text-xs gap-1 text-slate-600"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate New Token</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="!py-1.5 !px-4 text-xs">
                Close
              </Button>
              {inviteUrl && (
                <a
                  href={inviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
