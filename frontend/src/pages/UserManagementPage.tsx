import React, { useState } from 'react';
import { useUserManagement, AddUserPayload } from '../services/useUserManagement';
import { AddUserModal } from '../component/User/AddUserModal';
import { Button } from '../component/UI/Button';
import { Users, UserPlus, Search, CheckCircle2, ShieldCheck, Power, Trash2 } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { users, addUser, toggleUserStatus, deleteUser } = useUserManagement();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department_id.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.isActive !== false).length;
  const deactiveCount = users.filter((u) => u.isActive === false).length;

  const handleAddUser = async (payload: AddUserPayload) => {
    await addUser(payload);
    setToastMsg(`User profile for ${payload.name} created successfully!`);
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
            <span>Department User Administration</span>
          </h1>
          <p className="text-xs text-slate-500">
            Create new department users, manage roles, and activate or deactivate user accounts.
          </p>
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

      {/* Search Bar & Directory Table */}
      <div className="card-enterprise p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">User Account Directory</h3>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search user, email, ID or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs rounded-md py-2 pl-9 pr-3 border border-slate-300 focus:border-blue-600 outline-none"
            />
          </div>
        </div>

        {/* User Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="p-3 border-r border-slate-200">User Info</th>
                <th className="p-3 border-r border-slate-200">Email Address</th>
                <th className="p-3 border-r border-slate-200 text-center">Assigned Role</th>
                <th className="p-3 border-r border-slate-200 text-center">Account Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isActive = u.isActive !== false;

                return (
                  <tr key={u.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors">
                    
                    {/* User Info */}
                    <td className="p-3 border-r border-slate-200">
                      <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Dept ID: {u.department_id}</div>
                    </td>

                    {/* Email */}
                    <td className="p-3 border-r border-slate-200 font-medium text-slate-700">
                      {u.email}
                    </td>

                    {/* Role Badge */}
                    <td className="p-3 border-r border-slate-200 text-center">
                      <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-bold text-[10px] uppercase">
                        {u.role}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 border-r border-slate-200 text-center">
                      {isActive ? (
                        <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px] uppercase flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px] uppercase">
                          Deactivated
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.name, isActive)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                            isActive
                              ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddUser={handleAddUser}
      />
    </div>
  );
};
