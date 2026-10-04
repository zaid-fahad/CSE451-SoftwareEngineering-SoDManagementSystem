import React, { useState, useEffect, useMemo } from 'react';
import { useUserManagement, AddUserPayload, UpdateUserPayload } from '../services/useUserManagement';
import { useAuth } from '../services/useAuth';
import { useSemesters } from '../context/SemesterContext';
import { AddUserModal } from '../component/User/AddUserModal';
import { EditUserModal } from '../component/User/EditUserModal';
import { ViewUserModal } from '../component/User/ViewUserModal';
import { ResetUserPasswordModal } from '../component/User/ResetUserPasswordModal';
import { Button } from '../component/UI/Button';
import { Input } from '../component/UI/Input';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Filter,
  Eye,
  Copy,
  Check,
  CreditCard,
  Clock,
  CheckCheck,
  XCircle,
  Share2,
  GraduationCap,
} from 'lucide-react';
import { User } from '../model/user';
import { DataTable, ColumnDef } from '../component/UI/DataTable';
import { ShareFacultyInviteModal } from '../component/User/ShareFacultyInviteModal';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const isDeptManager = currentUser?.role === 'DeptManager';

  const {
    users,
    pendingStudents,
    pendingFaculty,
    approveStudent,
    rejectStudent,
    approveFaculty,
    rejectFaculty,
    addUser,
    updateUser,
    assignRfidToUser,
    toggleUserStatus,
    deleteUser,
    resetUserPassword,
  } = useUserManagement();

  const { semesters, activeSemester } = useSemesters();
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  useEffect(() => {
    if (activeSemester && !selectedSemester) {
      setSelectedSemester(activeSemester.name);
    }
  }, [activeSemester, selectedSemester]);

  const [activeTab, setActiveTab] = useState<'directory' | 'pending'>('directory');
  const [pendingSubTab, setPendingSubTab] = useState<'students' | 'faculty'>('students');
  const [isFacultyInviteModalOpen, setIsFacultyInviteModalOpen] = useState<boolean>(false);
  const [pendingHoursLimits, setPendingHoursLimits] = useState<Record<string, number>>({});
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedRfid, setCopiedRfid] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | null>(null);
  const [programmingUser, setProgrammingUser] = useState<User | null>(null);
  const [rfidInput, setRfidInput] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.isActive !== false).length;
  const deactiveCount = users.filter((u) => u.isActive === false).length;

  const handleApproveStudent = async (student: User) => {
    setActionLoadingId(student.id);
    const limit = pendingHoursLimits[student.id] ?? student.weekly_hours_limit ?? 10.0;
    try {
      await approveStudent(student.id, limit);
      setToastMsg(`Approved ${student.name} with ${limit} hrs/week limit!`);
      setTimeout(() => setToastMsg(null), 3500);
    } catch {
      setToastMsg(`Failed to approve ${student.name}.`);
      setTimeout(() => setToastMsg(null), 3500);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectStudent = async (student: User) => {
    if (!confirm(`Are you sure you want to reject onboarding for ${student.name}?`)) return;
    setActionLoadingId(student.id);
    try {
      await rejectStudent(student.id);
      setToastMsg(`Registration for ${student.name} rejected.`);
      setTimeout(() => setToastMsg(null), 3500);
    } catch {
      setToastMsg(`Failed to reject ${student.name}.`);
      setTimeout(() => setToastMsg(null), 3500);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApproveFacultyMember = async (faculty: User) => {
    setActionLoadingId(faculty.id);
    try {
      await approveFaculty(faculty.id);
      setToastMsg(`Approved faculty account for ${faculty.name}!`);
      setTimeout(() => setToastMsg(null), 3500);
    } catch {
      setToastMsg(`Failed to approve faculty ${faculty.name}.`);
      setTimeout(() => setToastMsg(null), 3500);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectFacultyMember = async (faculty: User) => {
    if (!confirm(`Are you sure you want to reject registration for ${faculty.name}?`)) return;
    setActionLoadingId(faculty.id);
    try {
      await rejectFaculty(faculty.id);
      setToastMsg(`Registration for ${faculty.name} rejected.`);
      setTimeout(() => setToastMsg(null), 3500);
    } catch {
      setToastMsg(`Failed to reject faculty ${faculty.name}.`);
      setTimeout(() => setToastMsg(null), 3500);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyRfid = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedRfid(tag);
    setTimeout(() => setCopiedRfid(null), 2500);
  };

  const handleAddUser = async (payload: AddUserPayload) => {
    await addUser(payload);
    setToastMsg(`User profile for ${payload.name} created successfully!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleUpdateUser = (userId: string, payload: UpdateUserPayload) => {
    updateUser(userId, payload);
    setToastMsg(`User profile for ${payload.name} updated successfully!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAssignRfidTag = (userId: string, userName: string) => {
    if (!rfidInput.trim()) return;
    assignRfidToUser(userId, rfidInput);
    setToastMsg(`RFID Badge UID '${rfidInput.trim().toUpperCase()}' linked to ${userName}!`);
    setProgrammingUser(null);
    setRfidInput('');
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleStatus = (userId: string, name: string, isCurrentlyActive: boolean) => {
    toggleUserStatus(userId);
    setToastMsg(`User ${name} has been ${isCurrentlyActive ? 'deactivated' : 'activated'}.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (confirm(`Are you sure you want to delete user profile '${name}'?`)) {
      deleteUser(userId);
      setToastMsg(`User profile '${name}' deleted.`);
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    await resetUserPassword(userId, newPassword);
    if (passwordTargetUser) {
      setToastMsg(`Password for ${passwordTargetUser.name} updated successfully!`);
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  // Filtered dataset based on role and status
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && u.isActive === false) return false;
      if (statusFilter === 'deactivated' && u.isActive !== false) return false;
      return true;
    });
  }, [users, roleFilter, statusFilter]);

  const columns: ColumnDef<User>[] = [
    {
      key: 'name',
      header: 'User Info',
      sortable: true,
      accessor: (u) => u.name,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-slate-900 text-sm leading-tight truncate">{u.name}</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {u.department_id}</div>
            <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'rfidTag',
      header: 'Assigned RFID Badge UID',
      sortable: true,
      accessor: (u) => u.rfidTag || `RFID-${u.department_id}`,
      render: (u) => {
        const tag = u.rfidTag || `RFID-${u.department_id}`;
        const isCopied = copiedRfid === tag;
        return (
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {tag}
            </span>
            <button
              type="button"
              onClick={() => handleCopyRfid(tag)}
              className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              title="Copy RFID Tag UID"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      align: 'center',
      accessor: (u) => u.role,
      render: (u) => {
        const badgeStyles: Record<string, string> = {
          Student: 'bg-blue-50 text-blue-700 border-blue-200',
          Faculty: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          LabManager: 'bg-purple-50 text-purple-700 border-purple-200',
          DeptManager: 'bg-amber-50 text-amber-800 border-amber-300',
        };
        return (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              badgeStyles[u.role] || 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {u.role}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      align: 'center',
      accessor: (u) => (u.isActive !== false ? 'Active' : 'Deactivated'),
      render: (u) => {
        const isActive = u.isActive !== false;
        return isActive ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Deactivated
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (u) => (
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewingUser(u);
            }}
            className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            title="View User Details & Actions"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>View Details</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="card-enterprise p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Department User & RFID Badge Administration</span>
          </h1>
          <p className="text-xs text-slate-500">
            Create new department users, assign physical RFID badge UIDs, edit roles, and manage account statuses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Semester Context Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">Semester:</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="bg-transparent font-bold text-blue-700 outline-none cursor-pointer"
            >
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.name}>
                  {sem.name} {sem.is_active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {isDeptManager && (
            <Button
              variant="outline"
              onClick={() => setIsFacultyInviteModalOpen(true)}
              className="!py-2 !px-3.5 text-xs gap-1.5 self-start sm:self-auto !text-purple-700 !border-purple-200 hover:!bg-purple-50 font-semibold"
            >
              <Share2 className="w-4 h-4 text-purple-600" />
              <span>Invite Faculty</span>
            </Button>
          )}

          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="!py-2 !px-4 text-xs gap-1.5 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </Button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Directory</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'directory' ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Approvals</span>
          {pendingStudents.length + pendingFaculty.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
              {pendingStudents.length + pendingFaculty.length}
            </span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'pending' ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700'
              }`}
            >
              0
            </span>
          )}
        </button>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-enterprise p-4 space-y-1 bg-blue-50/40 border-blue-200">
              <span className="text-xs font-semibold text-slate-500">Total Enrolled Accounts</span>
              <div className="text-2xl font-bold text-blue-900">{totalUsers} Users</div>
            </div>

            <div className="card-enterprise p-4 space-y-1 bg-emerald-50/40 border-emerald-200">
              <span className="text-xs font-semibold text-slate-500">Active Accounts</span>
              <div className="text-2xl font-bold text-emerald-900">{activeCount} Active</div>
            </div>

            <div className="card-enterprise p-4 space-y-1 bg-amber-50/40 border-amber-200">
              <span className="text-xs font-semibold text-slate-500">Deactivated Accounts</span>
              <div className="text-2xl font-bold text-amber-900">{deactiveCount} Deactivated</div>
            </div>
          </div>

          {/* Modern Enterprise DataTable */}
          <DataTable<User>
            title="User Directory"
            icon={<Users className="w-4 h-4 text-blue-600" />}
            data={filteredUsers}
            columns={columns}
            rowKey={(u) => u.id}
            searchPlaceholder="Search user, email, RFID tag, role..."
            searchKeys={[
              'name',
              'email',
              'department_id',
              'role',
              (u) => u.rfidTag || `RFID-${u.department_id}`,
            ]}
            initialSortKey="name"
            initialPageSize={10}
            onRowClick={(u) => setViewingUser(u)}
            toolbarActions={
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-500">Role:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="LabManager">Lab Manager</option>
                    <option value="DeptManager">Dept Manager</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-500">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="deactivated">Deactivated Only</option>
                  </select>
                </div>
              </div>
            }
          />
        </>
      ) : (
        <div className="space-y-4">
          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setPendingSubTab('students')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                pendingSubTab === 'students'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Applicants</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                pendingSubTab === 'students' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {pendingStudents.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPendingSubTab('faculty')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                pendingSubTab === 'faculty'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Faculty Applicants</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                pendingSubTab === 'faculty' ? 'bg-purple-900 text-purple-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {pendingFaculty.length}
              </span>
            </button>
          </div>

          {pendingSubTab === 'students' ? (
            <>
              <div className="card-enterprise p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/50 border-amber-200">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Pending Student Assistant Registrations ({pendingStudents.length})</span>
                  </h2>
                  <p className="text-xs text-amber-800">
                    Self-registered student assistants require department verification and weekly duty hour allocation before they can claim duty shifts.
                  </p>
                </div>
                <div className="text-xs font-semibold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg">
                  Standard Default Quota: 10.0 hrs/week
                </div>
              </div>

              {pendingStudents.length === 0 ? (
                <div className="card-enterprise p-12 text-center space-y-3 bg-white">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">All Student Registrations Processed</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    There are no student assistant applications currently awaiting approval. When new students sign up via the semester onboarding link, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="card-enterprise overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">Student Details</th>
                          <th className="py-3.5 px-4">Institutional Email</th>
                          <th className="py-3.5 px-4 text-center">Assigned Role</th>
                          <th className="py-3.5 px-4 text-center">Weekly Hours Limit</th>
                          <th className="py-3.5 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingStudents.map((s) => {
                          const limit = pendingHoursLimits[s.id] ?? s.weekly_hours_limit ?? 10.0;
                          const isLoadingAction = actionLoadingId === s.id;
                          return (
                            <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                                    {s.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm leading-tight">{s.name}</div>
                                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {s.department_id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-600">
                                {s.email}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-blue-50 text-blue-700 border-blue-200">
                                  {s.role}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1">
                                  <input
                                    type="number"
                                    min="1"
                                    max="40"
                                    step="0.5"
                                    value={limit}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      setPendingHoursLimits((prev) => ({
                                        ...prev,
                                        [s.id]: isNaN(val) ? 10.0 : val,
                                      }));
                                    }}
                                    className="w-14 bg-transparent font-bold text-slate-800 text-xs outline-none text-right"
                                  />
                                  <span className="text-[11px] font-medium text-slate-500">hrs/wk</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    type="button"
                                    variant="primary"
                                    onClick={() => handleApproveStudent(s)}
                                    disabled={isLoadingAction}
                                    className="!py-1 !px-3 text-xs gap-1 font-semibold !bg-emerald-600 hover:!bg-emerald-700 text-white"
                                  >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleRejectStudent(s)}
                                    disabled={isLoadingAction}
                                    className="!py-1 !px-3 text-xs gap-1 font-semibold text-rose-700 border-rose-200 hover:bg-rose-50"
                                  >
                                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Reject</span>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="card-enterprise p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-purple-50/50 border-purple-200">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <span>Pending Faculty Registrations ({pendingFaculty.length})</span>
                  </h2>
                  <p className="text-xs text-purple-800">
                    Faculty who self-registered via an invite link require department verification before portal and roster permissions are activated.
                  </p>
                </div>
                {isDeptManager && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFacultyInviteModalOpen(true)}
                    className="!py-1.5 !px-3 text-xs gap-1.5 !text-purple-700 !border-purple-200 hover:!bg-purple-100 font-semibold shrink-0"
                  >
                    <Share2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Generate New Invite</span>
                  </Button>
                )}
              </div>

              {pendingFaculty.length === 0 ? (
                <div className="card-enterprise p-12 text-center space-y-3 bg-white">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                    <CheckCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">No Pending Faculty Applications</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    There are no faculty members currently awaiting verification. Use the "Invite Faculty" button to generate a single-use onboarding link.
                  </p>
                </div>
              ) : (
                <div className="card-enterprise overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">Faculty Member</th>
                          <th className="py-3.5 px-4">Institutional Email</th>
                          <th className="py-3.5 px-4 text-center">Assigned Role</th>
                          <th className="py-3.5 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingFaculty.map((f) => {
                          const isLoadingAction = actionLoadingId === f.id;
                          return (
                            <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0">
                                    {f.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm leading-tight">{f.name}</div>
                                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {f.department_id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-600">
                                {f.email}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-purple-50 text-purple-700 border-purple-200">
                                  {f.role}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    type="button"
                                    variant="primary"
                                    onClick={() => handleApproveFacultyMember(f)}
                                    disabled={isLoadingAction}
                                    className="!py-1 !px-3 text-xs gap-1 font-semibold !bg-emerald-600 hover:!bg-emerald-700 text-white"
                                  >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleRejectFacultyMember(f)}
                                    disabled={isLoadingAction}
                                    className="!py-1 !px-3 text-xs gap-1 font-semibold text-rose-700 border-rose-200 hover:bg-rose-50"
                                  >
                                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Reject</span>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Program RFID Card Modal */}
      {programmingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-enterprise max-w-md w-full p-6 space-y-4 bg-white shadow-2xl animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Assign RFID Badge to {programmingUser.name}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Type or scan the physical RFID Card UID to pair it with this user account.
            </p>

            <div className="space-y-3">
              <Input
                label="RFID Card Badge UID / Serial"
                type="text"
                placeholder="e.g. RFID-2021-001"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setProgrammingUser(null);
                  setRfidInput('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleAssignRfidTag(programmingUser.id, programmingUser.name)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Assign RFID Badge
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ViewUserModal
        isOpen={!!viewingUser}
        user={viewingUser}
        onClose={() => setViewingUser(null)}
        onEdit={(u) => setEditingUser(u)}
        onProgramRfid={(u) => {
          setProgrammingUser(u);
          setRfidInput(u.rfidTag || `RFID-${u.department_id}`);
        }}
        onToggleStatus={handleToggleStatus}
        onChangePassword={(u) => setPasswordTargetUser(u)}
        onDelete={handleDeleteUser}
        isDeptManager={isDeptManager}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddUser={handleAddUser}
      />

      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdateUser={handleUpdateUser}
      />

      <ResetUserPasswordModal
        isOpen={!!passwordTargetUser}
        user={passwordTargetUser}
        onClose={() => setPasswordTargetUser(null)}
        onResetPassword={handleResetPassword}
      />

      <ShareFacultyInviteModal
        isOpen={isFacultyInviteModalOpen}
        onClose={() => setIsFacultyInviteModalOpen(false)}
      />
    </div>
  );
};
