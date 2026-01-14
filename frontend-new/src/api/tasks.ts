import { api } from '../lib/axios';

export interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'DONE';
  rating: number | null;
  assigned_to_id: number | null;
  created_by_id: number;
  deadline: string | null;
}

export interface TaskComment {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  task_id: number;
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

  create: async (title: string, assignedToId?: number, deadline?: string) => {
    let url = `/tasks/?title=${encodeURIComponent(title)}`;
    if (assignedToId) url += `&assigned_to_id=${assignedToId}`;
    if (deadline) url += `&deadline=${deadline}`;
    const response = await api.post<Task>(url);
    return response.data;
  },

  update: async (taskId: number, title: string, assignedToId?: number, deadline?: string) => {
    let url = `/tasks/${taskId}?title=${encodeURIComponent(title)}`;
    if (assignedToId) url += `&assigned_to_id=${assignedToId}`;
    if (deadline) url += `&deadline=${deadline}`;
    const response = await api.put<Task>(url);
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

  getComments: async (taskId: number) => {
    const response = await api.get<TaskComment[]>(`/tasks/${taskId}/comments`);
    return response.data;
  },

  addComment: async (taskId: number, content: string) => {
    const response = await api.post(`/tasks/${taskId}/comments?content=${encodeURIComponent(content)}`);
    return response.data;
  }
};