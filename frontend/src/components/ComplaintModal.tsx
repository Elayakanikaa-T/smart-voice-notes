import { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Send, 
  X, 
  ShieldAlert, 
  RefreshCw
} from 'lucide-react';
import api from '../lib/api';

interface ComplaintItem {
  _id: string;
  category: string;
  subject: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: string;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'student' | 'employee' | 'admin';
}

export default function ComplaintModal({ isOpen, onClose, userRole = 'student' }: ComplaintModalProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  
  // Form states
  const [category, setCategory] = useState<'technical' | 'audio_transcription' | 'account_login' | 'feature_request' | 'other'>('technical');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  
  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // History states
  const [myComplaints, setMyComplaints] = useState<ComplaintItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchMyComplaints = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/complaints/my');
      setMyComplaints(res.data?.data || []);
    } catch (err: any) {
      console.warn('Could not fetch complaints history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      fetchMyComplaints();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Please provide a brief subject for your issue.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe the problem you encountered.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/complaints', {
        category,
        subject: subject.trim(),
        description: description.trim(),
        priority,
      });

      setSuccess(res.data?.message || 'Complaint submitted successfully to administrator.');
      setSubject('');
      setDescription('');
      fetchMyComplaints();
      setTimeout(() => {
        setActiveTab('history');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <RefreshCw className="w-3 h-3 animate-spin" /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Helpdesk & Complaint Box
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {userRole}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Experiencing any trouble? Submit a report directly to the administrator for fast resolution.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`pb-3 px-4 text-xs font-bold transition-all relative ${
              activeTab === 'new'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Submit New Complaint
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>My Submitted Issues</span>
            {myComplaints.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] text-slate-300 flex items-center justify-center">
                {myComplaints.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'new' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>{success}</span>
                </div>
              )}

              {/* Category & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Problem Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="technical">Technical Error / App Freeze</option>
                    <option value="audio_transcription">Microphone / Speech-to-Text Issue</option>
                    <option value="account_login">Login / Password / Email Verification</option>
                    <option value="feature_request">Feature Request / Suggestion</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Urgency Level</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="low">Low - Minor suggestion</option>
                    <option value="medium">Medium - Noticeable glitch</option>
                    <option value="high">High - Feature not functioning</option>
                    <option value="urgent">Urgent - Blocking core work</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject / Summary</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Audio stopped transcribing during meeting"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what happened, steps to reproduce, or error messages shown..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending to Admin...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit to Administrator</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {loadingHistory ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  <span className="text-xs">Loading submitted issues...</span>
                </div>
              ) : myComplaints.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">No issues reported yet</p>
                  <p className="text-[11px] text-slate-500">When you submit an issue, track the admin's fix here.</p>
                </div>
              ) : (
                myComplaints.map((c) => (
                  <div key={c._id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          {c.category.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{c.subject}</h4>
                      </div>
                      {getStatusBadge(c.status)}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{c.description}</p>
                    
                    {/* Admin resolution notes if any */}
                    {c.adminNotes && (
                      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1 mt-2">
                        <strong className="text-indigo-300 block font-bold">Admin Resolution Response:</strong>
                        <p className="text-slate-300">{c.adminNotes}</p>
                      </div>
                    )}

                    <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Submitted on {new Date(c.createdAt).toLocaleDateString()}</span>
                      {c.resolvedAt && (
                        <span className="text-emerald-400 font-semibold">
                          Resolved on {new Date(c.resolvedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
