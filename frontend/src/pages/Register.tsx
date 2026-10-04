import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, IdCard, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { AuthLayout } from '../layout/AuthLayout';
import { Input } from '../component/UI/Input';
import { Button } from '../component/UI/Button';
import { useAuth } from '../services/useAuth';
import { UserRole } from '../model/user';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const semesterParam = searchParams.get('semester');
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

      if (formData.role === 'Student') {
        setSuccessMsg('Account registered! Student accounts require Department Manager approval.');
        setTimeout(() => {
          navigate('/pending-approval');
        }, 1200);
      } else {
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.message || 'Registration failed. Department ID or Email may already exist.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!semesterParam) {
    return (
      <AuthLayout
        title="Registration Restricted"
        subtitle="Invitation or Onboarding Link Required"
      >
        <div className="space-y-4 text-left">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Public Self-Registration is Restricted</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Open self-registration without departmental context is turned off. Access is exclusively granted through role-specific onboarding links:
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-2.5">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 text-[10px]">
                1
              </div>
              <div>
                <strong className="text-slate-900">Student Assistants:</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Must register via the active <em>Semester Student Onboarding Link</em> shared by your Department Manager.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1 border-t border-slate-200">
              <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0 text-[10px]">
                2
              </div>
              <div>
                <strong className="text-slate-900">Faculty Members:</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Must register via a tokenized <em>Faculty Invitation Link</em> provided by your Department Manager.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link to="/login">
              <Button type="button" fullWidth variant="primary" className="text-xs">
                Return to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={`Join ${semesterParam}`}
      subtitle={`Student Assistant Onboarding for ${semesterParam}`}
    >
      <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          Registering for <strong>{semesterParam}</strong> assistant duties. New student submissions will be queued for Department Manager approval.
        </span>
      </div>

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
            label="Department ID / Student ID"
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

        {/* Locked Student Role */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">Assigned System Role</span>
          <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
            Student Assistant
          </span>
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Complete Student Registration
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
