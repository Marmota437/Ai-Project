// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from "./components/ui/Layout/MainLayout";

// Import stron
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FinancePage from './pages/FinancePage';
import TasksPage from './pages/TasksPage';

// Placeholder na join page
const JoinFamilyPage = () => <div>Dołączanie do rodziny z kodu...</div>;

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Trasy publiczne */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/join" element={<JoinFamilyPage />} />

        {/* Trasy chronione */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Domyślne przekierowanie z /dashboard na /dashboard/finance */}
          <Route index element={<Navigate to="finance" replace />} />
          
          <Route path="finance" element={<FinancePage />} />
          <Route path="tasks" element={<TasksPage />} />
        </Route>

        {/* Catch all - przekieruj na dashboard (lub login, jeśli niezalogowany) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;