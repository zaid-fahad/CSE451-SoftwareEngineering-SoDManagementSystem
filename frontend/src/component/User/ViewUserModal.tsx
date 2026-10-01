import React from "react";
import { X, Mail, Hash, ShieldCheck, CreditCard, CheckCircle2, Edit, Power, Trash2, KeyRound } from "lucide-react";
import { Button } from "../UI/Button";
import { User as UserModel } from "../../model/user";

interface ViewUserModalProps {
  isOpen: boolean;
  user: UserModel | null;
  onClose: () => void;
  onEdit?: (user: UserModel) => void;
  onProgramRfid?: (user: UserModel) => void;
  onToggleStatus?: (userId: string, name: string, isActive: boolean) => void;
  onChangePassword?: (user: UserModel) => void;
  onDelete?: (userId: string, name: string) => void;
  isDeptManager?: boolean;
}

export const ViewUserModal: React.FC<ViewUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onEdit,
  onProgramRfid,
  onToggleStatus,
  onChangePassword,
  onDelete,
  isDeptManager = false,
}) => {
  if (!isOpen || !user) return null;

  const isActive = user.isActive !== false;
  const rfidTag = user.rfidTag || ("RFID-" + user.department_id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden text-left animate-fadeIn">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">{user.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 font-mono">ID: {user.department_id}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status & Role Pill Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Role</span>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100/70 border border-blue-200 text-blue-800 font-bold text-xs uppercase">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Status</span>
              <div className="flex items-center gap-1.5">
                {isActive ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs uppercase">
                    Deactivated
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Attributes Section */}
          <div className="space-y-3 rounded-xl border border-slate-200 p-4 bg-white shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Identity & Contact Credentials
            </h4>

            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> University Email
              </span>
              <span className="font-semibold text-slate-900">{user.email}</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Department Identifier
              </span>
              <span className="font-mono font-semibold text-slate-900">{user.department_id}</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1.5">
              <span className="text-slate-500 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Assigned RFID Badge UID
              </span>
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {rfidTag}
              </span>
            </div>
          </div>

          {/* System Telemetry & Duty Highlights */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-2">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Department Authorization Summary</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              This user has authenticated authorization to access departmental schedule management, time-tracking kiosk logging, and duty assignments for their declared role.
            </p>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div>
            {onDelete && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onDelete(user.id, user.name);
                }}
                className="!py-1.5 !px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 gap-1.5"
                title="Delete User Profile"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onToggleStatus && (
              <Button
                variant="outline"
                onClick={() => onToggleStatus(user.id, user.name, isActive)}
                className={`!py-1.5 !px-3 text-xs gap-1.5 ${
                  isActive
                    ? 'text-amber-800 border-amber-300 hover:bg-amber-100'
                    : 'text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
                title={isActive ? 'Deactivate Account' : 'Activate Account'}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isActive ? 'Deactivate' : 'Activate'}</span>
              </Button>
            )}

            {onProgramRfid && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onProgramRfid(user);
                }}
                className="!py-1.5 !px-3 text-xs gap-1.5"
                title="Assign / Reassign RFID Badge UID"
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>RFID Badge</span>
              </Button>
            )}

            {isDeptManager && onChangePassword && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onChangePassword(user);
                }}
                className="!py-1.5 !px-3 text-xs text-amber-800 border-amber-300 hover:bg-amber-50 gap-1.5"
                title="Change User Password (Dept Manager Only)"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>Password</span>
              </Button>
            )}

            {onEdit && (
              <Button
                variant="primary"
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                className="!py-1.5 !px-3.5 text-xs gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
