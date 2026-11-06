import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Shield, Lock, Mail, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { FeedbackBanner } from '../components/FeedbackBanner.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  // Controlled form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setApiError('');

    // Client-side validation
    if (!email.trim()) {
      setValidationError('Please enter your email address.');
      return;
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address format.');
      return;
    }
    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setApiError(result.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickLogin = async (role) => {
    setIsSubmitting(true);
    setValidationError('');
    setApiError('');
    const result = await quickLogin(role);
    setIsSubmitting(false);
    if (result.success) {
      navigate('/');
    } else {
      setApiError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xs p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-lg mb-3">
            15
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Project and Task Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            College Internal Evaluation Project · Project #15
          </p>
        </div>

        {/* Feedback Messages */}
        <FeedbackBanner
          type="error"
          message={validationError || apiError}
          onDismiss={() => {
            setValidationError('');
            setApiError('');
          }}
        />

        {/* Controlled Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                disabled={isSubmitting}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                disabled={isSubmitting}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In with JWT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Accounts for Examiner */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mb-2.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>1-Click Examiner Demo Logins:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('Admin')}
              className="p-2 text-left rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
            >
              <p className="font-semibold text-slate-800 text-[11px]">Admin</p>
              <p className="text-[10px] text-slate-500 truncate">admin@college.edu</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('Project Manager')}
              className="p-2 text-left rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
            >
              <p className="font-semibold text-slate-800 text-[11px]">Project Manager</p>
              <p className="text-[10px] text-slate-500 truncate">pm.rahul@college.edu</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('Team Member')}
              className="p-2 text-left rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
            >
              <p className="font-semibold text-slate-800 text-[11px]">Team Member (Dev)</p>
              <p className="text-[10px] text-slate-500 truncate">priya.dev@college.edu</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('QA Tester')}
              className="p-2 text-left rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
            >
              <p className="font-semibold text-slate-800 text-[11px]">Team Member (QA)</p>
              <p className="text-[10px] text-slate-500 truncate">arjun.qa@college.edu</p>
            </button>
          </div>
        </div>

        {/* Register link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Need a new account?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
}
