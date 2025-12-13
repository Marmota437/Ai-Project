import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.token);

  // Jeśli nie ma tokena, przekieruj do logowania
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jeśli jest token, wyświetl żądaną podstronę
  return <Outlet />;
};