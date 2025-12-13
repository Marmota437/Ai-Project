import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { familyApi } from '../api/family';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const JoinFamilyPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  
  const urlCode = searchParams.get('code') || '';
  const [code, setCode] = useState(urlCode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await familyApi.join(code);
      
      const updatedUser = await authApi.getMe();
      setUser(updatedUser);
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError("Nieprawidłowy kod lub już należysz do rodziny.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Dołącz do rodziny</h1>
      <p className="text-gray-600 mb-6">
        Wpisz kod, który otrzymałeś od administratora rodziny.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleJoin}>
        <Input
          label="Kod zaproszenia"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Wklej kod tutaj..."
          required
        />

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
            Wróć
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!code}>
            Dołącz
          </Button>
        </div>
      </form>
    </div>
  );
};