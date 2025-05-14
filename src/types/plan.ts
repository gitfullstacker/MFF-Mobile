export interface ScheduledRecipe {
  recipe: string;
  only_recipe: boolean;
}

export interface MealSchedule {
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
  ingredient_id: string;
}

export interface MealPlan {
  _id: string;
  user_id: number;
  slug: string;
  name: string;
  schedule: MealSchedule;
  removed_ingredient_ids: RemovedIngredient[];
  created_at: string;
  updated_at: string;
}

export interface CreateMealPlanRequest {
  name: string;
  schedule: MealSchedule;
  removed_ingredient_ids: string[];
}
