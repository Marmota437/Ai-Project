import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000', // Zmienna środowiskowa
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dodawanie tokena do każdego zapytania
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Obsługa wygasłego tokena
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // może to dodać też? -> wymuszenie odświeżenia strony, by wylogować usera
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;