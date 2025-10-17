export type DietaryPreferenceType = 'avoid' | 'dislike';

export interface DietaryPreferenceItem {
  id: string;
  name: string;
  type: DietaryPreferenceType;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface DietaryPreferences {
  _id: string;
  user_id: number;
  preferences: DietaryPreferenceItem[];
  created_at: string;
  updated_at: string;
}

export interface DietaryPreferenceStats {
  total: number;
  avoid: number;
  dislike: number;
}

export interface DietaryPreferenceFilters {
  search?: string;
  type?: DietaryPreferenceType;
  page?: number;
  pageSize?: number;
}

export interface AddDietaryPreferenceRequest {
  name: string;
  type: DietaryPreferenceType;
  reason?: string;
}

export interface DietaryPreferencesResponse {
  data: DietaryPreferenceItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}
