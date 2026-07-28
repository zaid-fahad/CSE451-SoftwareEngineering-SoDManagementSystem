import React, { useState, useRef } from 'react';
import { useDuties } from '../services/useDuties';
import { useAttendance } from '../services/useAttendance';
import { Button } from '../component/UI/Button';
import { Input } from '../component/UI/Input';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Radio,
  ScanLine,
  Zap,
  Search,
  SlidersHorizontal,
  Clock,
  UserCheck,
  Award
} from 'lucide-react';
import { AttendanceStatus } from '../model/attendance';

export const AttendanceManagerPage: React.FC = () => {
  const { duties, students } = useDuties();
  const { attendanceRecords, markAttendance, scanRfidCard } = useAttendance();

  const [activeTab, setActiveTab] = useState<'manual' | 'rfid'>('rfid');
  const [selectedDutyId, setSelectedDutyId] = useState<string>(duties[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<AttendanceStatus>('Present');
  const [hoursCompleted, setHoursCompleted] = useState<number>(2.0);
  const [notes, setNotes] = useState<string>('');

  // RFID Scanner State
  const [rfidInput, setRfidInput] = useState<string>('');
  const [rfidError, setRfidError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const rfidInputRef = useRef<HTMLInputElement>(null);

  // Table Search & Filtering State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const currentDuty = duties.find((d) => d.id === selectedDutyId) || duties[0];
  const assignedStudents = currentDuty?.assignedStudents || [];

  // Metrics Calculations
  const totalLogs = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'Late').length;
  const totalHours = attendanceRecords.reduce((acc, r) => acc + (r.status !== 'Absent' ? r.hoursCompleted : 0), 0);
  const presentRate = totalLogs > 0 ? Math.round(((presentCount + lateCount) / totalLogs) * 100) : 100;

  // Filtered History
  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchesSearch =
      rec.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.dutyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.rfidTag && rec.rfidTag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'All') return true;
    if (statusFilter === 'RFID') return rec.method === 'RFID_Scan';
    return rec.status === statusFilter;
  });

  // Manual Attendance Handler
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const student = assignedStudents.find((s) => s.id === selectedStudentId) || assignedStudents[0];
    if (!student) {
      alert('Please select an assigned student assistant.');
      return;
    }

    markAttendance({
      dutyId: currentDuty ? currentDuty.id : 'duty-001',
      dutyTitle: currentDuty ? currentDuty.title : 'Department Duty Shift',
      studentId: student.id,
      studentName: student.name,
      date,
      status,
      hoursCompleted,
      notes,
      method: 'Manual',
    });

    setScanSuccess(`Manual attendance for ${student.name} saved as '${status}' (${hoursCompleted} hrs)!`);
    setTimeout(() => setScanSuccess(null), 3500);
  };

  // Live RFID Hardware Scanner Handler
  const handleRfidScan = (tagToScan?: string) => {
    const targetTag = tagToScan || rfidInput;
    if (!targetTag.trim()) return;

    setRfidError(null);
    setScanSuccess(null);
    setIsScanning(true);

    setTimeout(() => {
      try {
        const { student, record } = scanRfidCard(targetTag, duties, students);
        setScanSuccess(
          `RFID BEEP! Card UID [${record.rfidTag}] matched profile for ${student.name}. Attendance recorded as '${record.status}'.`
        );
        setRfidInput('');
      } catch (err: any) {
        setRfidError(err.message || 'Failed to scan RFID card.');
      } finally {
        setIsScanning(false);
      }
    }, 400);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            <span>Student Duty Attendance & RFID Hardware Manager</span>
          </h1>
          <p className="text-xs text-slate-500">
            Log student assistant shift attendance, verify completed duty hours, and scan wireless RFID badges for instant check-in.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('rfid')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rfid'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Wireless RFID Scanner</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manual Logger</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Stat Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-enterprise p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Check-Ins</div>
            <div className="text-lg font-bold text-slate-900">{totalLogs} Records</div>
          </div>
        </div>

        <div className="card-enterprise p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Punctuality Rate</div>
            <div className="text-lg font-bold text-emerald-600">{presentRate}%</div>
          </div>
        </div>

        <div className="card-enterprise p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Late Arrivals</div>
            <div className="text-lg font-bold text-amber-600">{lateCount} Shifts</div>
          </div>
        </div>

        <div className="card-enterprise p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Verified Hours</div>
            <div className="text-lg font-bold text-indigo-900">{totalHours.toFixed(1)} Hrs</div>
          </div>
        </div>
      </div>

      {/* Feedback Alerts */}
      {scanSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{scanSuccess}</span>
        </div>
      )}

      {rfidError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-3 shadow-xs animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{rfidError}</span>
        </div>
      )}

      {/* TAB 1: Wireless RFID Hardware Scanner */}
      {activeTab === 'rfid' && (
        <div className="card-enterprise p-6 space-y-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white border-none shadow-xl relative overflow-hidden">
          {/* Hardware Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Live RFID Hardware Antenna Scanner</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ONLINE • 13.56 MHz
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tap physical student worker badges on the USB/NFC reader or use the quick-tap simulator below.
                </p>
              </div>
            </div>
          </div>

          {/* RFID Scan Terminal Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Live Antenna Ring Illustration */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-800/80 border border-slate-700 text-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-blue-500/40 animate-ping absolute" />
                <div className="w-20 h-20 rounded-full border-2 border-indigo-400/60 animate-pulse absolute" />
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 z-10">
                  <ScanLine className="w-8 h-8" />
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-200">Antenna Waiting for Badge Tap...</div>
                <div className="text-[11px] text-slate-400">Place RFID badge near the reader coil</div>
              </div>
            </div>

            {/* Manual Scanner Input Form */}
            <div className="space-y-4 text-xs">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRfidScan();
                }}
                className="space-y-3"
              >
                <label className="font-semibold text-slate-300 uppercase tracking-wider block">
                  Scan Card UID / Department ID
                </label>
                <div className="flex gap-2">
                  <input
                    ref={rfidInputRef}
                    type="text"
                    value={rfidInput}
                    onChange={(e) => setRfidInput(e.target.value)}
                    placeholder="e.g. RFID-2021-001"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
                  />
                  <Button type="submit" isLoading={isScanning} className="bg-blue-600 hover:bg-blue-500">
                    Scan Badge
                  </Button>
                </div>
              </form>

              {/* Demo Quick-Tap Hardware Simulator */}
              <div className="pt-2 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick-Tap Hardware Demo Badges:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleRfidScan('RFID-2021-001')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-medium text-blue-300 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Alice's Badge (RFID-2021-001)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRfidScan('RFID-2021-045')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-medium text-blue-300 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Bob's Badge (RFID-2021-045)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRfidScan('RFID-2021-089')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-medium text-blue-300 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Charlie's Badge (RFID-2021-089)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Manual Attendance Logger */}
      {activeTab === 'manual' && (
        <div className="card-enterprise p-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Manual Duty Attendance & Hours Log Form
          </h3>

          <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
            {/* Duty Selection */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 uppercase tracking-wider block">
                Select Department Duty Shift
              </label>
              <div className="flex flex-wrap gap-2">
                {duties.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSelectedDutyId(d.id);
                      if (d.assignedStudents.length > 0) {
                        setSelectedStudentId(d.assignedStudents[0].id);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedDutyId === d.id
                        ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500 text-blue-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs">{d.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {d.day} • {d.startTime} - {d.endTime} ({d.location})
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Student & Date selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Select Assigned Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500 text-xs"
                >
                  {assignedStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department_id})
                    </option>
                  ))}
                  {assignedStudents.length === 0 && <option value="">No student assigned</option>}
                </select>
              </div>

              <div>
                <Input
                  label="Duty Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Hours Verified"
                  type="number"
                  step="0.5"
                  value={hoursCompleted}
                  onChange={(e) => setHoursCompleted(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 uppercase tracking-wider block">
                Attendance Status
              </label>
              <div className="flex gap-3">
                {(['Present', 'Late', 'Absent'] as AttendanceStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`px-4 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                      status === st
                        ? st === 'Present'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : st === 'Late'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-red-600 text-white border-red-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Input
                label="Supervisor Notes"
                type="text"
                placeholder="Optional supervisor performance notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Manual Attendance Record
            </Button>
          </form>
        </div>
      )}

      {/* History Log Table Section */}
      <div className="card-enterprise p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-slate-900">
            Attendance Log History & Work Hours Audit
          </h3>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or RFID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 w-48"
              />
            </div>

            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
              {['All', 'Present', 'Late', 'Absent', 'RFID'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                    statusFilter === st ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3 border-r border-slate-200">Date & Time</th>
                <th className="p-3 border-r border-slate-200">Student Worker</th>
                <th className="p-3 border-r border-slate-200">Duty Shift Title</th>
                <th className="p-3 border-r border-slate-200 text-center">Status</th>
                <th className="p-3 border-r border-slate-200 text-center">Method</th>
                <th className="p-3 border-r border-slate-200 text-right">Hours</th>
                <th className="p-3">Supervisor Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/60 transition-all">
                  <td className="p-3 border-r border-slate-100 font-medium text-slate-900 whitespace-nowrap">
                    <div>{rec.date}</div>
                    {rec.scanTimestamp && (
                      <div className="text-[10px] text-slate-400">{rec.scanTimestamp}</div>
                    )}
                  </td>
                  <td className="p-3 border-r border-slate-100">
                    <div className="font-semibold text-slate-900">{rec.studentName}</div>
                    {rec.rfidTag && (
                      <div className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        {rec.rfidTag}
                      </div>
                    )}
                  </td>
                  <td className="p-3 border-r border-slate-100 font-medium text-slate-800">
                    {rec.dutyTitle}
                  </td>
                  <td className="p-3 border-r border-slate-100 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        rec.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.status === 'Late'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="p-3 border-r border-slate-100 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        rec.method === 'RFID_Scan'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rec.method === 'RFID_Scan' ? 'RFID Scan' : 'Manual'}
                    </span>
                  </td>
                  <td className="p-3 border-r border-slate-100 text-right font-bold text-slate-900">
                    {rec.hoursCompleted} hrs
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">{rec.notes || '—'}</td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                    No matching attendance logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
