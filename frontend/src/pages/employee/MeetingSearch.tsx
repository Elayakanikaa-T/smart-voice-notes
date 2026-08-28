import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Calendar, Users,
  Loader2, Sparkles, ChevronRight
} from 'lucide-react';
import api from '../../lib/api';

export default function MeetingSearch() {
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [participant, setParticipant] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const navigate = useNavigate();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/meeting-search', {
        params: {
          q: query || undefined,
          title: title || undefined,
          participant: participant || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
        },
      });
      setResults(res.data?.data?.meetings || []);
      setTotal(res.data?.data?.total || 0);
    } catch (err: any) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setTitle('');
    setParticipant('');
    setFromDate('');
    setToDate('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="p-6 text-white max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-2">
            <Search className="w-3.5 h-3.5 text-indigo-400" /> Archive Search Engine
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Search Past Meetings & Notes</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Full-text search across transcripts, summaries, decisions, and action items. Narrow down your findings by date, title, or participant email.
          </p>
        </div>
      </div>

      {/* Search Filter Box */}
      <form onSubmit={handleSearch} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        {/* Main query input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords across transcripts, summaries, decisions, and action items..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
        </div>

        {/* Detailed Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Budget Planning"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Participant Email
            </label>
            <input
              type="text"
              value={participant}
              onChange={(e) => setParticipant(e.target.value)}
              placeholder="e.g. sarah@company.com"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Clear Filters
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search Archive</span>
          </button>
        </div>
      </form>

      {/* Search Results */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Searching archives across all collections...</p>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <Search className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No matching meetings found</h3>
          <p className="text-xs text-slate-400">Try broadening your search term or date range.</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
            <span>Found <strong>{total}</strong> matching meeting(s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((m) => (
              <div
                key={m._id}
                onClick={() => navigate(`/meetings/${m._id}`)}
                className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1 font-sans font-semibold">
                      <Sparkles className="w-3 h-3" /> Processed
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {m.title}
                  </h3>

                  <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {m.participants?.length || 0} Participant(s)
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-3 flex items-center justify-between text-xs text-slate-400 group-hover:text-indigo-300 font-semibold transition-colors">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
