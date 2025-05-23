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
};
