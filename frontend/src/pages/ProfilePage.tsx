import React, { useState } from "react";
import { useAuth } from "../services/useAuth";
import {
  User,
  Mail,
  Hash,
  CreditCard,
  Lock,
  Edit,
  CheckCircle2,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "../component/UI/Button";
import { EditProfileModal } from "../component/User/EditProfileModal";
import { ChangePasswordModal } from "../component/User/ChangePasswordModal";

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="card-enterprise p-8 text-center text-slate-500 text-sm">
        Please sign in to view your profile.
      </div>
    );
  }

  const role = user.role || "Student";
  const rfidTag = user.rfidTag || `RFID-${user.department_id}`;
  const isActive = user.isActive !== false;

  const roleLabel =
    role === "DeptManager"
      ? "Department Manager"
      : role === "LabManager"
      ? "Lab Manager"
      : role === "Faculty"
      ? "Faculty Member"
      : "Student TA / RA";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSaveProfile = async (data: { name: string; email: string }) => {
    await updateProfile(data);
    setFeedbackMsg("Profile details updated successfully.");
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleChangePassword = async (data: { current_password: string; new_password: string }) => {
    await changePassword(data);
    setFeedbackMsg("Password updated successfully.");
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="card-enterprise p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {roleLabel}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    isActive
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : "text-rose-700 bg-rose-50 border-rose-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="!py-2 !px-4 text-xs gap-1.5 self-start sm:self-auto"
          >
            <Edit className="w-3.5 h-3.5 text-blue-600" />
            <span>Edit Profile</span>
          </Button>
        </div>

        {/* Profile Information List */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Account Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
                </span>
                <span className="font-semibold text-slate-900 block text-sm">{user.name}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                </span>
                <span className="font-semibold text-slate-900 block text-sm">{user.email}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(user.email, "email")}
                className="text-slate-400 hover:text-blue-600 p-1 cursor-pointer transition-colors"
                title="Copy Email"
              >
                {copiedField === "email" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" /> Department ID
                </span>
                <span className="font-mono font-semibold text-slate-900 block text-sm">
                  {user.department_id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(user.department_id, "deptId")}
                className="text-slate-400 hover:text-blue-600 p-1 cursor-pointer transition-colors"
                title="Copy Department ID"
              >
                {copiedField === "deptId" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" /> RFID Badge UID
                </span>
                <span className="font-mono font-semibold text-blue-700 block text-sm">
                  {rfidTag}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(rfidTag, "rfidTag")}
                className="text-slate-400 hover:text-blue-600 p-1 cursor-pointer transition-colors"
                title="Copy RFID Tag"
              >
                {copiedField === "rfidTag" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Password Card */}
      <div className="card-enterprise p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <span>Security & Password</span>
            </h2>
            <p className="text-xs text-slate-500">
              Manage your password and secure your portal access.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsPasswordModalOpen(true)}
            className="!py-2 !px-4 text-xs gap-1.5 self-start sm:self-auto"
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span>Change Password</span>
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Current Password</span>
          <span className="font-mono text-slate-600 tracking-widest text-sm">••••••••••••</span>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialName={user.name}
        initialEmail={user.email}
        onSave={handleSaveProfile}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onChangePassword={handleChangePassword}
      />
    </div>
  );
};
