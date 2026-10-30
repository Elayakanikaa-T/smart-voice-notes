import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

type AuthView = 'login' | 'signup' | 'otp' | 'forgot_password' | 'forgot_password_otp';
type UserRole = 'student' | 'employee' | 'admin';

export default function Login() {
  const [view, setView] = useState<AuthView>('login');
  const [role, setRole] = useState<UserRole>('employee');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP states
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Password reset states
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, signup, sendOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Resend OTP countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const clearFeedback = () => {
    setError('');
    setSuccess('');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    clearFeedback();
  };

  // 1. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your registered Gmail address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(cleanEmail, password, role);

      // Route to appropriate authorized dashboard
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'employee') {
        navigate('/meetings', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Request OTP for Signup
  const handleRequestSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(cleanEmail)) {
      setError('Please enter a valid Gmail address (e.g., yourname@gmail.com).');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (role === 'admin' && !adminSecretKey.trim()) {
      setError('Admin registration requires an Administrator Authorization Key.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(cleanEmail, name.trim(), 'signup');
      setView('otp');
      setSuccess(res.message || `A 6-digit verification code was sent to ${cleanEmail}. Please check your inbox and spam folder.`);
      setResendTimer(60);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Complete Signup with OTP
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!otp.trim() || otp.trim().length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const user = await signup(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        role,
        otp.trim(),
        role === 'admin' ? adminSecretKey.trim() : undefined
      );

      setSuccess('Account verified and created successfully!');
      setTimeout(() => {
        if (user.role === 'admin') navigate('/admin', { replace: true });
        else if (user.role === 'employee') navigate('/meetings', { replace: true });
        else navigate('/student', { replace: true });
      }, 700);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Verification failed. Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Request Forgot Password OTP
  const handleRequestForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(cleanEmail)) {
      setError('Please enter a valid registered Gmail address.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(cleanEmail, undefined, 'reset');
      setView('forgot_password_otp');
      setSuccess(res.message || `A password reset code was sent to ${cleanEmail}. Please check your inbox and spam folder.`);
      setResendTimer(60);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to send password reset code.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Complete Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!otp.trim()) {
      setError('Please enter the reset code.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
      setSuccess(res.message || 'Password reset successfully! Please sign in with your new password.');
      setTimeout(() => {
        setView('login');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-center items-center px-4 py-10 selection:bg-indigo-500/30 selection:text-white font-sans">
      
      {/* Centered Main Authentication Box (Instagram Card Style) */}
      <div className="w-full max-w-[385px] space-y-3.5">
        
        {/* Main Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl px-8 py-8 shadow-2xl relative">
          
          {/* Brand Header & Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 mb-3">
              <Mic className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Smart Voice Notes</h1>
            <p className="text-xs text-slate-400 mt-1">
              {view === 'login' && 'Log in to continue to your workspace'}
              {view === 'signup' && 'Sign up to create your account'}
              {view === 'otp' && 'Verify your Gmail address'}
              {(view === 'forgot_password' || view === 'forgot_password_otp') && 'Reset your password'}
            </p>
          </div>

          {/* User Role Selector (3 Roles: Student, Employee, Admin) */}
          {(view === 'login' || view === 'signup') && (
            <div className="mb-5">
              <div className="flex p-1 bg-slate-950/90 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                    role === 'student'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('employee')}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                    role === 'employee'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                    role === 'admin'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span className="leading-snug">{success}</span>
            </div>
          )}

          {/* VIEW 1: LOGIN FORM */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Gmail address"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Logging In...</span>
                  </>
                ) : (
                  <span>Log In as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setView('forgot_password');
                    clearFeedback();
                  }}
                  className="text-[11px] text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>
            </form>
          )}

          {/* VIEW 2: SIGNUP FORM */}
          {view === 'signup' && (
            <form onSubmit={handleRequestSignupOtp} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Gmail address (name@gmail.com)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 8 characters)"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Administrator Secret Key Field (Shown only when Admin is selected) */}
              {role === 'admin' && (
                <div className="pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Administrator Authorization Key</span>
                  </div>
                  <input
                    type="password"
                    required
                    value={adminSecretKey}
                    onChange={(e) => setAdminSecretKey(e.target.value)}
                    placeholder="Enter Admin Invite Key"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Admin accounts require verification key.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Sign Up as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
                )}
              </button>
            </form>
          )}

          {/* VIEW 3: OTP VERIFICATION (SIGNUP) */}
          {view === 'otp' && (
            <form onSubmit={handleCompleteSignup} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-300">
                  Enter the 6-digit code sent to <strong className="text-white">{email}</strong>
                </p>
              </div>

{/* OTP is sent to the user's real email — no dev hint exposed */}

              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full py-2.5 px-3 bg-slate-950 border border-indigo-500/40 rounded-xl text-center text-xl font-mono tracking-widest text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setView('signup');
                    clearFeedback();
                  }}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={handleRequestSignupOtp}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] disabled:opacity-50"
                >
                  {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Create Account</span>
                )}
              </button>
            </form>
          )}

          {/* VIEW 4: FORGOT PASSWORD REQUEST */}
          {view === 'forgot_password' && (
            <form onSubmit={handleRequestForgotOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-sm font-bold text-white">Trouble Logging In?</h2>
                <p className="text-xs text-slate-400">
                  Enter your registered Gmail address and we'll send you an OTP to reset your password.
                </p>
              </div>

              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Registered Gmail address"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Reset Code...</span>
                  </>
                ) : (
                  <span>Send Reset Code</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    clearFeedback();
                  }}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* VIEW 5: FORGOT PASSWORD RESET (ENTER OTP + NEW PASSWORD) */}
          {view === 'forgot_password_otp' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div className="text-center space-y-1">
                <h2 className="text-sm font-bold text-white">Set New Password</h2>
                <p className="text-xs text-slate-400">
                  Enter the code sent to <strong className="text-white">{email}</strong>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit reset code"
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password (min 8 chars)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    clearFeedback();
                  }}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Secondary Card (Instagram Style "Don't have an account? Sign up" / "Have an account? Log in") */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl py-4 px-6 text-center shadow-md">
          {view === 'login' ? (
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setView('signup');
                  clearFeedback();
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors ml-1 cursor-pointer"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  clearFeedback();
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors ml-1 cursor-pointer"
              >
                Log in
              </button>
            </p>
          )}
        </div>

      </div>

    </div>
  );
}
