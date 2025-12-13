import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// automatycznie dodaje token gdy już zrobimy logowanie
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Zakładamy, że token będzie w localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});