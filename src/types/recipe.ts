export interface Ingredient {
  uid: number;
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}

export interface IngredientGroup {
  group_name: string;
  group_uid: number;
  items: Ingredient[];
}

export interface InstructionStep {
  uid: number;
  text: string;
}

export interface InstructionGroup {
  group_name: string;
  group_uid: number;
  steps: InstructionStep[];
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface Tag {
  id: number;
  name: string;
}

export interface RecipeTags {
  course: Tag[];
  cuisine: Tag[];
  keyword: Tag[];
}

export interface RecipeRating {
  average: number;
  count: number;
}

export interface Recipe {
  _id: string;
  recipe_id: number;
  slug: string;
  name: string;
  image_url: string;
  description: string;
  prep_time: number;
  cook_time: number;
  total_time: number;
  servings: number;
  servings_unit?: string;
  ingredients: IngredientGroup[];
  instructions: InstructionGroup[];
  nutrition: NutritionInfo;
  tags: RecipeTags;
  rating: RecipeRating;
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RecipeFilters {
  types?: string;
  proteinMin?: number;
  proteinMax?: number;
  carbsMin?: number;
  carbsMax?: number;
  fatMin?: number;
  fatMax?: number;
  timeMin?: number;
  timeMax?: number;
  year?: number;
  month?: number;
  search?: string;
  ingredients?: string;
  sort?: 'newest' | 'oldest' | 'timeAsc' | 'timeDesc';
  page?: number;
  pageSize?: number;
}

export interface RecipeComment {
  id: string;
  content: string;
  rating?: number;
  author: string;
  created_at: string;
}
