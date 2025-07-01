import { Recipe } from './recipe';

export interface ScheduledRecipe {
  recipe: string | Recipe;
  only_recipe: boolean;
}

export interface PlanSchedule {
  su: ScheduledRecipe[];
  mo: ScheduledRecipe[];
  tu: ScheduledRecipe[];
  we: ScheduledRecipe[];
  th: ScheduledRecipe[];
  fr: ScheduledRecipe[];
  sa: ScheduledRecipe[];
}

export interface RemovedIngredient {
  recipe_id: string;
  ingredient_uid: number;
}

export interface Plan {
  _id: string;
  user_id: number;
  slug: string;
  name: string;
  schedule: PlanSchedule;
  removed_ingredient_ids: RemovedIngredient[];
  created_at: string;
  updated_at: string;
}

export type DayOfWeek = 'su' | 'mo' | 'tu' | 'we' | 'th' | 'fr' | 'sa';

export const DAYS_OF_WEEK: {
  value: DayOfWeek;
  label: string;
  fullName: string;
}[] = [
  { value: 'su', label: 'Sun', fullName: 'Sunday' },
  { value: 'mo', label: 'Mon', fullName: 'Monday' },
  { value: 'tu', label: 'Tue', fullName: 'Tuesday' },
  { value: 'we', label: 'Wed', fullName: 'Wednesday' },
  { value: 'th', label: 'Thu', fullName: 'Thursday' },
  { value: 'fr', label: 'Fri', fullName: 'Friday' },
  { value: 'sa', label: 'Sat', fullName: 'Saturday' },
];

export interface GetPlansRequest {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CreatePlanRequest {
  name: string;
  schedule: PlanSchedule;
  removed_ingredient_ids: string[];
}

export interface PlanFilters {
  search?: string;
}
