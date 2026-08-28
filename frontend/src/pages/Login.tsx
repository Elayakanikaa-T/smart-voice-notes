import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  X,
  Shield,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [portal, setPortal] = useState<'student' | 'admin' | 'employee'>('employee');
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('remembered_email') || '');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('remembered_email'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // NOTE: No auto-redirect here. The user may intentionally visit /login
  // to switch their portal (e.g., from student to admin). SmartRedirect in
  // App.tsx handles the root '/' redirect for already-logged-in users.

  // Quick 1-Click Demo Logins for foolproof testing
  const handleQuickAdminLogin = async () => {
    setLoading(true);
    setError('');
    try {
      try {
        await login('admin@admin.com', 'Admin1234!', 'admin');
      } catch {
        await signup('Platform Administrator', 'admin@admin.com', 'Admin1234!', 'admin');
      }
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login as admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStudentLogin = async () => {
    setLoading(true);
    setError('');
    try {
      try {
        await login('student@voice.edu', 'Student1234!', 'student');
      } catch {
        await signup('Alex Student', 'student@voice.edu', 'Student1234!', 'student');
      }
      navigate('/student', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login as student.');
    } finally {
      setLoading(false);
    }
  };
  const handleQuickEmployeeLogin = async () => {
    setLoading(true);
    setError('');
    try {
      try {
        await login('employee@company.com', 'Employee1234!', 'employee');
      } catch {
        await signup('Alex Employee', 'employee@company.com', 'Employee1234!', 'employee');
      }
      navigate('/meetings', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login as employee.');
    } finally {
      setLoading(false);
    }
  };
  // Calculate password strength for registration
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-rose-500 text-rose-400' };
    if (score === 2 || score === 3) return { score: 2, text: 'Medium', color: 'bg-amber-500 text-amber-400' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-500 text-emerald-400' };
  };

  const passStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Handle remember me
    if (rememberMe) {
      localStorage.setItem('remembered_email', email);
    } else {
      localStorage.removeItem('remembered_email');
    }

    try {
      // Clear any stale session so old role data cannot interfere
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      let loggedUser: any;
      if (activeTab === 'signup') {
        if (password.length < 8) {
          setError('Password must be at least 8 characters long.');
          setLoading(false);
          return;
        }
        loggedUser = await signup(name, email, password, portal);
      } else {
        loggedUser = await login(email, password, portal);
      }
      
      let target = '/meetings';
      if (loggedUser?.role === 'admin' || portal === 'admin' || email.toLowerCase().includes('admin')) {
        target = '/admin';
      } else if (loggedUser?.role === 'student' || portal === 'student') {
        target = '/student';
      } else {
        target = '/meetings';
      }
      navigate(target, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Authentication failed. Please verify your credentials or create an account.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setForgotModalOpen(false);
      setResetEmail('');
    }, 2800);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl shadow-indigo-950/50 overflow-hidden">
        
        {/* Left Side: Brand Showcase & Features */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/70 border-r border-slate-800/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          {/* Header & Logo */}
          <div>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-8 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-wide text-indigo-300">Smart Voice Notes</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
              AI Voice Notes & <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Study Assistant</span>
            </h1>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Record voice lectures, automatically generate structured summaries, test yourself with intelligent quizzes, and track study progress in real time.
            </p>

            {/* Live Audio Visualizer Simulation */}
            <div className="mt-8 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  MongoDB Database Engine
                </span>
                <span className="text-emerald-400 font-mono">Connected</span>
              </div>
              <div className="flex items-end justify-between h-10 gap-1 px-1">
                {[40, 75, 30, 95, 60, 85, 45, 100, 70, 50, 90, 65, 80, 40, 85, 95, 30, 60].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-full bg-gradient-to-t from-indigo-500 to-violet-400 rounded-full transition-all duration-300"
                    style={{ height: `${h}%`, opacity: 0.35 + (h / 150) }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-300 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400"><Sparkles className="w-4 h-4" /></div>
              <div>
                <p className="font-semibold text-slate-200">Speech-to-Text Transcription</p>
                <p className="text-[11px] text-slate-400">High-accuracy audio processing and AI summarization</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400"><BookOpen className="w-4 h-4" /></div>
              <div>
                <p className="font-semibold text-slate-200">Adaptive Quizzes & Flashcards</p>
                <p className="text-[11px] text-slate-400">Reinforce key concepts with customized practice tests</p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Secure</span>
            <span>MongoDB Database</span>
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="col-span-1 lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          
          {/* Mobile Header Logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Smart Voice Notes</h2>
              <p className="text-xs text-slate-400 mt-1">AI-Powered Learning Platform</p>
            </div>
          </div>

          {/* Header Title & Tab Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {activeTab === 'login' ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {activeTab === 'login' 
                  ? 'Enter your email and password to access your account' 
                  : 'Register a new account to begin saving voice notes'}
              </p>
            </div>

            {/* Tab Pill */}
            <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl self-start sm:self-center">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'login'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setError(''); }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'signup'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-xs sm:text-sm text-rose-300 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Role / Portal Selector */}
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Your Portal
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => { setPortal('employee'); setError(''); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  portal === 'employee'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Employee</span>
              </button>
              <button
                type="button"
                onClick={() => { setPortal('student'); setError(''); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  portal === 'student'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => { setPortal('admin'); setError(''); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  portal === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 px-1">
              {portal === 'employee'
                ? '💼 Transcribe meetings, generate AI summaries, extract decisions & track action items.'
                : portal === 'student' 
                ? '🎓 Access study notes, flashcards, take quizzes, recommendations, and AI Assistant.' 
                : '🛡️ Manage platform, review employee counts & students, and manage quizzes.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off" data-lpignore="true">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="off"
                  data-lpignore="true"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                {activeTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={activeTab === 'signup' ? 'new-password' : 'current-password'}
                  data-lpignore="true"
                  className="w-full pl-10 pr-12 py-2.5 sm:py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator (during Sign Up) */}
              {activeTab === 'signup' && password.length > 0 && (
                <div className="mt-2 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Strength: <strong className={passStrength.color}>{passStrength.text}</strong></span>
                    <span className="text-slate-500">{password.length < 8 ? 'Min. 8 characters' : 'Valid length'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${passStrength.score >= 1 ? 'bg-rose-500' : 'bg-slate-800'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${passStrength.score >= 2 ? 'bg-amber-500' : 'bg-slate-800'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${passStrength.score >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/30 focus:ring-offset-slate-900"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  Remember email on this device
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Switcher */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-center">
              ⚡ Instant 1-Click Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleQuickEmployeeLogin}
                className="py-2.5 px-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all hover:scale-[1.02]"
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>Employee</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleQuickStudentLogin}
                className="py-2.5 px-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all hover:scale-[1.02]"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Student</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleQuickAdminLogin}
                className="py-2.5 px-2 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all hover:scale-[1.02]"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Switch tab helper text */}
          <div className="mt-8 text-center text-xs text-slate-400">
            {activeTab === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('signup'); setError(''); }}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setError(''); }}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Lock className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-bold text-white">Reset Your Password</h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter your email address and we'll send you instructions to reset your account password.
            </p>

            {resetSent ? (
              <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-300 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                <span>Password reset link sent! Check your inbox shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
