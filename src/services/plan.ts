import { apiClient } from './api';
import { Plan, CreatePlanRequest } from '../types/plan';
import { PaginatedResponse } from '../types/common';

export const planService = {
  async getPlans(page = 0, pageSize = 20): Promise<PaginatedResponse<Plan>> {
    return apiClient.get(`/plans?page=${page}&pageSize=${pageSize}`);
  },

  async getPlan(id: string): Promise<Plan> {
    return apiClient.get(`/plans/${id}`);
  },

  async createPlan(data: CreatePlanRequest): Promise<Plan> {
    return apiClient.post('/plans', data);
  },

  async updatePlan(id: string, data: Partial<Plan>): Promise<Plan> {
    return apiClient.put(`/plans/${id}`, data);
  },

  async deletePlan(id: string): Promise<void> {
    return apiClient.delete(`/plans/${id}`);
  },

  async duplicatePlan(id: string): Promise<Plan> {
    return apiClient.post(`/plans/${id}/duplicate`);
  },

  async getActivePlan(): Promise<Plan | null> {
    try {
      return await apiClient.get('/plans/active');
    } catch (error: any) {
      // If no active plan is set, the API might return 404 or null
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async setActivePlan(planId: string): Promise<Plan> {
    return apiClient.post(`/plans/active/${planId}`);
  },
};
