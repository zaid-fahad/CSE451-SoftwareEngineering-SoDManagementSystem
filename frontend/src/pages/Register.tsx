import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building, IdCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../layout/AuthLayout';
import { Input } from '../component/UI/Input';
import { Button } from '../component/UI/Button';
import { useAuth } from '../services/useAuth';
import { UserRole } from '../model/user';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    departmentId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student' as UserRole,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.departmentId.trim()) {
      newErrors.departmentId = 'Department ID is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMsg(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await register({
        department_id: formData.departmentId,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.message || 'Registration failed. Department ID or Email may already exist.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Enter your departmental information to register"
    >
      {apiError && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{apiError}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Department ID"
            name="departmentId"
            placeholder="e.g. 2021-1-60-001"
            icon={IdCard}
            value={formData.departmentId}
            onChange={handleChange}
            error={errors.departmentId}
          />

          <Input
            label="Full Name"
            name="name"
            placeholder="John Doe"
            icon={User}
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="student@univ.edu"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
        </div>

        {/* Role Selection */}
        <div className="flex flex-col space-y-1.5 w-full text-left">
          <label htmlFor="role" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            User Role
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Building className="w-4 h-4" />
            </div>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-white text-slate-900 text-sm rounded-md py-2.5 pl-9 pr-3 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors duration-150 appearance-none cursor-pointer"
            >
              <option value="Student">Student (Default)</option>
              <option value="Faculty">Faculty Member</option>
              <option value="LabManager">Lab Manager</option>
              <option value="DeptManager">Department Manager</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Complete Registration
          </Button>
        </div>
      </form>

      <div className="mt-5 text-center text-xs text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};
