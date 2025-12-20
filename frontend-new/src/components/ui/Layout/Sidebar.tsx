import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { LayoutDashboard, Wallet, CheckSquare, LogOut, Users } from 'lucide-react';
import { clsx } from 'clsx';

export const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { to: '/dashboard', label: 'Pulpit', icon: LayoutDashboard },
    { to: '/finances', label: 'Finanse', icon: Wallet },
    { to: '/tasks', label: 'Zadania', icon: CheckSquare },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 hidden md:flex z-50">
      {/* LOGO */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="bg-blue-600 p-1.5 rounded-lg mr-3">
          <Users className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-gray-800 tracking-tight">FamilyApp</span>
      </div>

      {/* NAWIGACJA */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* STOPKA Z WYLOGOWANIEM */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
        >
          <LogOut size={20} />
          Wyloguj się
        </button>
      </div>
    </aside>
  );
};