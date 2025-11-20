import {
  CreateRecipeNoteDto,
  RecipeNote,
  UpdateRecipeNoteDto,
} from '@/types/recipeNote';
import { apiClient } from './api';

export const recipeNoteService = {
  /**
   * Get all notes for the authenticated user
   */
  async getAllNotes(): Promise<RecipeNote[]> {
    return apiClient.get('/recipe-notes');
  },

  /**
   * Get a note for a specific recipe
   */
  async getNoteByRecipeId(recipeId: string): Promise<RecipeNote | null> {
    try {
      return apiClient.get(`/recipe-notes/${recipeId}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create or update a note for a recipe (upsert)
   */
  async createOrUpdateNote(
    recipeId: string,
    data: CreateRecipeNoteDto,
  ): Promise<RecipeNote> {
    return apiClient.post(`/recipe-notes/${recipeId}`, data);
  },

  /**
   * Update a note for a specific recipe
   */
  async updateNote(
    recipeId: string,
    data: UpdateRecipeNoteDto,
  ): Promise<RecipeNote> {
    return apiClient.put(`/recipe-notes/${recipeId}`, data);
  },

  /**
   * Delete a note for a specific recipe
   */
  async deleteNote(recipeId: string): Promise<void> {
    return apiClient.delete(`/recipe-notes/${recipeId}`);
  },

  /**
   * Check if a note exists for a specific recipe
   */
  async checkNoteExists(recipeId: string): Promise<boolean> {
    const response = await apiClient.get<{ exists: boolean }>(
      `/recipe-notes/${recipeId}/exists`,
    );
    return response.exists;
  },
};
