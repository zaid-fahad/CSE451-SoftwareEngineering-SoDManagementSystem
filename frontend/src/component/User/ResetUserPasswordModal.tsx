import React, { useState } from "react";
import { X, KeyRound, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { User } from "../../model/user";

interface ResetUserPasswordModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onResetPassword: (userId: string, newPassword: string) => Promise<void> | void;
}

export const ResetUserPasswordModal: React.FC<ResetUserPasswordModalProps> = ({
  isOpen,
  user,
  onClose,
  onResetPassword,
}) => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onResetPassword(user.id, newPassword);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setNewPassword("");
        setConfirmPassword("");
        setSuccess(false);
      }, 1000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-left animate-fadeIn">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Change User Password</h3>
              <p className="text-[11px] text-slate-500">Department Manager Authorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target User Info Header */}
        <div className="px-5 py-3 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">User: </span>
            <span className="font-bold text-slate-900">{user.name}</span>
            <span className="text-slate-400 font-mono ml-1.5">({user.department_id})</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-blue-700 border border-blue-200">
            {user.role}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Password updated successfully for {user.name}!</span>
            </div>
          )}

          <Input
            label="New Password"
            type="password"
            placeholder="Enter minimum 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span>
              As a Department Manager, you are overriding this user&apos;s authentication credential. The user will need to log in using this new password.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="!py-2 !px-4 text-xs"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="!py-2 !px-4 text-xs"
              isLoading={isSubmitting}
            >
              Set New Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
