import { api } from '../lib/axios';

export interface Family {
  id: number;
  name: string;
  invite_code: string;
  owner_id: number;
  monthly_contribution: number;
}

export interface CreateFamilyRequest {
  name: string;
  monthly_amount: number;
}

export const familyApi = {
  create: async (data: CreateFamilyRequest) => {
    const response = await api.post<Family>(
      `/family/create?name=${encodeURIComponent(data.name)}&monthly_amount=${data.monthly_amount}`
    );
    return response.data;
  },

  join: async (code: string) => {
    const response = await api.post(`/family/join?code=${encodeURIComponent(code)}`);
    return response.data;
  }
};