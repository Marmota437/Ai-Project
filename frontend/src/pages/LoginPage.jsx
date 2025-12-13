import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin);
    } catch (e) {
      alert("Błąd logowania");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4 font-bold">Zaloguj się</h2>
        <input {...register("email")} placeholder="Email" className="w-full mb-3 p-2 border rounded" />
        <input {...register("password")} type="password" placeholder="Hasło" className="w-full mb-4 p-2 border rounded" />
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded">Wejdź</button>
        <p className="mt-4 text-sm text-center">
            Nie masz konta? <span className="text-indigo-600 cursor-pointer" onClick={() => navigate('/register')}>Zarejestruj się</span>
        </p>
      </form>
    </div>
  );
}