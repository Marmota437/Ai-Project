import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { FinancesPage } from './pages/FinancesPage';
import { TasksPage } from './pages/TasksPage';
import { JoinFamilyPage } from './pages/JoinFamilyPage';
import { CreateFamilyPage } from './pages/CreateFamilyPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  
  // Trasy chronione
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/create-family',
        element: <CreateFamilyPage />,
      },
      {
        path: '/join', // Przeniesione do protected (wymaga zalogowania do API)
        element: <JoinFamilyPage />,
      },
      {
        path: '/finances',
        element: <FinancesPage />,
      },
      {
        path: '/tasks',
        element: <TasksPage />,
      },
    ],
  },
]);