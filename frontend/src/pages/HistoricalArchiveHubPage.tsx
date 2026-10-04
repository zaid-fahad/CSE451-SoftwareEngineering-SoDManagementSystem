import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSemesters } from '../context/SemesterContext';
import { useAuth } from '../services/useAuth';
import { Semester, SemesterStats } from '../model/semester';
import { Button } from '../component/UI/Button';
import {
  History,
  Archive,
  RotateCcw,
  Calendar,
  Briefcase,
  Users,
  DollarSign,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { DataTable, ColumnDef } from '../component/UI/DataTable';

export const HistoricalArchiveHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { semesters, isLoading, refreshSemesters, getSemesterStats } = useSemesters();

  const [statsMap, setStatsMap] = useState<Record<number, SemesterStats>>({});
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);

  // Filter only archived semesters
  const archivedSemesters = semesters.filter((s) => s.is_archived);

  // Fetch stats for all archived semesters
  useEffect(() => {
    const fetchStats = async () => {
      setIsStatsLoading(true);
      const statsObj: Record<number, SemesterStats> = {};
      for (const sem of archivedSemesters) {
        try {
          const s = await getSemesterStats(sem.id);
          statsObj[sem.id] = s;
        } catch {
          // ignore stat fetch error
        }
      }
      setStatsMap(statsObj);
      setIsStatsLoading(false);
    };

    if (archivedSemesters.length > 0) {
      fetchStats();
    } else {
      setIsStatsLoading(false);
    }
  }, [semesters]);

  // Calculate cumulative historical totals across all archived terms
  const totalHistoricalStudents = Object.values(statsMap).reduce(
    (acc, cur) => acc + (cur.onboarded_students_count || 0),
    0
  );
  const totalHistoricalDuties = Object.values(statsMap).reduce(
    (acc, cur) => acc + (cur.total_duties_count || 0),
    0
  );
  const totalHistoricalHours = Object.values(statsMap).reduce(
    (acc, cur) => acc + (cur.total_duty_hours || 0),
    0
  );
  const totalHistoricalPayout = Object.values(statsMap).reduce(
    (acc, cur) => acc + (cur.total_payout || 0),
    0
  );

  const columns: ColumnDef<Semester>[] = [
    {
      key: 'name',
      header: 'Semester / Term',
      sortable: true,
      accessor: (sem) => sem.name,
      render: (sem) => (
        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <span>{sem.name}</span>
          <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {sem.code}
          </span>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Session Dates',
      sortable: true,
      accessor: (sem) => sem.start_date || '',
      render: (sem) => (
        sem.start_date && sem.end_date ? (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{sem.start_date} &rarr; {sem.end_date}</span>
          </div>
        ) : (
          <span className="text-slate-400 italic">Concluded Session</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: () => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Archive className="w-3 h-3 text-amber-700" />
          Archived
        </span>
      ),
    },
    {
      key: 'students',
      header: 'Onboarded Students',
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
      header: 'Completed Duties & Hours',
      sortable: true,
      align: 'center',
      accessor: (sem) => statsMap[sem.id]?.total_duties_count || 0,
      render: (sem) => {
        const stats = statsMap[sem.id];
        return (
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-1 text-slate-700 font-medium">
              <Briefcase className="w-3 h-3 text-indigo-500" />
              <span>{stats ? `${stats.total_duties_count} duties` : '—'}</span>
            </div>
            {stats && stats.total_duty_hours !== undefined && (
              <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {stats.total_duty_hours} hrs logged
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'payout',
      header: 'Disbursed Payout',
      sortable: true,
      align: 'center',
      accessor: (sem) => statsMap[sem.id]?.total_payout || 0,
      render: (sem) => {
        const stats = statsMap[sem.id];
        return (
          <div className="flex flex-col items-center">
            <span className="font-bold text-emerald-800 text-xs font-mono">
              {stats && stats.total_payout !== undefined
                ? `$${stats.total_payout.toFixed(2)}`
                : '—'}
            </span>
            {stats && stats.total_claims_count > 0 && (
              <span className="text-[10px] text-slate-500">
                {stats.total_claims_count} claims
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Audit Actions',
      align: 'center',
      render: (sem) => (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <Button
            variant="outline"
            onClick={() => navigate(`/manager/duties?semester=${encodeURIComponent(sem.name)}`)}
            className="!py-1 !px-2 text-[11px] gap-1 text-blue-700 border-blue-200 hover:bg-blue-50"
            title="Inspect duty assignments"
          >
            <Briefcase className="w-3 h-3 text-blue-600" />
            <span>Duties</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(`/manager/master-calendar?semester=${encodeURIComponent(sem.name)}`)}
            className="!py-1 !px-2 text-[11px] gap-1 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
            title="View master schedule"
          >
            <CalendarDays className="w-3 h-3 text-indigo-600" />
            <span>Calendar</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(`/admin/billing?semester=${encodeURIComponent(sem.name)}`)}
            className="!py-1 !px-2 text-[11px] gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            title="Audit payroll & claims"
          >
            <DollarSign className="w-3 h-3 text-emerald-600" />
            <span>Payroll</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(`/manager/student-calendars?semester=${encodeURIComponent(sem.name)}`)}
            className="!py-1 !px-2 text-[11px] gap-1 text-purple-700 border-purple-200 hover:bg-purple-50"
            title="Inspect student routines"
          >
            <Users className="w-3 h-3 text-purple-600" />
            <span>Schedules</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            <span>Historical Archive & Auditing Hub</span>
          </h1>
          <p className="text-xs text-slate-500">
            Review permanently archived semester records, historical duty logs, supervisor reports, and past payroll disbursements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1">
            <Archive className="w-3.5 h-3.5 text-amber-600" />
            <span>Read-Only Archive</span>
          </span>

          <Button
            variant="outline"
            onClick={refreshSemesters}
            disabled={isLoading || isStatsLoading}
            className="!py-2 !px-3 text-xs gap-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading || isStatsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Archive</span>
          </Button>

          {user?.role === 'DeptManager' && (
            <Link
              to="/admin/semesters"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              <span>Academic Semesters</span>
            </Link>
          )}
        </div>
      </div>

      {/* Historical Notice Banner */}
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Departmental Historical Archive (Read-Only):</strong> Concluded academic semesters are preserved here as permanent audit records. Student timetables, supervisor shift allocations, and approved payroll disbursements cannot be edited.
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] shrink-0 uppercase tracking-wider">
          Permanent Records
        </span>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card-enterprise p-4 space-y-1 bg-amber-50/40 border-amber-200">
          <span className="text-xs font-semibold text-slate-500">Concluded Semesters</span>
          <div className="text-2xl font-bold text-amber-900">{archivedSemesters.length} Terms</div>
        </div>

        <div className="card-enterprise p-4 space-y-1 bg-blue-50/40 border-blue-200">
          <span className="text-xs font-semibold text-slate-500">Historical Students</span>
          <div className="text-2xl font-bold text-blue-900">
            {isStatsLoading ? '...' : totalHistoricalStudents} Records
          </div>
        </div>

        <div className="card-enterprise p-4 space-y-1 bg-purple-50/40 border-purple-200">
          <span className="text-xs font-semibold text-slate-500">Logged Duty Hours</span>
          <div className="text-2xl font-bold text-purple-900">
            {isStatsLoading ? '...' : `${totalHistoricalHours} hrs`}
          </div>
          {!isStatsLoading && (
            <div className="text-[11px] text-slate-400 font-medium">
              {totalHistoricalDuties} duties completed
            </div>
          )}
        </div>

        <div className="card-enterprise p-4 space-y-1 bg-emerald-50/40 border-emerald-200">
          <span className="text-xs font-semibold text-slate-500">Total Payout Disbursed</span>
          <div className="text-2xl font-bold text-emerald-900">
            {isStatsLoading ? '...' : `$${totalHistoricalPayout.toFixed(2)}`}
          </div>
        </div>
      </div>

      {/* Modern Enterprise DataTable */}
      <DataTable<Semester>
        title="Historical Archives"
        icon={<Archive className="w-4 h-4 text-amber-600" />}
        data={archivedSemesters}
        columns={columns}
        rowKey={(sem) => sem.id}
        isLoading={isLoading || isStatsLoading}
        searchPlaceholder="Search archived semester or code..."
        searchKeys={['name', 'code']}
        initialSortKey="name"
        initialPageSize={10}
      />
    </div>
  );
};
