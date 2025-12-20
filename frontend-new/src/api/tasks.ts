import { api } from '../lib/axios';

export interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'DONE';
  rating: number | null;
  assigned_to_id: number | null;
  created_by_id: number;
}

export interface UserBasic {
  id: number;
  full_name: string;
}

export const tasksApi = {
  getAll: async () => {
    const response = await api.get<Task[]>('/tasks/');
    return response.data;
  },

  create: async (title: string, assignedToId?: number) => {
    const url = `/tasks/?title=${encodeURIComponent(title)}` + 
                (assignedToId ? `&assigned_to_id=${assignedToId}` : '');
    const response = await api.post<Task>(url);
    return response.data;
  },

  complete: async (taskId: number) => {
    await api.post(`/tasks/${taskId}/complete`);
  },

  rate: async (taskId: number, rating: number) => {
    await api.post(`/tasks/${taskId}/rate?rating=${rating}`);
  },

  delete: async (taskId: number) => {
    await api.delete(`/tasks/${taskId}`);
  },

  getMembers: async () => {
    const response = await api.get<UserBasic[]>('/family/members');
    return response.data;
  },

  update: async (taskId: number, title: string, assignedToId?: number) => {
    const url = `/tasks/${taskId}?title=${encodeURIComponent(title)}` + 
                (assignedToId ? `&assigned_to_id=${assignedToId}` : '');
    const response = await api.put<Task>(url);
    return response.data;
  }
};