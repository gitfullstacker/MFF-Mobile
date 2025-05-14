import { apiClient } from './api';
import { MealPlan, CreateMealPlanRequest } from '../types/plan';
import { PaginatedResponse } from '../types/common';

export const planService = {
  async getPlans(
    page = 0,
    pageSize = 20,
  ): Promise<PaginatedResponse<MealPlan>> {
    return apiClient.get(`/plans?page=${page}&pageSize=${pageSize}`);
  },

  async getPlan(id: string): Promise<MealPlan> {
    return apiClient.get(`/plans/${id}`);
  },

  async createPlan(data: CreateMealPlanRequest): Promise<MealPlan> {
    return apiClient.post('/plans', data);
  },

  async updatePlan(id: string, data: Partial<MealPlan>): Promise<MealPlan> {
    return apiClient.put(`/plans/${id}`, data);
  },

  async deletePlan(id: string): Promise<void> {
    return apiClient.delete(`/plans/${id}`);
  },

  async duplicatePlan(id: string): Promise<MealPlan> {
    return apiClient.post(`/plans/${id}/duplicate`);
  },
};
