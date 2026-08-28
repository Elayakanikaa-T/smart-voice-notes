import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ role, allowedRoles }: { role?: 'student' | 'admin' | 'employee'; allowedRoles?: Array<'student' | 'admin' | 'employee'> }) {
  const { user, loading, token } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // If no token in memory or localStorage, redirect to login
  const hasToken = token || localStorage.getItem('accessToken');
  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  // Resolve the current user from context or localStorage
  let currentUser = user;
  if (!currentUser) {
    try {
      const stored = localStorage.getItem('user');
      if (stored) currentUser = JSON.parse(stored);
    } catch (e) {}
  }

  const userRole = currentUser?.role || (currentUser?.email?.includes('admin') ? 'admin' : 'employee');

  const validRoles = allowedRoles || (role ? [role] : ['student', 'admin', 'employee']);

  // Admin has access to all portals
  if (userRole === 'admin') {
    return <Outlet />;
  }

  // If role is required and userRole is not in the allowed list
  if (!validRoles.includes(userRole as any)) {
    if (userRole === 'employee') return <Navigate to="/meetings" replace />;
    return <Navigate to="/student" replace />;
  }

  return <Outlet />;
}

