import { apiClient } from './api';
import { Recipe } from '../types/recipe';
import { PaginatedResponse } from '../types/common';

export const favoriteService = {
  async getFavorites(
    page = 0,
    pageSize = 20,
  ): Promise<PaginatedResponse<Recipe>> {
    return apiClient.get(`/favorites?page=${page}&pageSize=${pageSize}`);
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
