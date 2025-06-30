import { apiClient } from './api';
import { Recipe, RecipeFilters, RecipeComment } from '../types/recipe';
import { PaginatedResponse } from '../types/common';

export const recipeService = {
  async getRecipes(
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

    return apiClient.get(`/recipes?${params.toString()}`);
  },

  async getRecipe(slug: string): Promise<Recipe> {
    return apiClient.get(`/recipes/${slug}`);
  },

  async getRecipeComments(
    id: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{
    data: RecipeComment[];
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    return apiClient.get(`/recipes/${id}/comments?${params.toString()}`);
  },

  async addComment(
    id: string,
    data: { content: string; rating?: number },
  ): Promise<RecipeComment> {
    return apiClient.post(`/recipes/${id}/comments`, data);
  },
};
