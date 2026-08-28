import { useEffect, useState } from 'react';
import { 
  FileText, 
  Search, 
  Trash2, 
  Eye, 
  Clock, 
  X, 
  Edit3, 
  Sparkles, 
  Loader2, 
  Layers, 
  Plus, 
  Save 
} from 'lucide-react';
import api from '../../lib/api';
import { getSubjectEmoji } from '../../lib/subjectEmojis';

interface Subject {
  id: string;
  _id?: string;
  name: string;
  color?: string;
}

interface Note {
  id: string; 
  _id?: string;
  noteId?: string; 
  title: string; 
  subject_id?: string; 
  subjectId?: string;
  subject_name?: string;
  status: string; 
  created_at?: string; 
  createdAt?: string;
  transcript?: string; 
  summary?: string; 
  key_points?: string[];
  bullet_points?: string[];
  key_takeaways?: string[];
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selected, setSelected] = useState<Note | null>(null);

  // Add Note Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [savingNewNote, setSavingNewNote] = useState(false);

  // Edit Note Modal State
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [noteTab, setNoteTab] = useState<'detailed' | 'keypoints'>('detailed');

  const load = async (q = '') => {
    setLoading(true);
    try {
      const endpoint = q ? `/notes/search?q=${encodeURIComponent(q)}` : '/notes';
      const [nRes, sRes] = await Promise.all([
        api.get(endpoint),
        api.get('/subjects'),
      ]);
      const notesList = nRes.data.data?.notes || nRes.data.data || [];
      const subs = sRes.data.data?.subjects || sRes.data.data || [];
      setNotes(notesList);
      setSubjects(subs);
      if (subs.length > 0 && !newSubjectId) {
        setNewSubjectId(subs[0].id || subs[0]._id || '');
      }
    } catch { 
      setNotes([]); 
    }
    setLoading(false);
  };

  useEffect(() => { 
    load(); 
  }, []);

  const handleDelete = async (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Delete note "${title}"?`)) return;
    setNotes(prev => prev.filter(n => (n.id || n.noteId || n._id) !== id));
    if (selected && (selected.id || selected.noteId || selected._id) === id) {
      setSelected(null);
    }
    try { 
      await api.delete(`/notes/${id}`); 
      await load(); 
    } catch { 
      alert('Failed to delete note'); 
      await load();
    }
  };

  const viewNote = async (note: Note) => {
    try {
      const noteId = note.id || note.noteId || note._id;
      const { data } = await api.get(`/notes/${noteId}`);
      setSelected(data.data || note);
    } catch { 
      setSelected(note); 
    }
  };

  const openEditModal = (note: Note, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingNote(note);
    setEditTitle(note.title);
    setEditSubjectId(note.subject_id || note.subjectId || (subjects[0]?.id || subjects[0]?._id || ''));
    setEditContent(note.transcript || note.summary || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    setSavingEdit(true);
    const noteId = editingNote.id || editingNote.noteId || editingNote._id;
    try {
      await api.patch(`/notes/${noteId}`, {
        title: editTitle.trim(),
        subjectId: editSubjectId,
        transcript: editContent.trim(),
        content: editContent.trim(),
      });

      // Update in-memory selected if currently viewing
      if (selected && (selected.id || selected.noteId || selected._id) === noteId) {
        setSelected(prev => prev ? {
          ...prev,
          title: editTitle.trim(),
          subject_id: editSubjectId,
          transcript: editContent.trim(),
        } : null);
      }

      setEditingNote(null);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update note.');
    }
    setSavingEdit(false);
  };

  const handleCreateTextNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectId || !newTitle.trim() || !newContent.trim()) {
      alert('Please select a subject, enter a title, and provide note content.');
      return;
    }
    setSavingNewNote(true);
    try {
      await api.post('/notes/text', {
        subjectId: newSubjectId,
        title: newTitle.trim(),
        topic: newTitle.trim(),
        content: newContent.trim(),
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewContent('');
      await load();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create text note.');
    }
    setSavingNewNote(false);
  };

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  // Filter notes by search and selected subject
  const filteredNotes = notes.filter(n => {
    const sId = n.subject_id || n.subjectId || '';
    const matchSubject = selectedSubjectId === 'all' || sId === selectedSubjectId || sId.toString() === selectedSubjectId.toString();
    const matchSearch = search === '' || 
      n.title.toLowerCase().includes(search.toLowerCase()) || 
      (n.transcript || '').toLowerCase().includes(search.toLowerCase()) ||
      (n.summary || '').toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  // Group filtered notes by Subject
  const subjectGroups: { subject: Subject; notes: Note[] }[] = [];
  
  if (selectedSubjectId === 'all') {
    subjects.forEach(sub => {
      const subId = sub.id || sub._id || '';
      const subNotes = filteredNotes.filter(n => (n.subject_id || n.subjectId) === subId || (n.subject_name && n.subject_name.toLowerCase().includes(sub.name.toLowerCase())));
      if (subNotes.length > 0) {
        subjectGroups.push({ subject: sub, notes: subNotes });
      }
    });
    // Add any orphaned notes
    const groupedNoteIds = new Set(subjectGroups.flatMap(g => g.notes.map(n => n.id || n._id || '')));
    const otherNotes = filteredNotes.filter(n => !groupedNoteIds.has(n.id || n._id || ''));
    if (otherNotes.length > 0) {
      subjectGroups.push({ subject: { id: 'other', name: 'General Subject Notes' }, notes: otherNotes });
    }
  } else {
    const currentSub = subjects.find(s => (s.id || s._id) === selectedSubjectId);
    if (currentSub) {
      subjectGroups.push({ subject: currentSub, notes: filteredNotes });
    } else {
      subjectGroups.push({ subject: { id: selectedSubjectId, name: 'Subject Notes' }, notes: filteredNotes });
    }
  }

  return (
    <div className="p-6 text-white max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-400" />
            Subject Study Notes & Knowledge Hub
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {notes.length} verified notes organized topic-by-topic under their subjects. Study, edit, or create new topic notes.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (subjects.length > 0) setNewSubjectId(subjects[0].id || subjects[0]._id || '');
              setShowAddModal(true);
            }} 
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus size={15} /> + Add Note to Subject
          </button>
        </div>
      </div>

      {/* Search & Subject Tabs Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          
          {/* Subject Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubjectId('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedSubjectId === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 border border-blue-500'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              All Subjects ({notes.length})
            </button>
            {subjects.map(s => {
              const subId = s.id || s._id || '';
              const count = notes.filter(n => (n.subject_id || n.subjectId) === subId || (n.subject_name && n.subject_name.toLowerCase().includes(s.name.toLowerCase()))).length;
              return (
                <button
                  key={subId}
                  onClick={() => setSelectedSubjectId(subId)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedSubjectId === subId
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 border border-blue-500'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Layers size={13} className="opacity-70" />
                  <span>{s.name} ({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              value={search}
              onChange={e => { setSearch(e.target.value); load(e.target.value); }}
              placeholder="Search notes & concepts..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="py-20 flex justify-center">
          <Loader2 size={36} className="text-blue-400 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredNotes.length === 0 && (
        <div className="py-20 text-center text-slate-500 rounded-3xl border border-dashed border-slate-800 space-y-3">
          <FileText size={40} className="mx-auto text-slate-600" />
          <p className="font-bold text-white text-base">No notes found.</p>
          <p className="text-xs text-slate-400">Try selecting another subject or click "+ Add Note to Subject".</p>
        </div>
      )}

      {/* Notes Display Grouped by Subject */}
      {!loading && filteredNotes.length > 0 && (
        <div className="space-y-8">
          {subjectGroups.map(({ subject, notes: subNotes }) => (
            <div key={subject.id || subject._id} className="space-y-4">
              
              {/* Subject Group Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getSubjectEmoji(subject.name)}</span>
                  <h2 className="text-lg font-bold text-white">
                    {subject.name}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {subNotes.length} Topic Note{subNotes.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <a 
                  href="/student/subjects" 
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  View Subject Hub →
                </a>
              </div>

              {/* Notes Grid for this Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {subNotes.map((note) => {
                  const noteId = note.id || note.noteId || note._id || '';

                  return (
                    <div 
                      key={noteId} 
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all shadow-lg flex flex-col justify-between space-y-4 group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 truncate max-w-[170px]">
                            {note.subject_name || subject.name}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => openEditModal(note, e)}
                              title="Edit Note"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(noteId, note.title, e)}
                              title="Delete Note"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-bold text-white text-base mb-1.5 group-hover:text-blue-300 transition-colors line-clamp-1">
                          {note.title}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {note.transcript?.slice(0, 150) || note.summary?.slice(0, 150) || 'Voice note content ready to view.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                          <Clock size={12} />
                          {fmtDate(note.created_at || note.createdAt)}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(note)}
                            className="px-3 py-1.5 rounded-xl border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>

                          <button 
                            onClick={() => viewNote(note)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow transition-all"
                          >
                            <Eye size={12} />
                            <span>Read Note</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW IN-DEPTH NOTE READER                                       */}
      {/* ========================================================================= */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  {selected.subject_name || 'Subject Note'}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-1.5">{selected.title}</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const noteToEdit = selected;
                    setSelected(null);
                    openEditModal(noteToEdit);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all"
                >
                  <Edit3 size={13} />
                  <span>Edit Note</span>
                </button>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 px-6 pt-4 border-b border-slate-800/80 bg-slate-950/30">
              {[
                { key: 'detailed', label: '🎙️ Your Recording (Transcript)' },
                { key: 'keypoints', label: '⚡ AI Key Points (Formulas, Concepts)' }
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setNoteTab(t.key as any)}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                    noteTab === t.key 
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg' 
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {noteTab === 'detailed' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Exactly what you recorded — no changes
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans">
                    {selected.transcript || <span className="text-slate-500 italic">No transcript available. The recording may not have captured any speech clearly.</span>}
                  </div>
                </div>
              )}

              {noteTab === 'keypoints' && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">AI Extracted Key Points & Formulas</h4>
                  {(selected.key_points && selected.key_points.length > 0) || (selected.bullet_points && selected.bullet_points.length > 0) ? (
                    <ul className="space-y-2.5">
                      {(selected.key_points || selected.bullet_points || []).map((kp, i) => (
                        <li key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200">
                          <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20" />
                          <span className="leading-relaxed font-medium">{kp}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-sm whitespace-pre-line">
                      {selected.transcript?.slice(0, 500) || selected.summary || 'No key points extracted yet.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400">
              <span>Smart Voice Note Engine</span>
              <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 font-semibold transition-colors">
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT NOTE MODAL                                                  */}
      {/* ========================================================================= */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={() => setEditingNote(null)}>
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Edit Topic Note</h2>
                  <p className="text-xs text-slate-400">Modify title, subject category, or lecture transcript content.</p>
                </div>
              </div>
              <button onClick={() => setEditingNote(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">1. Note Title *</label>
                <input
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-white text-xs placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">2. Subject Category *</label>
                <select
                  required
                  value={editSubjectId}
                  onChange={e => setEditSubjectId(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-white text-xs focus:border-blue-500 focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id || s._id} value={s.id || s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">3. Note Content / Lecture Text *</label>
                <textarea
                  required
                  rows={8}
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  placeholder="Comprehensive study notes, code examples, and theoretical formulas..."
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white text-xs placeholder-slate-500 focus:border-emerald-500 focus:outline-none leading-relaxed font-sans"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="flex-1 rounded-xl bg-slate-800 border border-slate-700 py-2.5 font-bold text-slate-300 text-xs hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 font-bold text-white text-xs hover:opacity-90 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
                >
                  {savingEdit ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  <span>Save Note Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE NEW NOTE MODAL                                            */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Plus size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Add Note to Subject</h2>
                  <p className="text-xs text-slate-400">Select a subject and enter the note text.</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTextNote} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">1. Select Subject *</label>
                <select
                  required
                  value={newSubjectId}
                  onChange={e => setNewSubjectId(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-white text-xs focus:border-blue-500 focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id || s._id} value={s.id || s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">2. Note / Topic Title *</label>
                <input
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Memory Paging and Address Translation"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-white text-xs placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">3. Note Content / Lecture Text *</label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Write or paste your comprehensive study notes, key formulas, bullet points, and code examples..."
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white text-xs placeholder-slate-500 focus:border-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={savingNewNote}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-bold text-white text-xs hover:opacity-90 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
              >
                {savingNewNote ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving Note & Generating AI Takeaways...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Save Note to Subject & Generate Takeaways
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
