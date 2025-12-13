import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useState } from 'react';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Zaloguj się</h2>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
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
            Zaloguj się
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Nie masz konta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
};