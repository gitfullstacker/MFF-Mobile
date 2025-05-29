import { apiClient } from './api';
import { User } from '../types/user';
import { Plan } from '../types/plan';

export const userService = {
  async getProfile(): Promise<User> {
    return apiClient.get('/user/profile');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put('/user/profile', data);
  },

  async setActivePlan(planId: string): Promise<Plan> {
    return apiClient.post(`/user/active-plan/${planId}`);
  },

  async getActivePlan(): Promise<Plan | null> {
    try {
      return await apiClient.get('/user/active-plan');
    } catch (error: any) {
      // If no active plan is set, the API might return 404 or null
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
