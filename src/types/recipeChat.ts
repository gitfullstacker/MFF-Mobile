export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface RecipeChat {
  _id: string;
  user_id: number;
  recipe_id: string;
  conversation_id: string;
  messages: ChatMessage[];
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface AskRecipeQuestionRequest {
  recipeId: string;
  question: string;
  conversationId?: string;
}

export interface RecipeChatResponse {
  conversationId: string;
  response: string;
  chatHistory: ChatMessage[];
  suggestedQuestions?: string[];
  timestamp: number;
}

export interface ChatHistoryRequest {
  recipeId: string;
  conversationId?: string;
  page?: number;
  pageSize?: number;
}

export interface RecipeConversation {
  conversation_id: string;
  last_activity: string;
  message_count: number;
  preview: string;
  created_at: string;
}

export interface RecipeChatState {
  isLoading: boolean;
  messages: ChatMessage[];
  conversationId?: string;
  error?: string;
  suggestedQuestions: string[];
}
