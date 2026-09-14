import React, { useState } from 'react';
import { Mail, Lock, User, Shield, CheckCircle2, AlertCircle, ArrowRight, Send, KeyRound, Key, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface AuthPageProps {
  onSuccessLogin?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccessLogin }) => {
  const {
    authMode,
    setAuthMode,
    pendingVerificationEmail,
    pendingResetEmail,
    verificationNotice,
    authError,
    clearAuthError,
    clearVerificationNotice,
    login,
    signUp,
    verifyEmail,
    sendPasswordResetEmail,
    resetPassword
  } = useAuthStore();

  // Sign In Form state
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Forgot Password Form state
  const [forgotEmail, setForgotEmail] = useState('');

  // Reset Password Form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Local validation error
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!signInIdentifier || !signInPassword) {
      setLocalError('Please fill in both your username/email and password.');
      return;
    }

    const result = login(signInIdentifier, signInPassword);
    if (result.success && onSuccessLogin) {
      onSuccessLogin();
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!signUpName || !signUpUsername || !signUpEmail || !signUpPassword) {
      setLocalError('Please complete all required fields.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setLocalError('Passwords do not match. Please retype password.');
      return;
    }

    if (signUpPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    signUp({
      name: signUpName,
      username: signUpUsername,
      email: signUpEmail,
      password: signUpPassword
    });
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!forgotEmail) {
      setLocalError('Please enter your registered email address or username.');
      return;
    }

    sendPasswordResetEmail(forgotEmail);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!newPassword || !confirmNewPassword) {
      setLocalError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setLocalError('Passwords do not match. Please retype password.');
      return;
    }

    if (newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    resetPassword(pendingResetEmail || forgotEmail, newPassword);
  };

  const handleVerifyNow = () => {
    verifyEmail(pendingVerificationEmail || signUpEmail);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Spheres */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950 relative z-10 animate-fade-in">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/30 mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Invoice Manager</h1>
          <p className="text-xs font-medium text-slate-400 mt-1">
            {authMode === 'login' && 'Sign in to access your business dashboard'}
            {authMode === 'signup' && 'Create your account to start managing invoices'}
            {authMode === 'verify' && 'Verify your email address to continue'}
            {authMode === 'forgot' && 'Reset your forgotten password'}
            {authMode === 'reset' && 'Create a new password for your account'}
          </p>
        </div>

        {/* Tab Navigation (Sign In / Sign Up) */}
        {(authMode === 'login' || authMode === 'signup') && (
          <div className="flex bg-slate-800/80 p-1 rounded-2xl mb-6 border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLocalError(null);
                clearAuthError();
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                authMode === 'login'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setLocalError(null);
                clearAuthError();
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                authMode === 'signup'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Notifications & Error Banners */}
        {verificationNotice && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium leading-relaxed">{verificationNotice}</p>
            </div>
          </div>
        )}

        {(authError || localError) && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium leading-relaxed">{authError || localError}</p>
            </div>
          </div>
        )}

        {/* --- SIGN IN FORM --- */}
        {authMode === 'login' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Username, Email or Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="Enter username, email or full name"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-800/90 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot');
                    setLocalError(null);
                    clearAuthError();
                    clearVerificationNotice();
                  }}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-800/90 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* --- SIGN UP FORM --- */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Full Name / Business Title
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-700 bg-slate-800/90 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={signUpUsername}
                  onChange={(e) => setSignUpUsername(e.target.value)}
                  placeholder="e.g. alexmorgan"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-700 bg-slate-800/90 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-700 bg-slate-800/90 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-700 bg-slate-800/90 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  placeholder="Retype password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-700 bg-slate-800/90 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Create Account & Send Verification Email</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD FORM --- */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Registered Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email address"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-800/90 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Send Password Reset Link</span>
              <Send className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLocalError(null);
                clearAuthError();
                clearVerificationNotice();
              }}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 font-semibold cursor-pointer text-center block"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* --- RESET PASSWORD FORM (SET NEW PASSWORD) --- */}
        {authMode === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-brand-950/60 border border-brand-800/80 text-brand-300 text-xs flex items-center gap-2.5">
              <Key className="w-5 h-5 text-brand-400 shrink-0" />
              <span>Resetting password for <strong className="text-white font-bold">{pendingResetEmail || forgotEmail}</strong></span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-800/90 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Retype new password"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-800/90 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Save New Password & Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLocalError(null);
                clearAuthError();
                clearVerificationNotice();
              }}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 font-semibold cursor-pointer text-center block"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* --- EMAIL VERIFICATION STEP --- */}
        {authMode === 'verify' && (
          <div className="text-center space-y-5 animate-fade-in py-2">
            <div className="w-16 h-16 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/40 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Verification Email Sent!</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                We sent a verification link to{' '}
                <strong className="text-brand-400 font-bold">{pendingVerificationEmail}</strong>. Please check your inbox and click the verification button below to activate your account.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleVerifyNow}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate / Verify Email Now</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  clearVerificationNotice();
                  clearAuthError();
                }}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 font-semibold cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
