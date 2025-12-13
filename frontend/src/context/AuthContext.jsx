import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  // Funkcja pobierająca dane usera
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      // Zakładam endpoint /users/me w backendzie
      const { data } = await api.get('/users/me'); 
      setUser(data);
    } catch (error) {
      console.error("Błąd pobierania usera", error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    // Logika logowania
    const { data } = await api.post('/auth/login', { username: email, password }); 
    // Zakładam, że backend zwraca { access_token: "..." }
    localStorage.setItem('token', data.access_token);
    await fetchUser(); // Pobierz dane usera po zalogowaniu
  };

  const register = async (userData) => {
    // Logika rejestracji (tworzy usera i rodzinę w backendzie)
    await api.post('/auth/register', userData);
    // Po rejestracji od razu logujemy
    await login(userData.email, userData.password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);