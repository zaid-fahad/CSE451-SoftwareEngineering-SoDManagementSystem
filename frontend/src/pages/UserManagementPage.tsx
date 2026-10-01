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
} from 'lucide-react';
import { User } from '../model/user';
import { DataTable, ColumnDef } from '../component/UI/DataTable';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const isDeptManager = currentUser?.role === 'DeptManager';

  const {
    users,
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
    </div>
  );
};
