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
  ArrowLeft,
  Sparkles,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Radio,
  FileText,
  BrainCircuit
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

type AuthView = 'login' | 'signup' | 'otp' | 'forgot_password' | 'forgot_password_otp';
type UserRole = 'student' | 'employee' | 'admin';

export default function Login() {
  const [view, setView] = useState<AuthView>('signup');
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
      if ((res as any).devOtp) {
        setOtp((res as any).devOtp);
      }
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
      if ((res as any).devOtp) {
        setOtp((res as any).devOtp);
      }
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
    <div className="min-h-screen w-full bg-[#070b14] text-slate-100 flex font-sans selection:bg-indigo-500/30 selection:text-white">
      
      {/* ─── LEFT PANEL: Hero & Product Showcase (Full height on lg+ screens) ─── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-[#0c1222] via-[#090f1d] to-[#060913] border-r border-slate-800/80">
        
        {/* Ambient background glow orbs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Top: Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white block">Smart Voice Notes</span>
              <span className="text-xs text-indigo-400 font-medium">AI Audio & Intelligence Platform</span>
            </div>
          </div>
        </div>

        {/* Center: Hero Value Proposition */}
        <div className="relative z-10 my-auto py-8 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Next-Gen Speech Intelligence
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Turn every spoken word into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">actionable knowledge.</span>
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed max-w-md">
            Whether in lectures or corporate boardrooms, record audio with real-time transcription, automated summaries, study flashcards, and verified security.
          </p>

          {/* Feature Highlight Cards */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Live Transcription & Audio Notes</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Studio-grade multi-speaker recognition with instant voice replay.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">AI Study Guide & Automatic Quizzes</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Extract core concepts, formula sheets, and interactive practice tests.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Employee Action Items & Tasks</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Structured meeting minutes, automated deadlines, and task tracking.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Gmail verified accounts & encrypted data</span>
          </div>
          <span className="text-[11px] text-slate-500">v1.0.1 Enterprise</span>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Full-Page Authentication Form Workspace ─── */}
      <div className="w-full lg:w-1/2 xl:w-7/12 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative overflow-y-auto">
        
        {/* Top Navigation Bar: Mobile Logo & Quick View Switcher */}
        <div className="w-full max-w-xl mx-auto flex items-center justify-between pb-6">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Mic className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-white">Smart Voice Notes</span>
          </div>

          <div className="ml-auto text-xs text-slate-400 flex items-center gap-2">
            {view === 'login' ? (
              <>
                <span>Don't have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setView('signup');
                    clearFeedback();
                  }}
                  className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors py-1.5 px-3 rounded-lg hover:bg-indigo-600/10 border border-indigo-500/20"
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                <span>Already registered?</span>
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    clearFeedback();
                  }}
                  className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors py-1.5 px-3 rounded-lg hover:bg-indigo-600/10 border border-indigo-500/20"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        {/* Center Container: Spacious Form */}
        <div className="w-full max-w-xl mx-auto my-auto py-4">
          
          {/* Header Title & Subtitle */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {view === 'signup' && 'Create your account'}
              {view === 'login' && 'Welcome back'}
              {view === 'otp' && 'Verify your email'}
              {view === 'forgot_password' && 'Reset your password'}
              {view === 'forgot_password_otp' && 'Set a new password'}
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              {view === 'signup' && 'Sign up with your Gmail address to access voice intelligence and smart notes.'}
              {view === 'login' && 'Sign in to access your notes, meetings, and AI study guides.'}
              {view === 'otp' && `Enter the 6-digit confirmation code delivered to ${email}`}
              {view === 'forgot_password' && "Enter your registered Gmail address and we'll send a recovery code."}
              {view === 'forgot_password_otp' && 'Enter the reset code received in your inbox and your new password.'}
            </p>
          </div>

          {/* Role Selector Tabs (Only on Signup and Login) */}
          {(view === 'login' || view === 'signup') && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Your Workspace Role</label>
              <div className="grid grid-cols-3 gap-2.5 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className={`py-3 px-3 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-bold ${
                    role === 'student'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('employee')}
                  className={`py-3 px-3 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-bold ${
                    role === 'employee'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Employee</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`py-3 px-3 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-bold ${
                    role === 'admin'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
              <div className="leading-relaxed font-medium">{success}</div>
            </div>
          )}

          {/* ─── FORM 1: LOGIN ─── */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Gmail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot_password');
                      clearFeedback();
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer pt-3 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
                )}
              </button>
            </form>
          )}

          {/* ─── FORM 2: FULL-PAGE SIGNUP (STEP 1) ─── */}
          {view === 'signup' && (
            <form onSubmit={handleRequestSignupOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gmail Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">A real verification code will be sent to this Gmail address.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full pl-10 pr-10 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Administrator Secret Key Field */}
              {role === 'admin' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Administrator Authorization Key Required</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminSecretKey('ADMIN_MASTER_2026!')}
                      className="text-[10px] text-amber-400 hover:text-amber-200 underline font-semibold cursor-pointer"
                    >
                      Fill Default Key
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={adminSecretKey}
                    onChange={(e) => setAdminSecretKey(e.target.value)}
                    placeholder="Enter Admin Invite Key"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    <strong>What is this?</strong> This security key prevents unauthorized public visitors from creating master admin accounts. <em>(If you are a Student or Employee, click the Student or Employee tab above — no key is needed!)</em>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Default system key: <code className="text-amber-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-amber-500/30">ADMIN_MASTER_2026!</code>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer pt-3 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Verification Code to Gmail...</span>
                  </>
                ) : (
                  <span>Continue to Email Verification →</span>
                )}
              </button>
            </form>
          )}

          {/* ─── FORM 3: OTP VERIFICATION (STEP 2) ─── */}
          {view === 'otp' && (
            <form onSubmit={handleCompleteSignup} className="space-y-6">
              <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/10">
                  <KeyRound className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Check Your Gmail Inbox</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                    We delivered a 6-digit confirmation code to <strong className="text-white underline">{email}</strong>. Please enter it below.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 text-center">
                  6-Digit Verification Code
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="· · · · · ·"
                    className="w-full max-w-sm py-3.5 px-4 bg-slate-950 border-2 border-indigo-500/50 rounded-2xl text-center text-3xl font-mono tracking-[0.6em] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setView('signup');
                    clearFeedback();
                  }}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium py-1 px-2 rounded-lg"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to edit details
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={handleRequestSignupOtp}
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors disabled:opacity-50 py-1 px-2 rounded-lg"
                >
                  {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code & Creating Account...</span>
                  </>
                ) : (
                  <span>Verify Email & Access Dashboard</span>
                )}
              </button>
            </form>
          )}

          {/* ─── FORM 4: FORGOT PASSWORD REQUEST ─── */}
          {view === 'forgot_password' && (
            <form onSubmit={handleRequestForgotOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Gmail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
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
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* ─── FORM 5: FORGOT PASSWORD RESET ─── */}
          {view === 'forgot_password_otp' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 text-center">
                  6-Digit Reset Code
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="· · · · · ·"
                    className="w-full max-w-sm py-3 px-4 bg-slate-950 border-2 border-indigo-500/50 rounded-2xl text-center text-2xl font-mono tracking-[0.5em] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password (min 8 chars)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Reset Password & Sign In</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    clearFeedback();
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="w-full max-w-xl mx-auto pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Smart Voice Notes. All rights reserved.
        </div>

      </div>

    </div>
  );
}
