import { Globe, Check } from 'lucide-react';
import { useState } from 'react';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
];

export default function Languages() {
  const [selected, setSelected] = useState('en');
  const [transcriptionLang, setTranscriptionLang] = useState('en');

  const handleSave = () => {
    localStorage.setItem('uiLanguage', selected);
    localStorage.setItem('transcriptionLanguage', transcriptionLang);
    alert('Language preferences saved!');
  };

  return (
    <div className="p-6 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Language Settings</h1>
        <p className="text-slate-400 mt-1">Configure UI and transcription language preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UI Language */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-bold text-white mb-1">Interface Language</h2>
          <p className="text-sm text-slate-400 mb-4">Select your preferred language for the UI</p>
          <div className="space-y-2">
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => setSelected(lang.code)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
                  selected === lang.code
                    ? 'bg-blue-600/20 border border-blue-500/50 text-white'
                    : 'border border-transparent hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}>
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium">{lang.name}</p>
                  <p className="text-xs opacity-60">{lang.native}</p>
                </div>
                {selected === lang.code && <Check size={16} className="text-blue-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Transcription Language */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-bold text-white mb-1">Transcription Language</h2>
          <p className="text-sm text-slate-400 mb-4">Language spoken in your audio recordings</p>
          <div className="space-y-2">
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => setTranscriptionLang(lang.code)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
                  transcriptionLang === lang.code
                    ? 'bg-purple-600/20 border border-purple-500/50 text-white'
                    : 'border border-transparent hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}>
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium">{lang.name}</p>
                  <p className="text-xs opacity-60">{lang.native}</p>
                </div>
                {transcriptionLang === lang.code && <Check size={16} className="text-purple-400" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleSave}
        className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 transition-colors">
        <Globe size={18} /> Save Language Preferences
      </button>
    </div>
  );
}
