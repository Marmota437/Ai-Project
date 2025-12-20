import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      
      {/* Główna zawartość - przesunięta o szerokość sidebaru na desktopie */}
      <main className="md:pl-64 min-h-screen transition-all">
        {/* Kontener na treść z marginesami */}
        <div className="max-w-7xl mx-auto p-4 md:p-8 pt-6">
          <Outlet /> {/* Tutaj renderują się Twoje strony (Dashboard, Tasks...) */}
        </div>
      </main>
    </div>
  );
};