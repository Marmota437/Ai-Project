import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
import { familyApi, type Family } from '../api/family';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { toast } from 'react-hot-toast';
import { ClipboardCopy, PiggyBank, CheckSquare, LogOut, UserCircle, Plus, Users, ArrowRight } from 'lucide-react';

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  
  const [family, setFamily] = useState<Family | null>(null);

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
        } catch (e) {}
      } else if (user.family_id && !family) {
        try {
          const f = await familyApi.getMyFamily();
          setFamily(f);
        } catch (e) { console.error(e); }
      }
    };
    init();
  }, [user, setUser]);

  const copyCode = () => {
    if (family?.invite_code) {
      navigator.clipboard.writeText(family.invite_code);
      toast.success("Kod skopiowany do schowka! Wyślij go bliskim.");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!user) return <div className="flex h-screen items-center justify-center text-blue-600 animate-pulse">Ładowanie profilu...</div>;

  // --- SCENARIUSZ 1: BRAK RODZINY ---
  if (!user.family_id) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative overflow-hidden rounded-3xl my-4">
        {/* TŁO ANIMOWANE */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float-delayed"></div>

        <div className="relative z-10 text-center mb-10 animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
            <span className="text-4xl">👋</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Cześć, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user.full_name}</span>!
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Wygląda na to, że nie należysz jeszcze do żadnej rodziny. <br/>
            Wybierz jedną z opcji, aby rozpocząć.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 w-full max-w-3xl relative z-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          
          {/* KARTA: STWÓRZ */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-50 hover:border-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
              <Plus size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Stwórz Rodzinę</h2>
            <p className="text-gray-500 mb-8">
              Zostań administratorem. Utwórz nową przestrzeń, ustal zasady finansowe i zaproś domowników.
            </p>
            <Link to="/create-family">
              <Button className="w-full py-3 text-lg shadow-lg shadow-blue-500/20">
                Rozpocznij tutaj <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* KARTA: DOŁĄCZ */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-purple-50 hover:border-purple-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="bg-purple-50 w-14 h-14 rounded-full flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dołącz do Rodziny</h2>
            <p className="text-gray-500 mb-8">
              Otrzymałeś kod zaproszenia? Wpisz go, aby dołączyć do istniejącej grupy.
            </p>
            <Link to="/join">
              <Button variant="secondary" className="w-full py-3 text-lg bg-gray-100 hover:bg-gray-200 text-gray-800">
                Wpisz kod <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
        
        <button onClick={handleLogout} className="mt-12 text-sm text-gray-400 hover:text-red-500 font-medium transition-colors flex items-center gap-2">
          <LogOut size={16} /> Wyloguj się
        </button>
      </div>
    );
  }

  // --- SCENARIUSZ 2: DASHBOARD GŁÓWNY ---
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 pb-12">
      
      {/* SEKCJA HEADER (Profil + Rodzina) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        {/* Dekoracja tła */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        
        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
             <span className="text-2xl font-bold">{user.full_name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Rodzina <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{family?.name}</span>
            </h1>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <UserCircle size={18} />
              <span>Zalogowany jako <strong>{user.full_name}</strong></span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3 z-10 w-full md:w-auto">
            {family && (
                <div className="bg-slate-50 border border-slate-200 p-1.5 pl-4 rounded-xl flex items-center gap-3 w-full md:w-auto justify-between">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kod zaproszenia</div>
                    <button 
                        onClick={copyCode}
                        className="bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-600 font-mono font-bold text-lg px-4 py-1.5 rounded-lg shadow-sm border border-slate-100 transition-all active:scale-95 flex items-center gap-2 group"
                        title="Kliknij, aby skopiować"
                    >
                        {family.invite_code} 
                        <ClipboardCopy size={16} className="text-slate-400 group-hover:text-blue-500" />
                    </button>
                </div>
            )}
        </div>
      </div>
      
      {/* GRID KAFELKÓW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        
        {/* KAFEL FINANSÓW */}
        <Link to="/finances" className="group relative">
          <div className="absolute inset-0 bg-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-100/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between z-10">
            
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
               <PiggyBank size={180} />
            </div>

            <div>
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <PiggyBank size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                Finanse
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Monitoruj wspólne oszczędności, sprawdzaj status wpłat i realizuj cele finansowe.
              </p>
            </div>
            
            <div className="mt-8 flex items-center text-emerald-600 font-bold group-hover:translate-x-2 transition-transform">
              Przejdź do finansów <ArrowRight className="ml-2" />
            </div>
          </div>
        </Link>

        {/* KAFEL ZADAŃ */}
        <Link to="/tasks" className="group relative">
          <div className="absolute inset-0 bg-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-100/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between z-10">
            
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
               <CheckSquare size={180} />
            </div>

            <div>
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:-rotate-12 transition-transform duration-300">
                <CheckSquare size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                Zadania
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Zarządzaj domowymi obowiązkami, przypisuj zadania i oceniaj ich wykonanie.
              </p>
            </div>
            
            <div className="mt-8 flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
              Przejdź do zadań <ArrowRight className="ml-2" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};