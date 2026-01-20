import { apiClient } from './api';
import {
  NutritionProfile,
  CreateNutritionProfileRequest,
  UpdateNutritionProfileRequest,
  UpdateTargetMacrosRequest,
  AnalyzeBodyFatRequest,
  AnalyzeBodyFatResponse,
  AIAdviceResponse,
} from '../types/nutrition';

export const nutritionService = {
  async getProfile(): Promise<NutritionProfile> {
    return apiClient.get('/nutrition-profile');
  },

  async createProfile(
    data: CreateNutritionProfileRequest,
  ): Promise<NutritionProfile> {
    return apiClient.post('/nutrition-profile', data);
  },

  async updateProfile(
    data: UpdateNutritionProfileRequest,
  ): Promise<NutritionProfile> {
    return apiClient.put('/nutrition-profile', data);
  },

  async deleteProfile(): Promise<void> {
    return apiClient.delete('/nutrition-profile');
  },

  async analyzeBodyFat(
    data: AnalyzeBodyFatRequest,
  ): Promise<AnalyzeBodyFatResponse> {
    return apiClient.post('/nutrition-profile/analyze-body-fat', data);
  },

  async getAIAdvice(): Promise<AIAdviceResponse> {
    return apiClient.post('/nutrition-profile/ai-advice');
  },

  async updateTargetMacros(
    data: UpdateTargetMacrosRequest,
  ): Promise<NutritionProfile> {
    return apiClient.put('/nutrition-profile/target-macros', data);
  },
};
