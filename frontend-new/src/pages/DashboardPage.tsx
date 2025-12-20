import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
import { familyApi, type Family } from '../api/family';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { toast } from 'react-hot-toast';
import { ClipboardCopy, PiggyBank, CheckSquare, LogOut } from 'lucide-react'; // Ikony (zainstalowaliśmy je na początku)

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  
  const [family, setFamily] = useState<Family | null>(null);

  // Pobieranie danych usera i rodziny
  useEffect(() => {
    const init = async () => {
      if (!user) {
        try {
          const u = await authApi.getMe();
          setUser(u);
          if (u.family_id) {
            const f = await familyApi.getMyFamily();
            setFamily(f);
          }
        } catch (e) {
        }
      } else if (user.family_id && !family) {
        // Mamy usera, ale nie mamy rodziny w stanie
        try {
          const f = await familyApi.getMyFamily();
          setFamily(f);
        } catch (e) {
            console.error(e);
        }
      }
    };
    init();
  }, [user, setUser]);

  const copyCode = () => {
    if (family?.invite_code) {
      navigator.clipboard.writeText(family.invite_code);
      toast.success("Kod skopiowany do schowka!");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!user) return <div className="p-8 text-center">Ładowanie profilu...</div>;

  // SCENARIUSZ 1: Brak Rodziny
  if (!user.family_id) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-2">Witaj, {user.full_name}! 👋</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Aby zacząć, musisz dołączyć do rodziny lub stworzyć nową.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 w-full max-w-2xl">
          <div className="bg-white p-8 rounded-xl shadow-sm border text-center hover:shadow-md transition">
            <h2 className="text-xl font-bold mb-2">Stwórz Rodzinę 🏠</h2>
            <p className="text-sm text-gray-500 mb-6">Zostań administratorem i zaproś innych.</p>
            <Link to="/create-family">
              <Button>Utwórz nową</Button>
            </Link>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border text-center hover:shadow-md transition">
            <h2 className="text-xl font-bold mb-2">Dołącz do Rodziny 🔗</h2>
            <p className="text-sm text-gray-500 mb-6">Masz kod od żony/męża? Wpisz go.</p>
            <Link to="/join">
              <Button variant="secondary">Mam kod</Button>
            </Link>
          </div>
        </div>
        <button onClick={handleLogout} className="mt-12 text-gray-400 hover:text-gray-600 underline">
          Wyloguj się
        </button>
      </div>
    );
  }

  // SCENARIUSZ 2: Dashboard (Z Rodziną)
  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* NAGŁÓWEK */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Rodzina: {family?.name || "..."} 🏡
          </h1>
          <p className="text-gray-500">Zalogowany jako: <strong>{user.full_name}</strong></p>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0 items-center">
            {/* KOD ZAPROSZENIA */}
            {family && (
                <div className="flex flex-col items-end mr-4">
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Kod zaproszenia</span>
                    <button 
                        onClick={copyCode}
                        className="flex items-center gap-2 text-blue-600 font-mono font-bold text-lg hover:bg-blue-50 px-2 rounded transition"
                        title="Kliknij, aby skopiować"
                    >
                        {family.invite_code} <ClipboardCopy size={16} />
                    </button>
                </div>
            )}
            <Button variant="secondary" onClick={handleLogout} size="sm">
                <LogOut size={16} className="mr-2"/> Wyloguj
            </Button>
        </div>
      </div>
      
      {/* KAFELKI GŁÓWNE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KAFEL FINANSÓW */}
        <Link to="/finances" className="group">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl border border-green-200 hover:shadow-lg transition-all h-full relative overflow-hidden">
            <PiggyBank size={48} className="text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Finanse & Cele</h2>
            <p className="text-green-800 opacity-80">
              Sprawdź stan konta, wpłać miesięczną składkę i zarządzaj celami oszczędnościowymi.
            </p>
            <div className="absolute right-4 bottom-4 bg-white/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
                ➡️
            </div>
          </div>
        </Link>

        {/* KAFEL ZADAŃ */}
        <Link to="/tasks" className="group">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border border-blue-200 hover:shadow-lg transition-all h-full relative overflow-hidden">
            <CheckSquare size={48} className="text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Zadania Domowe</h2>
            <p className="text-blue-800 opacity-80">
              Sprawdź co jest do zrobienia, przypisz zadania innym i oceniaj wykonanie.
            </p>
             <div className="absolute right-4 bottom-4 bg-white/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
                ➡️
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};