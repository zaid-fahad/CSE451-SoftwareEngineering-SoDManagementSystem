import React, { useState, useEffect } from 'react';
import { useSemesters } from '../context/SemesterContext';
import { Semester, SemesterStats } from '../model/semester';
import { Button } from '../component/UI/Button';
import { Input } from '../component/UI/Input';
import {
  Calendar,
  CalendarDays,
  Plus,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Users,
  Briefcase,
  FileSpreadsheet,
  X,
  Layers,
} from 'lucide-react';

export const SemesterManagementPage: React.FC = () => {
  const {
    semesters,
    activeSemester,
    isLoading,
    refreshSemesters,
    toggleOnboarding,
    setActiveSemester,
    createSemester,
    getSemesterStats,
  } = useSemesters();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    start_date: '',
    end_date: '',
    is_active: false,
    is_onboarding_open: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statsMap, setStatsMap] = useState<Record<number, SemesterStats>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  // Load stats for all semesters
  useEffect(() => {
    const fetchStats = async () => {
      const statsObj: Record<number, SemesterStats> = {};
      for (const sem of semesters) {
        try {
          const s = await getSemesterStats(sem.id);
          statsObj[sem.id] = s;
        } catch {
          // ignore stat fetch error
        }
      }
      setStatsMap(statsObj);
    };
    if (semesters.length > 0) {
      fetchStats();
    }
  }, [semesters]);

  const showToast = (text: string, isError = false) => {
    setFeedbackMsg({ text, isError });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleToggleOnboarding = async (sem: Semester) => {
    setUpdatingId(sem.id);
    try {
      await toggleOnboarding(sem.id, sem.is_onboarding_open);
      showToast(
        `Onboarding for '${sem.name}' is now ${!sem.is_onboarding_open ? 'OPEN' : 'CLOSED'}.`
      );
    } catch {
      showToast(`Failed to update onboarding for ${sem.name}.`, true);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSetActive = async (id: number, name: string) => {
    setUpdatingId(id);
    try {
      await setActiveSemester(id);
      showToast(`'${name}' is now set as the active academic semester.`);
    } catch {
      showToast(`Failed to set active semester.`, true);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      showToast('Semester Name and Code are required.', true);
      return;
    }

    setIsSubmitting(true);
    try {
      await createSemester({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        is_active: formData.is_active,
        is_onboarding_open: formData.is_onboarding_open,
      });
      showToast(`Semester '${formData.name}' created successfully!`);
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        code: '',
        start_date: '',
        end_date: '',
        is_active: false,
        is_onboarding_open: false,
      });
    } catch (err: any) {
      showToast(err?.response?.data?.detail || 'Failed to create semester.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="card-enterprise p-6 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Academic Semester & Schedule Onboarding</h1>
              <p className="text-xs text-slate-500">
                Configure academic terms, set the active semester, and manage student schedule onboarding windows.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={refreshSemesters}
            disabled={isLoading}
            className="text-xs gap-1.5 !py-2 !px-3"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs gap-1.5 !py-2 !px-4 shadow-sm bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Semester</span>
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn shadow-2xs ${
            feedbackMsg.isError
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          {feedbackMsg.isError ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span className="font-semibold">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Active Semester Overview Banner */}
      {activeSemester && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Current Active Semester
              </span>
              <span className="text-xs font-mono text-slate-300">[{activeSemester.code}]</span>
            </div>
            <h2 className="text-xl font-bold">{activeSemester.name}</h2>
            <p className="text-xs text-slate-300">
              {activeSemester.start_date && activeSemester.end_date
                ? `Term Dates: ${activeSemester.start_date} to ${activeSemester.end_date}`
                : 'Standard Department Academic Session'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Schedule Onboarding
              </div>
              <div className="text-xs font-bold flex items-center justify-end gap-1.5 mt-0.5">
                {activeSemester.is_onboarding_open ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Unlock className="w-3.5 h-3.5" /> OPEN (Students can edit)
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> CLOSED (Finalized / Read-Only)
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleOnboarding(activeSemester)}
              disabled={updatingId === activeSemester.id}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 ${
                activeSemester.is_onboarding_open
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold'
              }`}
            >
              {activeSemester.is_onboarding_open ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Close Onboarding</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Open Onboarding</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Semester Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>All Academic Semesters ({semesters.length})</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading semesters...</div>
        ) : semesters.length === 0 ? (
          <div className="card-enterprise p-8 text-center text-slate-500 text-sm bg-white">
            No semesters registered. Click "Create Semester" to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {semesters.map((sem) => {
              const isUpdating = updatingId === sem.id;
              const stats = statsMap[sem.id];

              return (
                <div
                  key={sem.id}
                  className={`card-enterprise p-5 border transition-all flex flex-col justify-between ${
                    sem.is_active
                      ? 'bg-white border-blue-400 ring-2 ring-blue-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{sem.name}</h3>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {sem.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {sem.start_date && sem.end_date
                              ? `${sem.start_date} → ${sem.end_date}`
                              : 'Session dates not specified'}
                          </span>
                        </div>
                      </div>

                      {sem.is_active ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Active Term
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetActive(sem.id, sem.name)}
                          disabled={isUpdating}
                          className="text-[10px] font-bold text-slate-500 hover:text-blue-600 hover:underline cursor-pointer"
                        >
                          Set as Active
                        </button>
                      )}
                    </div>

                    {/* Onboarding Status Pill & Toggle */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {sem.is_onboarding_open ? (
                          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                            <Unlock className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="text-[11px] font-bold text-slate-800">
                            Schedule Onboarding:
                          </div>
                          <div className="text-[10px] font-semibold">
                            {sem.is_onboarding_open ? (
                              <span className="text-emerald-600">Open (Student Self-Entry)</span>
                            ) : (
                              <span className="text-amber-600">Closed (Manager Locked)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant={sem.is_onboarding_open ? 'secondary' : 'outline'}
                        onClick={() => handleToggleOnboarding(sem)}
                        disabled={isUpdating}
                        className="!py-1 !px-2.5 text-xs font-semibold shrink-0"
                      >
                        {sem.is_onboarding_open ? 'Close' : 'Open'}
                      </Button>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-sm font-bold text-slate-800">
                          {stats ? stats.onboarded_students_count : '—'}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase font-bold flex items-center justify-center gap-0.5">
                          <Users className="w-2.5 h-2.5" /> Students
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-sm font-bold text-slate-800">
                          {stats ? stats.total_duties_count : '—'}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase font-bold flex items-center justify-center gap-0.5">
                          <Briefcase className="w-2.5 h-2.5" /> Duties
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-sm font-bold text-slate-800">
                          {stats ? stats.total_claims_count : '—'}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase font-bold flex items-center justify-center gap-0.5">
                          <FileSpreadsheet className="w-2.5 h-2.5" /> Claims
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Semester Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create Academic Semester</h3>
                  <p className="text-[11px] text-slate-500">Define a new academic term and schedule window</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSemester} className="p-6 space-y-4">
              <Input
                label="Semester Name (e.g., 'Autumn 2026')"
                placeholder="Autumn 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Semester Code (e.g., 'AUT26')"
                placeholder="AUT26"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Set as currently active semester</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_onboarding_open}
                    onChange={(e) => setFormData({ ...formData, is_onboarding_open: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Open student schedule onboarding immediately</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="!py-2 !px-4 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="!py-2 !px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Create Semester
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
