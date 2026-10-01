import React, { useState, useEffect } from 'react';
import { X, Edit, AlertCircle, CreditCard, ShieldCheck } from 'lucide-react';
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
    rfidTag: '',
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
        rfidTag: user.rfidTag || `RFID-${user.department_id}`,
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

    onUpdateUser(user.id, {
      ...formData,
      rfidTag: formData.rfidTag ? formData.rfidTag.trim().toUpperCase() : `RFID-${formData.department_id}`,
    });
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

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Department ID"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
            />

            <Input
              label="RFID Badge UID"
              name="rfidTag"
              icon={CreditCard}
              placeholder="e.g. RFID-001"
              value={formData.rfidTag || ''}
              onChange={handleChange}
            />
          </div>

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

          {/* Active Account Switch UI */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${formData.isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Account Status</span>
                <span className="text-[11px] text-slate-500 block">
                  {formData.isActive ? 'Active — User can sign in and accept duty shifts' : 'Deactivated — User cannot log in'}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
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
