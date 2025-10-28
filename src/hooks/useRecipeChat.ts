import { useState, useCallback, useRef } from 'react';
import { useAtom } from 'jotai';
import { addToastAtom } from '../store';
import { recipeChatService } from '../services/recipeChatService';
import {
  RecipeChatState,
  AskRecipeQuestionRequest,
  RecipeConversation,
} from '../types/recipeChat';

export const useRecipeChat = (recipeId: string) => {
  const [, addToast] = useAtom(addToastAtom);
  const [state, setState] = useState<RecipeChatState>({
    isLoading: false,
    messages: [],
    suggestedQuestions: [],
  });

  const conversationIdRef = useRef<string | undefined>(undefined);

  const askQuestion = useCallback(
    async (question: string) => {
      if (!question.trim()) return;

      setState(prev => ({ ...prev, isLoading: true, error: undefined }));

      try {
        const request: AskRecipeQuestionRequest = {
          recipeId,
          question: question.trim(),
          conversationId: conversationIdRef.current,
        };

        const response = await recipeChatService.askQuestion(request);

        // Update conversation ID reference
        conversationIdRef.current = response.conversationId;

        setState(prev => ({
          ...prev,
          isLoading: false,
          messages: response.chatHistory,
          conversationId: response.conversationId,
          suggestedQuestions: response.suggestedQuestions || [],
        }));

        return response;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          'Failed to get response. Please try again.';

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        addToast({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        });

        throw error;
      }
    },
    [recipeId, addToast],
  );

  const loadChatHistory = useCallback(
    async (conversationId?: string) => {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));

      try {
        const response = await recipeChatService.getChatHistory({
          recipeId,
          conversationId,
          page: 0,
          pageSize: 50,
        });

        conversationIdRef.current = conversationId;

        setState(prev => ({
          ...prev,
          isLoading: false,
          messages: response.data,
          conversationId,
        }));

        return response.data;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          'Failed to load chat history. Please try again.';

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        addToast({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        });

        throw error;
      }
    },
    [recipeId, addToast],
  );

  const getConversations = useCallback(async (): Promise<
    RecipeConversation[]
  > => {
    try {
      return await recipeChatService.getRecipeConversations(recipeId);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to load conversations. Please try again.';

      addToast({
        message: errorMessage,
        type: 'error',
        duration: 5000,
      });

      throw error;
    }
  }, [recipeId, addToast]);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        await recipeChatService.deleteConversation(recipeId, conversationId);

        // If we're deleting the current conversation, reset state
        if (conversationIdRef.current === conversationId) {
          setState({
            isLoading: false,
            messages: [],
            suggestedQuestions: [],
          });
          conversationIdRef.current = undefined;
        }

        addToast({
          message: 'Conversation deleted successfully',
          type: 'success',
          duration: 3000,
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          'Failed to delete conversation. Please try again.';

        addToast({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        });

        throw error;
      }
    },
    [recipeId, addToast],
  );

  return {
    ...state,
    askQuestion,
    loadChatHistory,
    getConversations,
    deleteConversation,
  };
};
