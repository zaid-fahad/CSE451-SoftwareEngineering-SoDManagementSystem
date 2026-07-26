import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { AddUserPayload } from '../../services/useUserManagement';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (payload: AddUserPayload) => Promise<any>;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onAddUser,
}) => {
  const [formData, setFormData] = useState<AddUserPayload>({
    name: '',
    email: '',
    department_id: '',
    role: 'Student',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.department_id.trim()) {
      setError('Please fill in all user profile details.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddUser(formData);
      onClose();
      setFormData({
        name: '',
        email: '',
        department_id: '',
        role: 'Student',
      });
    } catch {
      setError('Failed to create new user profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden text-left animate-fadeIn">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Add New Department User</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Full Name"
            name="name"
            placeholder="e.g. Dr. John Doe"
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            label="University Email Address"
            type="email"
            name="email"
            placeholder="john.doe@univ.edu"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            label="Department ID / Roll No"
            name="department_id"
            placeholder="e.g. 2021-1-60-999 or FAC-009"
            value={formData.department_id}
            onChange={handleChange}
          />

          <div className="flex flex-col space-y-1.5 w-full text-left">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Assigned User Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'Student', label: 'Student Assistant' },
                { role: 'Faculty', label: 'Faculty Member' },
                { role: 'LabManager', label: 'Lab Manager' },
                { role: 'DeptManager', label: 'Dept Manager' },
              ].map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: r.role as any }))}
                  className={`py-2 px-3 rounded-md text-xs font-semibold cursor-pointer border transition-colors ${
                    formData.role === r.role
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="!py-2 !px-3 text-xs">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="!py-2 !px-4 text-xs">
              Create User Profile
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
