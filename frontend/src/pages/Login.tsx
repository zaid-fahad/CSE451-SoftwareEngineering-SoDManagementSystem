import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../layout/AuthLayout';
import { Input } from '../component/UI/Input';
import { Button } from '../component/UI/Button';
import { Mail, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your SoD schedule dashboard and portal"
    >
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="student@univ.edu"
          icon={Mail}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          icon={Lock}
        />
        <div className="pt-2">
          <Button type="submit" fullWidth>
            Sign In
          </Button>
        </div>
      </form>
      <div className="mt-6 text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
          Register Account
        </Link>
      </div>
    </AuthLayout>
  );
};
