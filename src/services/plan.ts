import { apiClient } from './api';
import { Plan, CreatePlanRequest } from '../types/plan';
import { PaginatedResponse } from '../types/common';

interface GetPlansParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const planService = {
  async getPlans(
    params: GetPlansParams = {},
  ): Promise<PaginatedResponse<Plan>> {
    const { page = 0, pageSize = 20, search } = params;

    // Build query string
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (search && search.trim()) {
      queryParams.append('search', search.trim());
    }

    return apiClient.get(`/plans?${queryParams.toString()}`);
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
