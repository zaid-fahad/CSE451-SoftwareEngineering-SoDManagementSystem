import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { Clock, ShieldAlert, CheckCircle2, RotateCcw, LogOut, User, Mail, IdCard, AlertCircle, Building2 } from 'lucide-react';
import { Button } from '../component/UI/Button';
import { CreditFooter } from '../component/Layout/CreditFooter';

export const PendingApprovalPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
        <RotateCcw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if ((user.role !== 'Student' && user.role !== 'Faculty') || user.approval_status === 'Approved') {
    return <Navigate to="/dashboard" replace />;
  }

  const isFaculty = user.role === 'Faculty';
  const isRejected = user.approval_status === 'Rejected';

  const handleCheckStatus = async () => {
    setChecking(true);
    setStatusMessage(null);
    try {
      const refreshed = await refreshUser();
      if (refreshed && refreshed.approval_status === 'Approved') {
        setStatusMessage('Your application has been approved! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else if (refreshed && refreshed.approval_status === 'Rejected') {
        setStatusMessage('Application status updated: Not Approved.');
      } else {
        setStatusMessage('Status checked: Your application is still pending review by the Department Manager.');
      }
    } catch {
      setStatusMessage('Unable to check status at this moment. Please try again later.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100 selection:bg-blue-600 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Department Institutional Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Department of Software Engineering
            </div>
            <div className="text-lg font-bold text-white tracking-tight">
              Student Assistant Portal
            </div>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
          {/* Status Icon & Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
            {isRejected ? (
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isRejected
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isRejected ? 'Application Rejected' : 'Verification In Progress'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1.5">
                {isRejected
                  ? 'Registration Not Approved'
                  : isFaculty
                  ? 'Faculty Registration Pending Department Approval'
                  : 'Application Pending Department Approval'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isRejected
                  ? 'Your onboarding request could not be approved by the Department Manager.'
                  : isFaculty
                  ? 'Your faculty profile has been created and is awaiting verification and portal access activation.'
                  : 'Your account has been created and is awaiting verification and weekly hour quota assignment.'}
              </p>
            </div>
          </div>

          {/* User Details Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                {isFaculty ? 'Faculty Name' : 'Student Name'}
              </span>
              <div className="font-bold text-white">{user.name}</div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1">
                <IdCard className="w-3 h-3 text-slate-400" />
                Department ID
              </span>
              <div className="font-mono font-bold text-blue-400">{user.department_id}</div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                Institutional Email
              </span>
              <div className="font-mono text-slate-300">{user.email}</div>
            </div>
          </div>

          {/* Status Feedback Notification */}
          {statusMessage && (
            <div className="p-3.5 rounded-lg bg-blue-950/50 border border-blue-800 text-blue-200 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Department Workflow Steps */}
          {!isRejected && (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2.5">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>What happens next?</span>
              </div>
              {isFaculty ? (
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400 leading-relaxed pl-1">
                  <li>
                    <strong>Manager Verification:</strong> The Department Manager reviews and confirms your departmental faculty appointment.
                  </li>
                  <li>
                    <strong>Portal Activation:</strong> Course management, room scheduling, and student duty oversight permissions will be unlocked.
                  </li>
                  <li>
                    <strong>Full Faculty Access:</strong> Once approved, you can immediately sign in to access the Faculty Portal and assign lab duties.
                  </li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400 leading-relaxed pl-1">
                  <li>
                    <strong>Manager Verification:</strong> The Department Manager reviews your student credentials against active course enrollment.
                  </li>
                  <li>
                    <strong>Weekly Limit Allocation:</strong> You will be assigned a contractual weekly hour limit (standard 10.0 hours/week).
                  </li>
                  <li>
                    <strong>Full Roster Access:</strong> Once approved, you can immediately access the Duty Manager, submit IRAS schedules, and claim payroll slots.
                  </li>
                </ol>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="w-full sm:w-auto text-xs gap-1.5 !text-slate-400 !border-slate-700 hover:!bg-slate-800"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>

            {!isRejected && (
              <Button
                type="button"
                variant="primary"
                onClick={handleCheckStatus}
                isLoading={checking}
                className="w-full sm:w-auto text-xs gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Check Approval Status</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      <CreditFooter className="mt-8 border-t-0 bg-transparent text-slate-400" />
    </div>
  );
};
