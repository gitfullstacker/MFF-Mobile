import { apiClient } from './api';
import {
  AskRecipeQuestionRequest,
  RecipeChatResponse,
  ChatHistoryRequest,
  ChatMessage,
  RecipeConversation,
} from '../types/recipeChat';
import { PaginatedResponse } from '../types/common';

export const recipeChatService = {
  /**
   * Ask a question about a recipe
   */
  async askQuestion(
    data: AskRecipeQuestionRequest,
  ): Promise<RecipeChatResponse> {
    return apiClient.post('/recipe-chat/ask', data);
  },

  /**
   * Get chat history for a recipe
   */
  async getChatHistory(
    params: ChatHistoryRequest,
  ): Promise<PaginatedResponse<ChatMessage>> {
    const queryParams = new URLSearchParams({
      recipeId: params.recipeId,
    });

    if (params.conversationId) {
      queryParams.append('conversationId', params.conversationId);
    }

    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }

    if (params.pageSize !== undefined) {
      queryParams.append('pageSize', params.pageSize.toString());
    }

    return apiClient.get(`/recipe-chat/history?${queryParams.toString()}`);
  },

  /**
   * Get all conversations for a recipe
   */
  async getRecipeConversations(
    recipeId: string,
  ): Promise<RecipeConversation[]> {
    return apiClient.get(`/recipe-chat/conversations/${recipeId}`);
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(
    recipeId: string,
    conversationId: string,
  ): Promise<void> {
    return apiClient.delete(
      `/recipe-chat/conversations/${recipeId}/${conversationId}`,
    );
  },
};
