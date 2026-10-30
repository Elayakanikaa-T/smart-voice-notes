import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ role, allowedRoles }: { role?: 'student' | 'admin' | 'employee'; allowedRoles?: Array<'student' | 'admin' | 'employee'> }) {
  const { user, loading, token, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F19]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  // If no token in memory or localStorage, redirect to login
  const storedToken = token || localStorage.getItem('accessToken');
  if (!storedToken) {
    return <Navigate to="/login" replace />;
  }

  // Resolve the current user from context or localStorage
  let currentUser = user;
  if (!currentUser) {
    try {
      const stored = localStorage.getItem('user');
      if (stored) currentUser = JSON.parse(stored);
    } catch {
      currentUser = null;
    }
  }

  // If no user record exists, clear state and redirect to login
  if (!currentUser || !currentUser.email) {
    logout();
    return <Navigate to="/login" replace />;
  }

  const userRole = currentUser.role;
  const validRoles = allowedRoles || (role ? [role] : ['student', 'admin', 'employee']);

  // Admin has access to all portals
  if (userRole === 'admin') {
    return <Outlet />;
  }

  // If role is required and userRole is not in the allowed list
  if (!validRoles.includes(userRole as any)) {
    if (userRole === 'employee') return <Navigate to="/meetings" replace />;
    if (userRole === 'student') return <Navigate to="/student" replace />;
    logout();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

