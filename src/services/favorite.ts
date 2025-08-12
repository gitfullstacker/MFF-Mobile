import { apiClient } from './api';
import { Recipe, RecipeFilters } from '../types/recipe';
import { PaginatedResponse } from '../types/common';

export const favoriteService = {
  async getFavorites(
    filters?: RecipeFilters,
  ): Promise<PaginatedResponse<Recipe>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    return apiClient.get(`/favorites?${params.toString()}`);
  },

  async getFavoriteIds(): Promise<{ ids: string[] }> {
    return apiClient.get('/favorites/ids');
  },

  async addFavorite(recipeId: string): Promise<void> {
    return apiClient.post(`/favorites/${recipeId}`);
  },

  async removeFavorite(recipeId: string): Promise<void> {
    return apiClient.delete(`/favorites/${recipeId}`);
  },

  async toggleFavorite(recipeId: string): Promise<{ isFavorite: boolean }> {
    return apiClient.post(`/favorites/${recipeId}/toggle`);
  },
};
