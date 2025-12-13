import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  // Zabezpieczenie: jeśli wchodzimy na dashboard a user w store jest null (np. po odświeżeniu F5),
  // musimy go pobrać.
  useEffect(() => {
    if (!user) {
      authApi.getMe().then(setUser).catch(() => {
        // jak błąd tokena, to wyloguje przez interceptor lub ProtectedRoute
      });
    }
  }, [user, setUser]);

  if (!user) return <div className="p-8">Ładowanie profilu...</div>;

  // SCENARIUSZ 1: Użytkownik nie ma rodziny
  if (!user.family_id) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Witaj, {user.full_name}!</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Nie należysz jeszcze do żadnej rodziny. Aby korzystać z aplikacji, musisz stworzyć nową rodzinę lub dołączyć do istniejącej.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 w-full max-w-2xl">
          {/* Karta Tworzenia */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
            <h2 className="text-xl font-semibold mb-2">Stwórz Rodzinę</h2>
            <p className="text-sm text-gray-500 mb-4">
              Zostań administratorem, ustal zasady finansowe i zaproś innych.
            </p>
            <Link to="/create-family">
              <Button>Utwórz nową rodzinę</Button>
            </Link>
          </div>

          {/* Karta Dołączania */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
            <h2 className="text-xl font-semibold mb-2">Dołącz do Rodziny</h2>
            <p className="text-sm text-gray-500 mb-4">
              Masz kod zaproszenia? Wpisz go tutaj, aby dołączyć.
            </p>
            <Link to="/join">
              <Button variant="secondary">Mam kod zaproszenia</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SCENARIUSZ 2: Użytkownik ma rodzinę (Właściwy Dashboard)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Panel Rodziny</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kafel Finansów */}
        <Link to="/finances" className="block group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 transition-all h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Finanse 💰</h2>
              <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <p className="text-gray-600">
              Sprawdź stan oszczędności, wpłać składkę i zarządzaj celami.
            </p>
          </div>
        </Link>

        {/* Kafel Zadań */}
        <Link to="/tasks" className="block group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 transition-all h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Zadania 📝</h2>
              <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <p className="text-gray-600">
              Sprawdź swoje obowiązki, zlecaj zadania innym i oceniaj wykonanie.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};