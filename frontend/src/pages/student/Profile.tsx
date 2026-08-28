import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Calendar, Edit2, CheckCircle2, Loader2, Globe, Palette, X } from 'lucide-react';
import api from '../../lib/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [themePref, setThemePref] = useState('system');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
    // Fetch live profile details from API
    api.get('/profile').then(({ data }) => {
      const p = data.data;
      if (p) {
        if (p.name) setName(p.name);
        if (p.preferred_language) setPreferredLanguage(p.preferred_language);
        if (p.theme_pref) setThemePref(p.theme_pref);
      }
    }).catch(() => {});
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setStatusMsg(null);
    try {
      await api.put('/profile', {
        name: name.trim(),
        preferred_language: preferredLanguage,
        theme_pref: themePref,
      });

      // Update global auth context
      updateUser({ name: name.trim() });
      setShowEditModal(false);
      setStatusMsg({ success: true, text: 'Profile updated successfully!' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ success: false, text: err.response?.data?.error || 'Failed to update profile.' });
    }
    setSaving(false);
  };

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

  return (
    <div className="p-6 text-white max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-blue-400" />
            User Account Profile
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Manage your personal credentials, study preferences, and settings</p>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all"
        >
          <Edit2 size={14} /> Edit Profile
        </button>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-medium ${
          statusMsg.success ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border-red-500/30 text-red-300'
        }`}>
          <CheckCircle2 size={16} className={statusMsg.success ? 'text-emerald-400' : 'text-red-400'} />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Avatar Header */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900 shadow-xl flex items-center gap-5">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
          <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize flex items-center gap-1.5 border ${
              user?.role === 'admin' 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
            }`}>
              <Shield size={12} /> {user?.role} Account
            </span>
            <span className="text-[11px] text-slate-500">Active Member</span>
          </div>
        </div>
      </div>

      {/* Profile Details List */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 divide-y divide-slate-800 shadow-xl overflow-hidden">
        {[
          { icon: User, label: 'Full Name', value: user?.name },
          { icon: Mail, label: 'Email Address', value: user?.email },
          { icon: Shield, label: 'Role & Permissions', value: `${user?.role} access` },
          { icon: Globe, label: 'Study & Speech Language', value: LANGUAGES.find(l => l.code === preferredLanguage)?.label || 'English (US)' },
          { icon: Palette, label: 'Interface Theme', value: themePref === 'system' ? 'Dark System Default' : themePref },
          { icon: Calendar, label: 'Registration Date', value: 'Active Student (2026 Session)' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between px-6 py-4 hover:bg-slate-850/50 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                <Icon size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">{label}</p>
                <p className="text-sm font-medium text-white capitalize mt-0.5">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* EDIT PROFILE MODAL                                                        */}
      {/* ========================================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={() => setShowEditModal(false)}>
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Edit2 size={16} />
                </div>
                <h3 className="text-lg font-bold text-white">Edit Profile Details</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Email Address
                </label>
                <input
                  disabled
                  type="email"
                  value={user?.email || ''}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Email is bound to your account credentials</span>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Preferred Speech / Study Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={e => setPreferredLanguage(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Theme Appearance
                </label>
                <select
                  value={themePref}
                  onChange={e => setThemePref(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none capitalize"
                >
                  <option value="system">Dark System Slate</option>
                  <option value="midnight">Midnight Indigo</option>
                  <option value="charcoal">Deep Charcoal</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white text-xs hover:opacity-90 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Updating Profile...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
