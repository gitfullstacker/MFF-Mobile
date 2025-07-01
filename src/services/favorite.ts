import { apiClient } from './api';
import { Recipe } from '../types/recipe';
import { PaginatedResponse } from '../types/common';
import { GetFavoritesRequest } from '@/types/favorite';

export const favoriteService = {
  async getFavorites(
    params: GetFavoritesRequest = {},
  ): Promise<PaginatedResponse<Recipe>> {
    const { page = 0, pageSize = 10, search } = params;

    // Build query string
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (search && search.trim()) {
      queryParams.append('search', search.trim());
    }

    return apiClient.get(`/favorites?${queryParams.toString()}`);
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
