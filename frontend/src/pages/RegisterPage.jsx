import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // Backend powinien przy rejestracji tworzyć nową rodzinę
      await registerUser(data);
      navigate('/dashboard');
    } catch (e) {
      alert("Błąd rejestracji");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4 font-bold">Zarejestruj nową rodzinę</h2>
        <input {...register("email")} placeholder="Email" className="w-full mb-3 p-2 border rounded" />
        <input {...register("username")} placeholder="Nazwa użytkownika" className="w-full mb-3 p-2 border rounded" />
        <input {...register("familyName")} placeholder="Nazwa Rodziny" className="w-full mb-3 p-2 border rounded" />
        <input {...register("password")} type="password" placeholder="Hasło" className="w-full mb-4 p-2 border rounded" />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Stwórz konto</button>
      </form>
    </div>
  );
}