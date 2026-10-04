import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, IdCard, AlertCircle, CheckCircle2, ShieldCheck, RotateCcw } from 'lucide-react';
import { AuthLayout } from '../layout/AuthLayout';
import { Input } from '../component/UI/Input';
import { Button } from '../component/UI/Button';
import { api } from '../services/api';
import { useAuth } from '../services/useAuth';

export const FacultyRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { login } = useAuth();

  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [tokenValid, setTokenValid] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    departmentId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setTokenError('Missing invitation token in registration link.');
        setIsValidating(false);
        return;
      }

      try {
        const res = await api.get<{ valid: boolean; role: string; message?: string }>(
          `/auth/invites/validate?token=${encodeURIComponent(token)}`
        );
        if (res.data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setTokenError(res.data.message || 'Invalid or expired invitation token.');
        }
      } catch (err: any) {
        setTokenValid(false);
        setTokenError('Unable to verify invitation token. Please check your network or link.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.departmentId.trim()) {
      newErrors.departmentId = 'Department ID is required (e.g. FAC-001)';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid institutional email';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await api.post('/auth/register/faculty', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        department_id: formData.departmentId.trim(),
        password: formData.password,
        token: token,
      });

      // Automatically log the newly registered faculty member in
      try {
        await login({
          email: formData.email.trim(),
          password: formData.password,
        });
      } catch {
        // If auto-login fails, proceed to redirect
      }

      setSuccessMsg('Faculty account registered! Your account is pending Department Manager approval.');
      setTimeout(() => {
        navigate('/pending-approval');
      }, 1200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || err.message || 'Registration failed. Department ID or Email may already exist.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <AuthLayout title="Faculty Registration" subtitle="Verifying invitation link...">
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
          <RotateCcw className="w-8 h-8 animate-spin text-purple-600" />
          <span className="text-xs font-semibold">Validating token authenticity...</span>
        </div>
      </AuthLayout>
    );
  }

  if (!tokenValid) {
    return (
      <AuthLayout title="Registration Restricted" subtitle="Invitation verification failed">
        <div className="space-y-4 text-left">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{tokenError || 'Invalid or Expired Invitation'}</span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              Faculty self-registration requires an active tokenized invitation link. This link is either invalid, already used, or has expired.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-2">
            <div className="font-bold text-slate-800">What should you do?</div>
            <p className="leading-relaxed">
              Please contact your Department Manager or Department Office to request a fresh invitation link.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/login">
              <Button type="button" fullWidth variant="outline" className="text-xs">
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
      title="Faculty Registration"
      subtitle="Complete your departmental faculty account profile"
    >
      <div className="mb-4 p-3 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
        <span>
          Verified Token: Registering as <strong>Faculty Member</strong>. Account will be queued for Department Manager approval.
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
            label="Department ID / Faculty ID"
            name="departmentId"
            placeholder="e.g. FAC-001"
            icon={IdCard}
            value={formData.departmentId}
            onChange={handleChange}
            error={errors.departmentId}
          />

          <Input
            label="Full Name & Title"
            name="name"
            placeholder="Dr. Alan Turing"
            icon={User}
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />
        </div>

        <Input
          label="Institutional Email Address"
          type="email"
          name="email"
          placeholder="faculty@univ.edu"
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

        {/* Fixed Role Display */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">Assigned System Role</span>
          <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
            Faculty Member
          </span>
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth isLoading={isSubmitting} className="!bg-purple-600 hover:!bg-purple-700">
            Complete Faculty Registration
          </Button>
        </div>
      </form>

      <div className="mt-5 text-center text-xs text-slate-600">
        Already have an active account?{' '}
        <Link to="/login" className="text-purple-600 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};
