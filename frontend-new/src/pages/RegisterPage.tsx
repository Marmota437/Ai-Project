import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useState } from 'react';

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
      // KROK 1: Rejestracja
      console.log("📤 2. Wysyłam zapytanie do /auth/register...");
      const registerResponse = await authApi.register({
        email: data.email,
        password: data.password,
        full_name: data.name // Upewnij się, że mapujesz name -> full_name
      });
      console.log("✅ 3. Rejestracja udana! Odpowiedź backendu:", registerResponse);

      // KROK 2: Logowanie
      console.log("📤 4. Próbuję się automatycznie zalogować...");
      const loginResponse = await authApi.login({
        email: data.email,
        password: data.password
      });
      console.log("✅ 5. Logowanie udane! Token:", loginResponse.access_token);
      
      setToken(loginResponse.access_token);

      // KROK 3: Pobranie Usera
      console.log("📤 6. Pobieram dane użytkownika (/auth/me)...");
      const user = await authApi.getMe();
      console.log("✅ 7. Dane użytkownika pobrane:", user);
      
      setUser(user);

      // Jeśli był kod zaproszenia
      if (familyCode) {
         console.log("💌 8. Wykryto kod zaproszenia, próbuję dołączyć...");
         // Tutaj byłoby familyApi.join(familyCode)
      }

      console.log("🏁 9. Przekierowuję na Dashboard...");
      navigate('/dashboard');

    } catch (error: any) {
      console.error("❌ WYSTĄPIŁ BŁĄD:", error);
      
      // Sprawdźmy co dokładnie zwrócił axios
      if (error.response) {
        console.error("Status błędu:", error.response.status);
        console.error("Dane błędu:", error.response.data);
        setServerError(error.response.data?.detail || "Błąd serwera");
      } else if (error.request) {
        console.error("Brak odpowiedzi od serwera (Backend nie działa lub CORS blokuje)");
        setServerError("Serwer nie odpowiada. Sprawdź czy backend działa.");
      } else {
        setServerError("Wystąpił nieznany błąd aplikacji.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {familyCode ? "Dołącz do rodziny" : "Załóż nowe konto"}
        </h2>
        
        {familyCode && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm text-center">
            Rejestrujesz się z kodem zaproszenia: <strong>{familyCode}</strong>
          </div>
        )}

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input 
            label="Imię" 
            {...register('name')} 
            error={errors.name?.message} 
          />
          <Input 
            label="Email" 
            type="email" 
            {...register('email')} 
            error={errors.email?.message} 
          />
          <Input 
            label="Hasło" 
            type="password" 
            {...register('password')} 
            error={errors.password?.message} 
          />

          <Button type="submit" isLoading={isSubmitting} className="mt-4">
            Zarejestruj się
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Masz już konto?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
};

