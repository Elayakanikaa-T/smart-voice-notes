import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Shield,
  Edit2,
  CheckCircle2,
  Loader2,
  Globe,
  X,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Building2,
  GraduationCap,
  KeyRound,
  Activity,
  AlertCircle,
  Save,
} from 'lucide-react';
import api from '../../lib/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  
  // Navigation / Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'password' | 'settings'>('overview');

  // Profile data states
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState<string | number>(user?.age || '');
  const [status, setStatus] = useState(user?.status || 'Active');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [gradeOrDesignation, setGradeOrDesignation] = useState(user?.grade_or_designation || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [themePref, setThemePref] = useState('system');
  const [createdAt, setCreatedAt] = useState<string>('');

  // Password update states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ success: boolean; text: string } | null>(null);

  // General feedback
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Status preset options
  const STATUS_PRESETS = [
    { label: '🟢 Active', value: 'Active' },
    { label: '📚 Studying for Exams', value: 'Studying for Exams' },
    { label: '💼 Working on Projects', value: 'Working on Projects' },
    { label: '☕ Available', value: 'Available' },
    { label: '🎯 Preparing for Class', value: 'Preparing for Class' },
    { label: '🌙 Do Not Disturb', value: 'Do Not Disturb' },
  ];

  const LANGUAGES = [
    { code: 'en', label: 'English (US)' },
    { code: 'es', label: 'Spanish (Español)' },
    { code: 'fr', label: 'French (Français)' },
    { code: 'de', label: 'German (Deutsch)' },
    { code: 'hi', label: 'Hindi (हिन्दी)' },
    { code: 'ta', label: 'Tamil (தமிழ்)' },
    { code: 'te', label: 'Telugu (తెలుగు)' },
    { code: 'zh', label: 'Mandarin (中文)' },
  ];

  // Fetch full live profile details on mount
  useEffect(() => {
    let isMounted = true;
    api
      .get('/profile')
      .then(({ data }) => {
        if (!isMounted) return;
        const p = data.data;
        if (p) {
          if (p.name) setName(p.name);
          if (p.age !== undefined && p.age !== null) setAge(p.age);
          if (p.status) setStatus(p.status);
          if (p.phone) setPhone(p.phone);
          if (p.gender) setGender(p.gender);
          if (p.institution) setInstitution(p.institution);
          if (p.grade_or_designation) setGradeOrDesignation(p.grade_or_designation);
          if (p.bio) setBio(p.bio);
          if (p.preferred_language) setPreferredLanguage(p.preferred_language);
          if (p.theme_pref) setThemePref(p.theme_pref);
          if (p.created_at) setCreatedAt(p.created_at);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch full profile:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle Save Profile Details (Name, Age, Status, Phone, etc.)
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setStatusMsg({ success: false, text: 'Full Name cannot be empty.' });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const payload: any = {
        name: name.trim(),
        age: age ? Number(age) : null,
        status: status.trim() || 'Active',
        phone: phone.trim(),
        gender: gender.trim(),
        institution: institution.trim(),
        grade_or_designation: gradeOrDesignation.trim(),
        bio: bio.trim(),
        preferred_language: preferredLanguage,
        theme_pref: themePref,
      };

      const res = await api.put('/profile', payload);

      // Update global AuthContext state & localStorage
      updateUser({
        name: name.trim(),
        age: age ? Number(age) : undefined,
        status: status.trim() || 'Active',
        phone: phone.trim(),
        gender: gender.trim(),
        institution: institution.trim(),
        grade_or_designation: gradeOrDesignation.trim(),
        bio: bio.trim(),
      });

      setStatusMsg({
        success: true,
        text: res.data?.message || 'Profile details updated successfully!',
      });
      setActiveTab('overview');
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({
        success: false,
        text: err.response?.data?.error || 'Failed to update profile details.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ success: false, text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ success: false, text: 'New password and confirmation password do not match.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await api.put('/profile', {
        currentPassword: currentPassword.trim() || undefined,
        newPassword: newPassword.trim(),
      });

      setPasswordMsg({
        success: true,
        text: res.data?.message || 'Password changed successfully! Keep it secure.',
      });

      // Clear input fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 5000);
    } catch (err: any) {
      setPasswordMsg({
        success: false,
        text: err.response?.data?.error || 'Failed to update password. Please check your credentials.',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 text-white max-w-4xl mx-auto space-y-6">
      
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <User className="w-6 h-6" />
            </div>
            User Account & Profile
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">
            Manage your personal credentials, password, status, age, academic & contact details
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== 'edit' ? (
            <button
              onClick={() => setActiveTab('edit')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer"
            >
              <Edit2 size={14} /> Edit Profile Details
            </button>
          ) : (
            <button
              onClick={() => handleSaveProfile()}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
            </button>
          )}

          <button
            onClick={() => setActiveTab('password')}
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3.5 py-2.5 text-xs font-bold text-slate-200 transition-all cursor-pointer"
          >
            <KeyRound size={14} className="text-amber-400" /> Password
          </button>
        </div>
      </div>

      {/* Global Status Message Toast */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm font-medium transition-all ${
            statusMsg.success
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          {statusMsg.success ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
          <button
            onClick={() => setStatusMsg(null)}
            className="ml-auto text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Hero Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          
          {/* User Avatar */}
          <div className="relative">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-xl shadow-blue-500/25 ring-4 ring-blue-500/20">
              {name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 border-2 border-slate-800 text-emerald-400"
              title="Verified User Account"
            >
              <CheckCircle2 size={16} />
            </span>
          </div>

          {/* User Main Info */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-black text-white tracking-tight">{name || user?.name}</h2>
              
              {/* Role Badge */}
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold capitalize flex items-center gap-1.5 border ${
                  user?.role === 'admin'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : user?.role === 'employee'
                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                    : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                }`}
              >
                <Shield size={12} /> {user?.role || 'student'} Portal
              </span>

              {/* Status Pill Badge */}
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {status || 'Active'}
              </span>

              {age ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {age} yrs old
                </span>
              ) : null}
            </div>

            <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-2">
              <Mail size={13} className="text-slate-500" /> {user?.email}
              {phone && (
                <>
                  <span className="text-slate-600">•</span>
                  <Phone size={13} className="text-slate-500" /> {phone}
                </>
              )}
            </p>

            {bio ? (
              <p className="text-slate-300 text-xs italic bg-slate-800/40 rounded-xl px-3 py-1.5 border border-slate-800/80 inline-block">
                "{bio}"
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto">
        {[
          { key: 'overview', label: 'Profile Overview', icon: User },
          { key: 'edit', label: 'Edit Profile & Details', icon: Edit2 },
          { key: 'password', label: 'Password & Security', icon: Lock },
          { key: 'settings', label: 'Preferences & Language', icon: Globe },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === key
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW                                                           */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Identity & Basic Info Card */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <User size={16} className="text-blue-400" /> Personal Identity
                </h3>
                <button
                  onClick={() => setActiveTab('edit')}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Edit2 size={12} /> Edit
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Full Name</span>
                  <span className="text-white font-semibold text-sm">{name || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Age</span>
                  <span className="text-white font-semibold">{age ? `${age} years` : 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Status / Availability</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20 mt-1">
                    <Activity size={12} /> {status || 'Active'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Gender</span>
                  <span className="text-white capitalize">{gender || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Bio / About</span>
                  <span className="text-slate-300">{bio || 'No personal bio added yet.'}</span>
                </div>
              </div>
            </div>

            {/* Academic & Work Details Card */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <GraduationCap size={16} className="text-indigo-400" /> Academic & Work
                </h3>
                <button
                  onClick={() => setActiveTab('edit')}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Edit2 size={12} /> Edit
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">School / College / Organization</span>
                  <span className="text-white font-semibold text-sm flex items-center gap-1.5 mt-0.5">
                    <Building2 size={14} className="text-slate-400" />
                    {institution || 'Not set (e.g. Stanford / ABC High School)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Class / Grade / Designation</span>
                  <span className="text-white font-semibold">
                    {gradeOrDesignation || 'Not set (e.g. Class 10 / Computer Science)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Account Role</span>
                  <span className="text-blue-400 font-bold capitalize">{user?.role} Portal Access</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Registration Date</span>
                  <span className="text-slate-300">
                    {createdAt ? new Date(createdAt).toLocaleDateString() : 'Active Member'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact & Credentials Card */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Mail size={16} className="text-emerald-400" /> Contact & Credentials
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Email Address (Login ID)</span>
                  <span className="text-white font-semibold text-sm">{user?.email}</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5 font-medium">✓ Verified & Secured</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Phone Number</span>
                  <span className="text-white">{phone || 'No phone number linked'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Password Security</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-slate-300 tracking-widest">••••••••••••</span>
                    <button
                      onClick={() => setActiveTab('password')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Change Password &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Study & System Preferences Card */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Globe size={16} className="text-purple-400" /> Speech & Preferences
                </h3>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Edit2 size={12} /> Configure
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Study & Speech Language</span>
                  <span className="text-white font-semibold">
                    {LANGUAGES.find((l) => l.code === preferredLanguage)?.label || 'English (US)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Interface Theme</span>
                  <span className="text-white capitalize">
                    {themePref === 'system' ? 'Dark System Default' : themePref}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">AI Features</span>
                  <span className="text-emerald-400 font-medium">Auto-Summarize & Quiz Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EDIT PROFILE DETAILS (Name, Age, Status, Phone, etc.)             */}
      {/* ========================================================================= */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Edit2 size={16} className="text-blue-400" /> Edit User Profile Information
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Update your name, age, status, and school/work details
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Age */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Age
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. 21"
                />
              </div>

              {/* Status & Quick Presets */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Status / Current Activity
                </label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Active, Studying for Finals, Available"
                />
                
                {/* Status Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 self-center">Quick status:</span>
                  {STATUS_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setStatus(preset.value)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        status === preset.value
                          ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                          : 'bg-slate-800/80 border-slate-750 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Institution / College / School */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  School / College / Organization
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Stanford University or ABC High School"
                />
              </div>

              {/* Class / Grade / Designation */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Class / Grade / Major / Designation
                </label>
                <input
                  type="text"
                  value={gradeOrDesignation}
                  onChange={(e) => setGradeOrDesignation(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Class 10, Computer Science 3rd Year"
                />
              </div>

              {/* Bio / Description */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Personal Bio / Notes
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Write a brief bio about your learning goals or background..."
                />
              </div>

              {/* Email (Read-Only) */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Email Address (Primary Login ID)
                </label>
                <input
                  disabled
                  type="email"
                  value={user?.email || ''}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Email is locked to your account credentials for safety.
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save Profile Details
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PASSWORD & SECURITY                                                */}
      {/* ========================================================================= */}
      {activeTab === 'password' && (
        <div className="space-y-6">
          <form onSubmit={handleChangePassword} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Lock size={16} className="text-amber-400" /> Change Account Password
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Update your password to keep your account safe and secure
                </p>
              </div>
            </div>

            {passwordMsg && (
              <div
                className={`p-4 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm font-medium ${
                  passwordMsg.success
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/15 border-red-500/30 text-red-300'
                }`}
              >
                {passwordMsg.success ? (
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-red-400 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <div className="max-w-md space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Current Password (Optional if newly registered)
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none pr-10"
                    placeholder="Enter existing password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    required
                    type={showNewPw ? 'text' : 'password'}
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none pr-10"
                    placeholder="Minimum 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    required
                    type={showConfirmPw ? 'text' : 'password'}
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none pr-10"
                    placeholder="Re-type new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 py-3 font-bold text-white text-xs sm:text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {updatingPassword ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Updating Password...
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} /> Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Password Security Tips Card */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" /> Security Recommendations
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-5">
              <li>Use at least 8 characters with a mix of letters, numbers, and symbols.</li>
              <li>Avoid using easily guessable passwords like names or birthdays.</li>
              <li>Never share your credentials with anyone.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PREFERENCES & LOCALIZATION                                         */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Globe size={16} className="text-purple-400" /> Speech & Interface Preferences
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Customize speech recognition language, theme mode, and study assistants
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Preferred Speech / Study Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Used for voice notes transcription and AI study explanations
                </span>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Theme Appearance
                </label>
                <select
                  value={themePref}
                  onChange={(e) => setThemePref(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-none capitalize"
                >
                  <option value="system">Dark System Slate</option>
                  <option value="midnight">Midnight Indigo</option>
                  <option value="charcoal">Deep Charcoal</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Preferences
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
