import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { useDuties } from '../services/useDuties';
import { useAttendance } from '../services/useAttendance';
import { Button } from '../component/UI/Button';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Radio,
  Clock,
  UserCheck,
  Award,
  LogIn,
  LogOut,
  Sparkles,
  Users,
  Building,
  ArrowLeft,
  ChevronRight,
  Search,
  CalendarCheck,
  FileText,
  Zap,
  ScanLine,
  Maximize2,
  ShieldCheck
} from 'lucide-react';
import { DutySlot } from '../model/duty';

// PAGE 1: SCHEDULED DUTY SLOTS LIST PAGE (/manager/attendance)
const DutySlotsListPage: React.FC<{ duties: DutySlot[] }> = ({ duties }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <span>Scheduled Department Duty Shift Slots</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a duty shift slot below to open its dedicated attendance roster table page.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {duties.map((duty) => (
          <div
            key={duty.id}
            onClick={() => navigate(`/manager/attendance/duty/${duty.id}`)}
            className="card-enterprise p-5 space-y-4 border border-slate-200 bg-white hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  {duty.title}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  {duty.assignedStudents.length} Students
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>{duty.day} • {duty.startTime} - {duty.endTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{duty.location}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>Take Shift Attendance Page →</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// PAGE 2: SHIFT ATTENDANCE ROSTER TABLE PAGE (/manager/attendance/duty/:dutyId)
const ShiftAttendancePage: React.FC<{
  duties: DutySlot[];
  students: any[];
  attendanceRecords: any[];
  checkInStudent: any;
  checkOutStudent: any;
  scanRfidCard: any;
  setScanSuccess: (msg: string | null) => void;
  setRfidError: (msg: string | null) => void;
}> = ({ duties, students, attendanceRecords, checkInStudent, checkOutStudent, scanRfidCard, setScanSuccess, setRfidError }) => {
  const { dutyId } = useParams<{ dutyId: string }>();
  const navigate = useNavigate();
  const activeDuty = duties.find((d) => d.id === dutyId) || duties[0];

  const [rfidInput, setRfidInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const rfidInputRef = useRef<HTMLInputElement>(null);

  const handleRfidScan = () => {
    if (!rfidInput.trim()) return;
    setRfidError(null);
    setScanSuccess(null);
    setIsScanning(true);

    setTimeout(() => {
      try {
        const { student, record, action } = scanRfidCard(rfidInput, duties, students);
        if (action === 'checkin') {
          setScanSuccess(
            `RFID CHECK-IN! Card [${record.rfidTag}] verified for ${student.name} at ${record.checkInTime}.`
          );
        } else {
          setScanSuccess(
            `RFID CHECK-OUT! Card [${record.rfidTag}] checked out ${student.name} at ${record.checkOutTime}.`
          );
        }
        setRfidInput('');
      } catch (err: any) {
        setRfidError(err.message || 'Failed to scan RFID card.');
      } finally {
        setIsScanning(false);
      }
    }, 350);
  };

  if (!activeDuty) {
    return (
      <div className="card-enterprise p-6 text-center space-y-3">
        <div className="text-sm font-bold text-slate-700">Duty Shift Slot Not Found</div>
        <Button onClick={() => navigate('/manager/attendance')}>Return to Duty Slots List</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Bar with Back Button */}
      <div className="card-enterprise p-5 space-y-3 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 border-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/manager/attendance')}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Slots List</span>
            </button>

            <div>
              <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
                Shift Roster Page Context
              </div>
              <h2 className="text-base font-bold text-slate-900">{activeDuty.title}</h2>
              <div className="text-xs text-slate-600 mt-0.5">
                {activeDuty.day} • {activeDuty.startTime} - {activeDuty.endTime} ({activeDuty.location})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs">
              {activeDuty.assignedStudents.length} Students Assigned
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Clean Light Mode RFID Scanner Bar */}
      <div className="card-enterprise p-4 bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Wireless RFID Hardware Terminal Active</span>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ONLINE
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Tap physical RFID card to automatically check in / check out assigned students.
            </div>
          </div>
        </div>

        {/* Quick RFID Scan Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRfidScan();
          }}
          className="flex gap-2"
        >
          <input
            ref={rfidInputRef}
            type="text"
            value={rfidInput}
            onChange={(e) => setRfidInput(e.target.value)}
            placeholder="Scan Card UID..."
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-500 w-40 sm:w-48"
          />
          <Button type="submit" isLoading={isScanning} className="bg-blue-600 hover:bg-blue-700 text-xs py-1.5">
            Scan
          </Button>
        </form>
      </div>

      {/* Assigned Student Roster Attendance Table */}
      <div className="card-enterprise p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Assigned Student Assistant Attendance Roster Table</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Record Check-In / Check-Out for this shift
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3 border-r border-slate-200">Student Assistant</th>
                <th className="p-3 border-r border-slate-200">Assigned RFID Badge UID</th>
                <th className="p-3 border-r border-slate-200">Shift Timestamps</th>
                <th className="p-3 border-r border-slate-200 text-center">Status</th>
                <th className="p-3 text-center">Duty Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((stud) => {
                const activeRecord = attendanceRecords.find(
                  (r) => String(r.studentId) === String(stud.id) && r.shiftState === 'Checked_In'
                );

                const completedRecord = attendanceRecords.find(
                  (r) => String(r.studentId) === String(stud.id) && r.shiftState === 'Checked_Out'
                );

                const isAssigned = activeDuty.assignedStudents.some(
                  (st) => String(st.id) === String(stud.id)
                );

                return (
                  <tr
                    key={stud.id}
                    className={`hover:bg-slate-50/60 transition-all ${
                      isAssigned ? 'bg-white font-medium' : 'bg-slate-50/40 text-slate-500'
                    }`}
                  >
                    <td className="p-3 border-r border-slate-100">
                      <div className="font-bold text-slate-900 text-sm">{stud.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Dept ID: {stud.department_id}</div>
                    </td>

                    <td className="p-3 border-r border-slate-100 font-mono text-xs">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-bold border border-blue-100">
                        {stud.rfidTag || `RFID-${stud.department_id}`}
                      </span>
                    </td>

                    <td className="p-3 border-r border-slate-100">
                      {activeRecord ? (
                        <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Checked In at {activeRecord.checkInTime}</span>
                        </div>
                      ) : completedRecord ? (
                        <div className="text-slate-600 font-medium flex items-center gap-1.5">
                          <LogOut className="w-3.5 h-3.5 text-slate-500" />
                          <span>Completed ({completedRecord.checkInTime} - {completedRecord.checkOutTime})</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not checked in</span>
                      )}
                    </td>

                    <td className="p-3 border-r border-slate-100 text-center">
                      {activeRecord ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center justify-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> On Duty
                        </span>
                      ) : completedRecord ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Scheduled
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      {activeRecord ? (
                        <button
                          type="button"
                          onClick={() => {
                            checkOutStudent(activeRecord.id);
                            setScanSuccess(`Check-out recorded for ${stud.name}.`);
                            setTimeout(() => setScanSuccess(null), 3000);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Check Out
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            checkInStudent(stud, activeDuty, 'Manual', stud.rfidTag);
                            setScanSuccess(`Check-in recorded for ${stud.name}.`);
                            setTimeout(() => setScanSuccess(null), 3000);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// FULL-SCREEN SEPARATE SUBPAGE: WIRELESS RFID KIOSK TERMINAL (/manager/attendance/rfid-kiosk)
const FullScreenRfidKioskPage: React.FC<{
  duties: DutySlot[];
  students: any[];
  scanRfidCard: any;
}> = ({ duties, students, scanRfidCard }) => {
  const navigate = useNavigate();
  const [rfidInput, setRfidInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [rfidError, setRfidError] = useState<string | null>(null);
  const [kioskScanLog, setKioskScanLog] = useState<{ name: string; tag: string; time: string; action: string } | null>(null);
  const rfidInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (rfidInputRef.current) rfidInputRef.current.focus();
  }, []);

  const handleRfidScan = (customTag?: string) => {
    const targetTag = customTag || rfidInput;
    if (!targetTag.trim()) return;

    setRfidError(null);
    setIsScanning(true);

    setTimeout(() => {
      try {
        const { student, record, action } = scanRfidCard(targetTag, duties, students);
        const actionLabel = action === 'checkin' ? 'CHECK-IN' : 'CHECK-OUT';
        setKioskScanLog({
          name: student.name,
          tag: record.rfidTag,
          time: record.checkInTime || record.checkOutTime,
          action: actionLabel,
        });

        setRfidInput('');
        if (rfidInputRef.current) rfidInputRef.current.focus();
      } catch (err: any) {
        setRfidError(err.message || 'Failed to scan RFID card.');
      } finally {
        setIsScanning(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-[85vh] p-6 bg-slate-50 space-y-6 animate-fadeIn text-left">
      {/* Top Clean Light Mode Kiosk Bar */}
      <div className="card-enterprise p-5 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Full-Screen High-Speed RFID Kiosk Terminal</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                13.56 MHz NFC ONLINE
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Standalone wall-mounted hardware scanner terminal. Tap physical badge for instant check-in / out.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/manager/attendance')}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Kiosk Subpage</span>
        </button>
      </div>

      {/* Main Kiosk Reader Visual Card */}
      <div className="card-enterprise p-8 bg-white border border-slate-200 shadow-md space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Light Mode Antenna Illustration */}
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-5">
            <div className="relative flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-emerald-500/30 animate-ping absolute" />
              <div className="w-28 h-28 rounded-full border-2 border-blue-400/50 animate-pulse absolute" />
              <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 z-10">
                <ScanLine className="w-10 h-10 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="text-base font-bold text-slate-900">Hold RFID Card Near Reader</div>
              <div className="text-xs text-slate-500 mt-1">Continuous Auto-Focus Sensor Listening...</div>
            </div>
          </div>

          {/* Input & Quick Tap Simulator */}
          <div className="space-y-5">
            {rfidError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{rfidError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRfidScan();
              }}
              className="space-y-3"
            >
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Badge UID Reader Input
              </label>
              <div className="flex gap-2">
                <input
                  ref={rfidInputRef}
                  type="text"
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  placeholder="Scan Physical Badge UID..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                />
                <Button type="submit" isLoading={isScanning} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6">
                  Scan Card
                </Button>
              </div>
            </form>

            {/* Quick Tap Demo Badges */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Hardware Quick-Tap Badge Simulator:
              </div>
              <div className="flex flex-wrap gap-2">
                {students.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleRfidScan(s.rfidTag || `RFID-${s.department_id}`)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-semibold text-slate-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{s.name} ({s.rfidTag || `RFID-${s.department_id}`})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Scan Log Feed Confirmation Card */}
            {kioskScanLog && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1 animate-fadeIn shadow-xs">
                <div className="font-bold text-sm flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                  <span>{kioskScanLog.action} SUCCESSFUL</span>
                </div>
                <div>Student Assistant: <strong>{kioskScanLog.name}</strong> • Card UID: <code className="text-blue-700 font-mono bg-blue-50 px-1 rounded">{kioskScanLog.tag}</code></div>
                <div className="text-[11px] text-emerald-700 font-medium">Timestamp: {kioskScanLog.time}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// PAGE 3: AUDIT LOGS PAGE (/manager/attendance/logs)
const AuditLogsPage: React.FC<{
  attendanceRecords: any[];
  checkOutStudent: any;
  setScanSuccess: (msg: string | null) => void;
}> = ({ attendanceRecords, checkOutStudent, setScanSuccess }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchesSearch =
      rec.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.dutyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.rfidTag && rec.rfidTag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Active') return rec.shiftState === 'Checked_In';
    if (statusFilter === 'RFID') return rec.method === 'RFID_Scan';
    return rec.status === statusFilter;
  });

  return (
    <div className="card-enterprise p-6 space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Overall Attendance Log History & Verified Hours Audit</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete audit trail of all student shift attendance logs across all department duty slots.
          </p>
        </div>

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
            {['All', 'Active', 'Present', 'Late', 'Absent', 'RFID'].map((st) => (
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

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <th className="p-3 border-r border-slate-200">Date</th>
              <th className="p-3 border-r border-slate-200">Student Worker</th>
              <th className="p-3 border-r border-slate-200">Check-In / Out Timestamps</th>
              <th className="p-3 border-r border-slate-200 text-center">Status</th>
              <th className="p-3 border-r border-slate-200 text-center">Method</th>
              <th className="p-3 border-r border-slate-200 text-right">Hours</th>
              <th className="p-3 text-center">Shift Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50/60 transition-all">
                <td className="p-3 border-r border-slate-100 font-medium text-slate-900 whitespace-nowrap">
                  {rec.date}
                </td>
                <td className="p-3 border-r border-slate-100">
                  <div className="font-semibold text-slate-900">{rec.studentName}</div>
                  {rec.rfidTag && (
                    <div className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                      {rec.rfidTag}
                    </div>
                  )}
                </td>
                <td className="p-3 border-r border-slate-100">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <LogIn className="w-3 h-3" /> {rec.checkInTime || 'N/A'}
                    </span>
                    <span className="text-slate-300">→</span>
                    <span className={rec.shiftState === 'Checked_In' ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                      {rec.checkOutTime || 'Active / On Shift'}
                    </span>
                  </div>
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
                <td className="p-3 text-center">
                  {rec.shiftState === 'Checked_In' ? (
                    <button
                      type="button"
                      onClick={() => {
                        checkOutStudent(rec.id);
                        setScanSuccess(`Check-out logged for ${rec.studentName}.`);
                        setTimeout(() => setScanSuccess(null), 3000);
                      }}
                      className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      Check Out
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Completed</span>
                  )}
                </td>
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
  );
};

// MAIN CONTAINER COMPONENT WITH REACT ROUTER MULTI-PAGE SUB-ROUTING
export const AttendanceManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const { duties, students } = useDuties();
  const { attendanceRecords, checkInStudent, checkOutStudent, scanRfidCard } = useAttendance();

  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [rfidError, setRfidError] = useState<string | null>(null);

  // Metrics Calculations
  const totalLogs = attendanceRecords.length;
  const activeCheckedInCount = attendanceRecords.filter((r) => r.shiftState === 'Checked_In').length;
  const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'Late').length;
  const totalHours = attendanceRecords.reduce((acc, r) => acc + (r.status !== 'Absent' ? r.hoursCompleted : 0), 0);
  const presentRate = totalLogs > 0 ? Math.round(((presentCount + lateCount) / totalLogs) * 100) : 100;

  return (
    <div className="space-y-6 text-left pb-8">
      {/* Toast Feedback */}
      {scanSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{scanSuccess}</span>
          </div>
          <button type="button" onClick={() => setScanSuccess(null)} className="text-slate-400 hover:text-slate-600 text-base">
            ×
          </button>
        </div>
      )}

      {rfidError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{rfidError}</span>
          </div>
          <button type="button" onClick={() => setRfidError(null)} className="text-slate-400 hover:text-slate-600 text-base">
            ×
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            <span>Duty Shift Attendance & RFID Kiosk</span>
          </h1>
          <p className="text-xs text-slate-500">
            Clean Light Mode multi-page portal with dedicated Full-Screen RFID Kiosk Subpage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/manager/attendance/rfid-kiosk')}
            className="text-xs gap-1.5 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold"
          >
            <Radio className="w-4 h-4 text-emerald-600" />
            <span>Open RFID Kiosk Subpage</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/manager/attendance/logs')}
            className="text-xs gap-1.5"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>View Audit Logs</span>
          </Button>

          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            {activeCheckedInCount} Currently On Duty
          </span>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-enterprise p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Currently Checked In</div>
            <div className="text-lg font-bold text-emerald-700">{activeCheckedInCount} Workers</div>
          </div>
        </div>

        <div className="card-enterprise p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Punctuality Rate</div>
            <div className="text-lg font-bold text-blue-900">{presentRate}%</div>
          </div>
        </div>

        <div className="card-enterprise p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Late Check-Ins</div>
            <div className="text-lg font-bold text-amber-600">{lateCount} Shifts</div>
          </div>
        </div>

        <div className="card-enterprise p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Verified Hours</div>
            <div className="text-lg font-bold text-indigo-900">{totalHours.toFixed(1)} Hrs</div>
          </div>
        </div>
      </div>

      {/* REACT ROUTER MULTI-PAGE SUB-ROUTES */}
      <Routes>
        {/* Page 1: /manager/attendance */}
        <Route path="/" element={<DutySlotsListPage duties={duties} />} />

        {/* Page 2: /manager/attendance/duty/:dutyId */}
        <Route
          path="/duty/:dutyId"
          element={
            <ShiftAttendancePage
              duties={duties}
              students={students}
              attendanceRecords={attendanceRecords}
              checkInStudent={checkInStudent}
              checkOutStudent={checkOutStudent}
              scanRfidCard={scanRfidCard}
              setScanSuccess={setScanSuccess}
              setRfidError={setRfidError}
            />
          }
        />

        {/* Dedicated RFID Kiosk Subpage: /manager/attendance/rfid-kiosk */}
        <Route
          path="/rfid-kiosk"
          element={
            <FullScreenRfidKioskPage
              duties={duties}
              students={students}
              scanRfidCard={scanRfidCard}
            />
          }
        />

        {/* Page 3: /manager/attendance/logs */}
        <Route
          path="/logs"
          element={
            <AuditLogsPage
              attendanceRecords={attendanceRecords}
              checkOutStudent={checkOutStudent}
              setScanSuccess={setScanSuccess}
            />
          }
        />
      </Routes>
    </div>
  );
};
