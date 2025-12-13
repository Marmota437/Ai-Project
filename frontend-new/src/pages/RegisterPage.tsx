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
    setServerError(null);
    try {
      // 1. Rejestracja
      await authApi.register({
        email: data.email,
        password: data.password,
        full_name: data.name // Mapujemy name z formularza na full_name backendu
      });

      // 2. Automatyczne logowanie po rejestracji (UX improvement)
      const loginResponse = await authApi.login({
        email: data.email,
        password: data.password
      });
      setToken(loginResponse.access_token);
      
      const user = await authApi.getMe();
      setUser(user);

      // Jeśli był kod zaproszenia, tutaj wywołamy API do dołączenia (zrobimy to w kolejnym kroku)
      if (familyCode) {
         // TODO: Call joinFamily(familyCode)
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      setServerError(error.response?.data?.message || "Wystąpił błąd podczas rejestracji.");
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