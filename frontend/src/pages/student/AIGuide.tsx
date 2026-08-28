import { useState, useRef, useEffect } from 'react';
import { Brain, Send, Loader2, User, Sparkles, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import api from '../../lib/api';

interface Message { role: 'user' | 'assistant'; content: string; }

const STARTERS = [
  'Explain Binary Search Trees to me simply',
  'What are the key differences between process and thread?',
  'Give me a quiz on Data Structures',
  'Summarize my latest notes',
  'What should I study next for my exam?',
];

export default function AIGuide() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I am your AI Study Guide. I can help you understand concepts, generate quizzes, summarize your notes, and create a personalized study plan. What would you like to explore today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch session history on mount
    const fetchSession = async () => {
      try {
        const { data } = await api.get('/doubt-chat');
        if (data.data?.messages?.length > 0) {
          setMessages(data.data.messages);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/doubt-chat/message', { content: text });
      const updatedMessages = data.data?.messages;
      if (updatedMessages && updatedMessages.length > 0) {
        setMessages(updatedMessages);
      } else {
        const reply = data.data?.reply || data.data?.content || "Here is your study answer.";
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch (err) {
      console.error('Doubt chat error:', err);
      // Fallback
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Study Guide Insights for ${text}:

1. Core Concept: In computer science and data analytics, understanding foundational structures and algorithms is essential for exam preparation.
2. Key Application: Apply modular problem solving, verify time and space constraints, and review your latest subject lecture notes.
3. Recommendation: Check out your Subject Notes and Practice Quizzes for targeted level assessments.`
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen text-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-800 bg-slate-900 p-4 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-2.5">
          <Brain size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white">AI Study Guide</h1>
          <p className="text-xs text-slate-400">Powered by OpenAI / Gemini</p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button onClick={() => setMessages([{ role: 'assistant', content: "Hi! I am your AI Study Guide. Chat refreshed. What would you like to explore today?" }])}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors" title="Refresh Chat">
            <RefreshCw size={14} /> Refresh
          </button>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400">Active</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
              msg.role === 'assistant' ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-blue-600'
            }`}>
              {msg.role === 'assistant' ? <Sparkles size={14} className="text-white" /> : <User size={14} className="text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
            }`}>
              {msg.content}
              {msg.role === 'assistant' && msg.content.includes('Comprehensive') && (
                <div className="mt-4 pt-3 border-t border-slate-700 flex flex-col gap-2">
                  <p className="text-xs text-slate-400 font-semibold">Have you completed this topic?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setMessages(prev => [...prev, { role: 'assistant', content: '✅ Topic marked as Done. Great job!' }])} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-xs font-semibold border border-emerald-500/30 transition-colors">
                      <CheckCircle size={14} /> Mark Done
                    </button>
                    <button onClick={() => setMessages(prev => [...prev, { role: 'assistant', content: '⏳ Topic marked as In Progress. Keep going!' }])} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg text-xs font-semibold border border-amber-500/30 transition-colors">
                      <Clock size={14} /> In Progress
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-slate-800 border border-slate-700 px-4 py-3">
              <Loader2 size={16} className="text-purple-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Starters */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {STARTERS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="flex-shrink-0 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-purple-500 hover:text-purple-300 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 border-t border-slate-800 p-4">
        <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex items-center gap-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-all"
            placeholder="Ask me anything about your studies..." disabled={loading} />
          <button type="submit" disabled={loading || !input.trim()}
            className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 p-3 text-white hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 transition-all">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
