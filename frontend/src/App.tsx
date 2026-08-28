import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Auth
import Login from './pages/Login';

// Student Pages
import StudentHome from './pages/student/StudentHome';
import Subjects from './pages/student/Subjects';
import RecordAudio from './pages/student/RecordAudio';
import Notes from './pages/student/Notes';
import AIGuide from './pages/student/AIGuide';
import Quiz from './pages/student/Quiz';
import Progress from './pages/student/Progress';
import Reminders from './pages/student/Reminders';
import Recommendations from './pages/student/Recommendations';
import LearningPath from './pages/student/LearningPath';
import Languages from './pages/student/Languages';
import Profile from './pages/student/Profile';

// Admin Pages
import AdminHome from './pages/admin/AdminHome';
import AdminStudents from './pages/admin/AdminStudents';
import AdminQuizCreator from './pages/admin/AdminQuizCreator';

// Employee Meeting Portal Pages
import Meetings from './pages/employee/Meetings';
import NewMeeting from './pages/employee/NewMeeting';
import MeetingDetail from './pages/employee/MeetingDetail';
import MeetingSearch from './pages/employee/MeetingSearch';
import { LiveMeetingRoom } from './pages/employee/LiveMeetingRoom';
import { GuestMeetingJoin } from './pages/employee/GuestMeetingJoin';

// Smart root redirect: if logged in, go to dashboard; otherwise go to login
function SmartRedirect() {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'employee') return <Navigate to="/meetings" replace />;
    return <Navigate to="/student" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<SmartRedirect />} />

          {/* Public Live Meeting Routes (Guests allowed) */}
          <Route path="/meetings/live/:id" element={<GuestMeetingJoin />} />
          <Route path="/meetings/live/:id/room" element={<LiveMeetingRoom />} />

          {/* Employee Meeting Portal Routes (accessible to employee and admin) */}
          <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/meetings/new" element={<NewMeeting />} />
              <Route path="/meetings/:id" element={<MeetingDetail />} />
              <Route path="/meeting-search" element={<MeetingSearch />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute role="student" />}>
            <Route element={<AppLayout />}>
              <Route path="/student" element={<StudentHome />} />
              <Route path="/student/subjects" element={<Subjects />} />
              <Route path="/student/record" element={<RecordAudio />} />
              <Route path="/student/notes" element={<Notes />} />
              <Route path="/student/ai-guide" element={<AIGuide />} />
              <Route path="/student/quiz" element={<Quiz />} />
              <Route path="/student/progress" element={<Progress />} />
              <Route path="/student/reminders" element={<Reminders />} />
              <Route path="/student/notifications" element={<Reminders />} />
              <Route path="/student/recommendations" element={<Recommendations />} />
              <Route path="/student/learning-path" element={<LearningPath />} />
              <Route path="/student/languages" element={<Languages />} />
              <Route path="/student/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/subjects" element={<Subjects />} />
              <Route path="/admin/quizzes" element={<AdminQuizCreator />} />
              <Route path="/admin/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Fallback: unknown routes go to smart redirect */}
          <Route path="*" element={<SmartRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


