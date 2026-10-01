import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  X,
  Archive,
  History,
  ShieldAlert,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import { DataTable, ColumnDef } from '../component/UI/DataTable';

export const SemesterManagementPage: React.FC = () => {
  const {
    semesters,
    activeSemester,
    isLoading,
    refreshSemesters,
    toggleOnboarding,
    setActiveSemester,
    createSemester,
    archiveSemester,
    getSemesterStats,
  } = useSemesters();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'archived'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Semester | null>(null);
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
  const [toastMsg, setToastMsg] = useState<{ text: string; isError?: boolean } | null>(null);

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
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleOnboarding = async (sem: Semester) => {
    if (sem.is_archived) return;
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
    } catch (err: any) {
      showToast(err?.response?.data?.detail || `Failed to set active semester.`, true);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    setIsSubmitting(true);
    try {
      await archiveSemester(archiveTarget.id);
      showToast(`Semester '${archiveTarget.name}' has been concluded and archived as read-only record.`);
      setArchiveTarget(null);
      await refreshSemesters();
    } catch (err: any) {
      showToast(err?.response?.data?.detail || `Failed to archive semester.`, true);
    } finally {
      setIsSubmitting(false);
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

  // Filtered Semesters by status tab/dropdown
  const statusFilteredSemesters = useMemo(() => {
    return semesters.filter((sem) => {
      if (statusFilter === 'active' && !sem.is_active) return false;
      if (statusFilter === 'upcoming' && (sem.is_active || sem.is_archived)) return false;
      if (statusFilter === 'archived' && !sem.is_archived) return false;
      return true;
    });
  }, [semesters, statusFilter]);

  const activeCount = semesters.filter((s) => s.is_active).length;
  const upcomingCount = semesters.filter((s) => !s.is_active && !s.is_archived).length;
  const archivedCount = semesters.filter((s) => s.is_archived).length;

  const columns: ColumnDef<Semester>[] = [
    {
      key: 'name',
      header: 'Semester / Term',
      sortable: true,
      accessor: (sem) => sem.name,
      render: (sem) => (
        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <span>{sem.name}</span>
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {sem.code}
          </span>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Term Dates',
      sortable: true,
      accessor: (sem) => sem.start_date || '',
      render: (sem) => (
        sem.start_date && sem.end_date ? (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{sem.start_date} &rarr; {sem.end_date}</span>
          </div>
        ) : (
          <span className="text-slate-400 italic">Standard Session</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      accessor: (sem) => (sem.is_active ? 'Active' : sem.is_archived ? 'Archived' : 'Upcoming'),
      render: (sem) => (
        sem.is_active ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Active
          </span>
        ) : sem.is_archived ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Archive className="w-3 h-3 text-amber-700" />
            Archived
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Upcoming
          </span>
        )
      ),
    },
    {
      key: 'onboarding',
      header: 'Schedule Onboarding',
      align: 'center',
      accessor: (sem) => (sem.is_archived ? 'Locked' : sem.is_onboarding_open ? 'Open' : 'Closed'),
      render: (sem) => (
        sem.is_archived ? (
          <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Locked
          </span>
        ) : (
          <div className="flex items-center justify-center gap-2">
            {sem.is_onboarding_open ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <Unlock className="w-3 h-3 text-emerald-600" />
                Open
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Lock className="w-3 h-3 text-amber-600" />
                Closed
              </span>
            )}
            <Button
              variant={sem.is_onboarding_open ? 'secondary' : 'outline'}
              onClick={() => handleToggleOnboarding(sem)}
              disabled={updatingId === sem.id}
              className="!py-0.5 !px-2 text-[11px] font-semibold"
            >
              {sem.is_onboarding_open ? 'Close' : 'Open'}
            </Button>
          </div>
        )
      ),
    },
    {
      key: 'students',
      header: 'Enrolled Students',
      sortable: true,
      align: 'center',
      accessor: (sem) => statsMap[sem.id]?.onboarded_students_count || 0,
      render: (sem) => {
        const stats = statsMap[sem.id];
        return (
          <div className="inline-flex items-center gap-1 font-semibold text-slate-800">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>{stats ? stats.onboarded_students_count : '—'}</span>
          </div>
        );
      },
    },
    {
      key: 'duties',
      header: 'Duties & Claims',
      sortable: true,
      align: 'center',
      accessor: (sem) => statsMap[sem.id]?.total_duties_count || 0,
      render: (sem) => {
        const stats = statsMap[sem.id];
        return (
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-1 text-slate-700 font-medium">
              <Briefcase className="w-3 h-3 text-slate-400" />
              <span>{stats ? `${stats.total_duties_count} duties` : '—'}</span>
            </div>
            {stats && stats.total_claims_count > 0 && (
              <span className="text-[10px] text-emerald-700 font-semibold">
                {stats.total_claims_count} claims (${stats.total_payout?.toFixed(2) || '0.00'})
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (sem) => (
        <div className="flex items-center justify-center gap-2">
          {sem.is_active ? (
            <Button
              variant="outline"
              onClick={() => setArchiveTarget(sem)}
              disabled={updatingId === sem.id}
              className="!py-1 !px-2.5 text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
            >
              <Archive className="w-3 h-3 text-rose-600" />
              <span>Archive</span>
            </Button>
          ) : sem.is_archived ? (
            <Link
              to="/admin/archive"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-semibold transition-colors"
            >
              <History className="w-3 h-3 text-amber-700" />
              <span>View Archive</span>
            </Link>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleSetActive(sem.id, sem.name)}
                disabled={updatingId === sem.id}
                className="!py-1 !px-2.5 text-xs text-blue-700 border-blue-200 hover:bg-blue-50 font-bold"
              >
                <span>Set Active</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setArchiveTarget(sem)}
                disabled={updatingId === sem.id}
                className="!py-1 !px-2 text-xs text-slate-600 hover:text-rose-600"
              >
                <span>Archive</span>
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Toast Feedback */}
      {toastMsg && (
        <div
          className={`p-4 rounded-lg border text-xs font-medium flex items-center gap-3 shadow-xs animate-fadeIn ${
            toastMsg.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMsg.isError ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Academic Semester & Term Administration</span>
          </h1>
          <p className="text-xs text-slate-500">
            Configure academic terms, toggle student schedule onboarding windows, and manage term lifecycles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/archive"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-semibold transition-colors"
          >
            <History className="w-3.5 h-3.5 text-amber-600" />
            <span>Historical Archive Hub</span>
          </Link>

          <span className="px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>DeptManager</span>
          </span>

          <Button
            variant="outline"
            onClick={refreshSemesters}
            disabled={isLoading}
            className="!py-2 !px-3 text-xs gap-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="!py-2 !px-4 text-xs gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Semester</span>
          </Button>
        </div>
      </div>

      {/* Active Semester Banner */}
      {activeSemester ? (
        <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span>
                <strong>Current Active Semester:</strong>{' '}
                <strong className="text-blue-900">{activeSemester.name}</strong> ({activeSemester.code}) &bull;{' '}
                {activeSemester.start_date && activeSemester.end_date
                  ? `${activeSemester.start_date} to ${activeSemester.end_date}`
                  : 'Standard Department Session'}{' '}
                &bull; Schedule Onboarding is currently{' '}
                <strong className={activeSemester.is_onboarding_open ? 'text-emerald-700' : 'text-amber-700'}>
                  {activeSemester.is_onboarding_open ? 'OPEN' : 'CLOSED'}
                </strong>.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={activeSemester.is_onboarding_open ? 'secondary' : 'outline'}
              onClick={() => handleToggleOnboarding(activeSemester)}
              disabled={updatingId === activeSemester.id}
              className="!py-1.5 !px-3 text-xs gap-1 font-semibold"
            >
              {activeSemester.is_onboarding_open ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Close Onboarding</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Open Onboarding</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setArchiveTarget(activeSemester)}
              className="!py-1.5 !px-3 text-xs gap-1 font-semibold text-rose-700 border-rose-200 hover:bg-rose-50"
            >
              <Archive className="w-3.5 h-3.5 text-rose-600" />
              <span>Conclude & Archive</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>No active semester configured.</strong> All concluded academic terms are archived. Select an upcoming term in the table below and click &quot;Set Active&quot;.
          </span>
        </div>
      )}

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card-enterprise p-4 space-y-1 bg-blue-50/40 border-blue-200">
          <span className="text-xs font-semibold text-slate-500">Registered Terms</span>
          <div className="text-2xl font-bold text-blue-900">{semesters.length} Semesters</div>
        </div>

        <div className="card-enterprise p-4 space-y-1 bg-emerald-50/40 border-emerald-200">
          <span className="text-xs font-semibold text-slate-500">Active Term Onboarding</span>
          <div className="text-2xl font-bold text-emerald-900">
            {activeSemester ? (activeSemester.is_onboarding_open ? 'Open' : 'Closed') : 'Inactive'}
          </div>
        </div>

        <div className="card-enterprise p-4 space-y-1 bg-purple-50/40 border-purple-200">
          <span className="text-xs font-semibold text-slate-500">Upcoming Terms</span>
          <div className="text-2xl font-bold text-purple-900">{upcomingCount} Terms</div>
        </div>

        <div className="card-enterprise p-4 space-y-1 bg-amber-50/40 border-amber-200">
          <span className="text-xs font-semibold text-slate-500">Archived Terms</span>
          <div className="text-2xl font-bold text-amber-900">{archivedCount} Archived</div>
        </div>
      </div>

      {/* Modern Enterprise DataTable */}
      <DataTable<Semester>
        title="Academic Semesters"
        icon={<Calendar className="w-4 h-4 text-blue-600" />}
        data={statusFilteredSemesters}
        columns={columns}
        rowKey={(sem) => sem.id}
        isLoading={isLoading}
        searchPlaceholder="Search term name or code..."
        searchKeys={['name', 'code']}
        initialSortKey="name"
        initialPageSize={10}
        toolbarActions={
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-bold text-blue-700 outline-none cursor-pointer"
            >
              <option value="all">All Terms ({semesters.length})</option>
              <option value="active">Active Term ({activeCount})</option>
              <option value="upcoming">Upcoming Terms ({upcomingCount})</option>
              <option value="archived">Archived Terms ({archivedCount})</option>
            </select>
          </div>
        }
      />

      {/* Conclude & Archive Confirmation Modal */}
      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="card-enterprise bg-white border border-slate-200 rounded-lg shadow-lg w-full max-w-md overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-950">Conclude & Archive Semester?</h3>
                  <p className="text-[11px] text-rose-700 font-medium">Permanent Historical Action</p>
                </div>
              </div>
              <button
                onClick={() => setArchiveTarget(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-600">
              <p>
                You are about to conclude and archive <strong className="text-slate-900">{archiveTarget.name}</strong> ({archiveTarget.code}).
              </p>
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Lock className="w-3.5 h-3.5" /> What happens when a semester is archived:
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>The semester will be permanently marked as <strong>Archived</strong>.</li>
                  <li>Schedule onboarding is permanently closed for students.</li>
                  <li>Students and Lab Managers can no longer create or edit duties or submit bills for this term.</li>
                  <li>All existing records remain fully preserved and searchable for audits.</li>
                  <li>This action cannot be undone.</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setArchiveTarget(null)}
                  disabled={isSubmitting}
                  className="!py-2 !px-4 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleConfirmArchive}
                  isLoading={isSubmitting}
                  className="!py-2 !px-4 text-xs font-semibold"
                >
                  Confirm & Archive Semester
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Semester Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="card-enterprise bg-white border border-slate-200 rounded-lg shadow-lg w-full max-w-md overflow-hidden text-left">
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
                  className="!py-2 !px-4 text-xs font-semibold"
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
