// PLIK: src/components/Layout/MainLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-indigo-600">FamilyApp</h1>
            
            {/* Nawigacja Główna */}
            <nav className="flex gap-4">
              <NavLink 
                to="/dashboard/finance"
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`
                }
              >
                Finanse
              </NavLink>
              <NavLink 
                to="/dashboard/tasks"
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`
                }
              >
                Zadania
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Witaj, {user?.username}
            </span>
            <button 
              onClick={logout}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      {/* Główna treść zmieniająca się dynamicznie */}
      <main className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}