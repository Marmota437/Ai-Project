import { api } from '../lib/axios';

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  family_id: number | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  register: async (data: RegisterRequest) => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest) => {
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);

    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }
};