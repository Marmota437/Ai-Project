import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';

// Schemat walidacji
const registerSchema = z.object({
  name: z.string().min(2, "Imię musi mieć min. 2 znaki"),
  email: z.string().email("Niepoprawny format email"),
  password: z.string().min(6, "Hasło musi mieć min. 6 znaków"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Pobierz kod rodziny z URL (jeśli user wszedł przez link zaproszeniowy)
  const familyCode = searchParams.get('code');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log("🚀 1. Kliknięto przycisk rejestracji. Dane z formularza:", data);
    setServerError(null);
    
    try {
      console.log("📤 2. Wysyłam zapytanie do /auth/register...");
      const registerResponse = await authApi.register({
        email: data.email,
        password: data.password,
        full_name: data.name 
      });
      console.log("✅ 3. Rejestracja udana! Odpowiedź backendu:", registerResponse);

      console.log("📤 4. Próbuję się automatycznie zalogować...");
      const loginResponse = await authApi.login({
        email: data.email,
        password: data.password
      });
      console.log("✅ 5. Logowanie udane! Token:", loginResponse.access_token);
      
      setToken(loginResponse.access_token);

      console.log("📤 6. Pobieram dane użytkownika (/auth/me)...");
      const user = await authApi.getMe();
      console.log("✅ 7. Dane użytkownika pobrane:", user);
      
      setUser(user);

      if (familyCode) {
         console.log("💌 8. Wykryto kod zaproszenia, próbuję dołączyć...");
      }

      console.log("🏁 9. Przekierowuję na Dashboard...");
      navigate('/dashboard');

    } catch (error: any) {
      console.error("❌ WYSTĄPIŁ BŁĄD:", error);
      
      if (error.response) {
        setServerError(error.response.data?.detail || "Błąd serwera");
      } else if (error.request) {
        setServerError("Serwer nie odpowiada. Sprawdź czy backend działa.");
      } else {
        setServerError("Wystąpił nieznany błąd aplikacji.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden p-4">
      
      {/* TŁO: Nowe animacje 'float' */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed"></div>

      {/* KARTA: Animacja wejścia 'fade-in-up' */}
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 relative z-10 overflow-hidden animate-fade-in-up">
        
        {/* Górny pasek dekoracyjny */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 w-full"></div>

        <div className="p-8">
          {/* Nagłówek z Ikoną */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4 shadow-sm border border-blue-100">
              <Users size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {familyCode ? "Dołącz do rodziny" : "Stwórz konto"}
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Zacznij zarządzać domowym budżetem i zadaniami.
            </p>
          </div>
          
          {/* Alert o kodzie zaproszenia */}
          {familyCode && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-sm flex items-center gap-3">
              <span className="text-xl">📩</span>
              <div>
                Rejestrujesz się z kodem zaproszenia: <br/>
                <strong className="font-mono text-base">{familyCode}</strong>
              </div>
            </div>
          )}

          {/* Alert błędu */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2 animate-pulse">
              <span>⚠️</span>
              {serverError}
            </div>
          )}

          {/* Formularz */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input 
              label="Imię i Nazwisko" 
              placeholder="np. Jan Kowalski"
              {...register('name')} 
              error={errors.name?.message}
              className="bg-gray-50 border-gray-200 focus:bg-white"
            />
            <Input 
              label="Adres Email" 
              type="email" 
              placeholder="twoj@email.com"
              {...register('email')} 
              error={errors.email?.message} 
              className="bg-gray-50 border-gray-200 focus:bg-white"
            />
            <Input 
              label="Hasło" 
              type="password" 
              placeholder="••••••••"
              {...register('password')} 
              error={errors.password?.message} 
              className="bg-gray-50 border-gray-200 focus:bg-white"
            />

            {/* Przycisk z gradientem */}
            <Button 
              type="submit" 
              isLoading={isSubmitting} 
              className="w-full shadow-lg shadow-blue-500/20 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
            >
              Zarejestruj się <ArrowRight size={18} className="ml-2" />
            </Button>
          </form>

          {/* Stopka */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            Masz już konto?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
              Zaloguj się
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};