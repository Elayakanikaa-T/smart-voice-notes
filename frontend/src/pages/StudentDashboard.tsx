import { Mic, Library, BrainCircuit } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-500 p-2 text-white">
                <Mic size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900">SmartNotes</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">Jane Student</span>
              <button onClick={() => navigate('/login')} className="text-sm font-medium text-red-500 hover:text-red-600">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Record Banner */}
        <div className="mb-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Ready to learn?</h2>
            <p className="text-blue-100 max-w-lg">Record a new lecture and let our AI generate notes, summaries, and flashcards for you instantly.</p>
          </div>
          <button className="flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-blue-600 shadow-md transition-transform hover:scale-105 active:scale-95">
            <Mic size={24} />
            Start Recording
          </button>
        </div>

        <h3 className="mb-6 text-xl font-bold text-gray-800">Your Study Areas</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Card 1 */}
          <div className="group cursor-pointer rounded-xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-blue-200">
            <div className="mb-4 inline-block rounded-lg bg-blue-50 p-3 text-blue-600 group-hover:bg-blue-100">
              <Library size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Data Structures</h4>
            <p className="mt-1 text-sm text-gray-500">12 notes • 3 quizzes pending</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="w-full rounded-full bg-gray-200 h-2 mr-4">
                <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
              </div>
              <span className="text-xs font-bold text-gray-700">75%</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group cursor-pointer rounded-xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-emerald-200">
            <div className="mb-4 inline-block rounded-lg bg-emerald-50 p-3 text-emerald-600 group-hover:bg-emerald-100">
              <BrainCircuit size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Operating Systems</h4>
            <p className="mt-1 text-sm text-gray-500">8 notes • Review required</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="w-full rounded-full bg-gray-200 h-2 mr-4">
                <div className="bg-emerald-500 h-2 rounded-full w-1/2"></div>
              </div>
              <span className="text-xs font-bold text-gray-700">50%</span>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
