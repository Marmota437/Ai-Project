import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Ładowanie...</div>;
  }

  if (!user) {
    // Przekieruj do logowania
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}