import React, { useState, useEffect } from 'react';
import { X, Edit, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { User } from '../../model/user';
import { UpdateUserPayload } from '../../services/useUserManagement';

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onUpdateUser: (userId: string, payload: UpdateUserPayload) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdateUser,
}) => {
  const [formData, setFormData] = useState<UpdateUserPayload>({
    name: '',
    email: '',
    department_id: '',
    role: 'Student',
    isActive: true,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        department_id: user.department_id,
        role: user.role,
        isActive: user.isActive !== false,
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.department_id.trim()) {
      setError('Please fill in all user profile details.');
      return;
    }

    onUpdateUser(user.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden text-left animate-fadeIn">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Edit User Profile &mdash; {user.name}</h3>
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
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            label="University Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            label="Department ID / Roll No"
            name="department_id"
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

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Account Active (User can log in and accept duty assignments)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="!py-2 !px-3 text-xs">
              Cancel
            </Button>
            <Button type="submit" className="!py-2 !px-4 text-xs">
              Save Profile Changes
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
