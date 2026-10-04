import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../UI/Button';

interface IRASParseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParse: (rawText: string) => Promise<number>;
}

export const IRASParseModal: React.FC<IRASParseModalProps> = ({ isOpen, onClose, onParse }) => {
  const [rawText, setRawText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [showExamplePreview, setShowExamplePreview] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!rawText.trim()) {
      setError('Please paste your raw IRAS timetable text block.');
      return;
    }

    setIsParsing(true);
    try {
      const count = await onParse(rawText);
      setSuccessMsg(`Successfully parsed ${count} class slots into your availability grid!`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
        setRawText('');
      }, 1200);
    } catch {
      setError('Failed to parse timetable. Please verify text formatting.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-lg overflow-hidden text-left animate-fadeIn">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Parse IRAS Raw Timetable</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="irasText" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Raw Timetable Text
              </label>
              <button
                type="button"
                onClick={() => setShowExamplePreview(!showExamplePreview)}
                className="text-xs font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-blue-50/70 hover:bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showExamplePreview ? 'Hide Example' : 'View Example'}</span>
                {showExamplePreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <textarea
              id="irasText"
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw timetable text copied from your IRAS portal here..."
              className="w-full bg-white text-slate-900 text-xs rounded-md p-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none font-mono"
            />
          </div>

          {showExamplePreview && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-1.5 text-xs">
              <div className="font-semibold text-slate-700">Example of schedule text to copy:</div>
              <div className="overflow-hidden rounded border border-slate-200 bg-white max-h-56 flex items-center justify-center">
                <img
                  src="https://meetchuthere.com/assets/onboarding/paste-schedule-example.png"
                  alt="Example of schedule text to copy"
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="!py-2 !px-3 text-xs">
              Cancel
            </Button>
            <Button type="submit" isLoading={isParsing} className="!py-2 !px-4 text-xs">
              Parse & Update Grid
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
