import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-bold mb-4">Witaj w Family Manager</h1>
      <div className="space-x-4">
        <Link to="/login" className="text-blue-500 hover:underline">Zaloguj się</Link>
        <Link to="/register" className="text-blue-500 hover:underline">Zarejestruj się</Link>
      </div>
    </div>
  );
};