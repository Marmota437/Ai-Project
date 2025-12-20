import { api } from '../lib/axios';

export interface SavingsStatus {
  paid_this_month: boolean;
  total_family_savings: number;
  payment_amount: number;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  is_completed: boolean;
  family_id: number;
}

export const financeApi = {
  getSavingsStatus: async () => {
    const response = await api.get<SavingsStatus>('/finance/savings/status');
    return response.data;
  },

  payMonthlySavings: async () => {
    const response = await api.post('/finance/savings/pay');
    return response.data;
  },

  getGoals: async () => {
    const response = await api.get<Goal[]>('/finance/goals');
    return response.data;
  },

  createGoal: async (name: string, target: number) => {
    const response = await api.post<Goal>(
      `/finance/goals?name=${encodeURIComponent(name)}&target=${target}`
    );
    return response.data;
  },

  contributeToGoal: async (goalId: number, amount: number) => {
    const response = await api.post(
      `/finance/goals/${goalId}/contribute?amount=${amount}`
    );
    return response.data;
  }
};