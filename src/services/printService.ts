import { apiClient } from './api';
import {
  PrintRecipeRequest,
  PrintQuotaInfo,
  CanPrintResponse,
  PrintAnalytics,
  RecipePrintStats,
  OverallPrintStats,
} from '../types/print';

export const printService = {
  /**
   * Print or preview a recipe (get printable HTML)
   */
  async printRecipe(data: PrintRecipeRequest): Promise<string> {
    return await apiClient.post('/print/recipe', data);
  },

  /**
   * Get user's print quota information
   */
  async getQuotaInfo(): Promise<PrintQuotaInfo> {
    return apiClient.get('/print/quota');
  },

  /**
   * Check if user can print (quick check)
   */
  async canPrint(): Promise<CanPrintResponse> {
    return apiClient.get('/print/can-print');
  },

  /**
   * Get print analytics for most printed recipes
   */
  async getMostPrintedRecipes(limit?: number): Promise<PrintAnalytics[]> {
    return apiClient.get('/print/analytics/most-printed', {
      params: { limit },
    });
  },

  /**
   * Get print statistics for a specific recipe
   */
  async getRecipeStats(recipeId: number): Promise<RecipePrintStats> {
    return apiClient.get('/print/analytics/recipe', {
      params: { recipe_id: recipeId },
    });
  },

  /**
   * Get overall print statistics
   */
  async getOverallStats(): Promise<OverallPrintStats> {
    return apiClient.get('/print/analytics/overall');
  },
};
