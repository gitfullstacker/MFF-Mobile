import { apiClient } from './api';
import {
  DietaryPreferences,
  DietaryPreferenceStats,
  DietaryPreferenceFilters,
  AddDietaryPreferenceRequest,
  DietaryPreferencesResponse,
} from '../types/dietaryPreference';

export const dietaryPreferenceService = {
  /**
   * Get dietary preferences with filtering and pagination
   */
  async getDietaryPreferences(
    filters?: DietaryPreferenceFilters,
  ): Promise<DietaryPreferencesResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString
      ? `/dietary-preferences?${queryString}`
      : '/dietary-preferences';

    return apiClient.get(url);
  },

  /**
   * Get preferences statistics
   */
  async getStats(): Promise<DietaryPreferenceStats> {
    return apiClient.get('/dietary-preferences/stats');
  },

  /**
   * Add dietary preference
   */
  async addDietaryPreference(
    data: AddDietaryPreferenceRequest,
  ): Promise<DietaryPreferences> {
    return apiClient.post('/dietary-preferences', data);
  },

  /**
   * Remove dietary preference
   */
  async removeDietaryPreference(preferenceId: string): Promise<void> {
    return apiClient.delete(`/dietary-preferences/${preferenceId}`);
  },

  /**
   * Remove all dietary preferences for the user
   */
  async removeAllPreferences(): Promise<{ message: string; deleted: number }> {
    return apiClient.delete('/dietary-preferences/all');
  },
};
