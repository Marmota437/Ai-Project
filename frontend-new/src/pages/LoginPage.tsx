import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useState } from 'react';
import { LogIn, ArrowRight } from 'lucide-react';

// Schemat walidacji
const loginSchema = z.object({
  email: z.string().email("Niepoprawny format email"),
  password: z.string().min(1, "Podaj hasło"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const loginResponse = await authApi.login(data);
      setToken(loginResponse.access_token);

      const user = await authApi.getMe();
      setUser(user);

      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      setServerError("Błędny email lub hasło.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden p-4">
      
      {/* TŁO: */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed"></div>

      {/* KARTA: */}
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 relative z-10 overflow-hidden animate-fade-in-up">
        
        {/* Górny pasek */}
        <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 w-full"></div>

        <div className="p-8">
          
          {/* Nagłówek */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 text-purple-600 mb-4 shadow-sm border border-purple-100">
              <LogIn size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Witaj ponownie!</h2>
            <p className="text-gray-500 text-sm mt-2">
              Zaloguj się, aby zarządzać finansami i zadaniami.
            </p>
          </div>

          {/* Wyświetlanie błędów */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2 animate-pulse">
              <span>⚠️</span>
              {serverError}
            </div>
          )}

          {/* Formularz */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input 
              label="Email" 
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

            <div className="flex justify-end">
                <a href="#" className="text-xs text-blue-600 hover:underline">Zapomniałeś hasła?</a>
            </div>

            {/* Przycisk*/}
            <Button 
              type="submit" 
              isLoading={isSubmitting} 
              className="w-full shadow-lg shadow-purple-500/20 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0"
            >
              Zaloguj się <ArrowRight size={18} className="ml-2" />
            </Button>
          </form>

          {/* Stopka */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            Nie masz jeszcze konta?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
              Zarejestruj się
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};