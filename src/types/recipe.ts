export type RecipeType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'dessert'
  | 'side-dish';

export interface IngredientItem {
  uid: number;
  name: string;
  amount: string;
  unit: string;
  notes: string;
}

export interface IngredientGroup {
  group_name: string;
  group_uid: number;
  items: IngredientItem[];
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
  serving_size: number;
  serving_unit: string;
  calories: number;
  carbohydrates: number;
  protein: number;
  fat: number;
}

export interface Tag {
  term_id: number;
  name: string;
  slug: string;
}

export interface Recipe {
  _id: string;
  recipe_id: number;
  slug: string;
  name: string;
  image_url: string;
  thumb_image_url: string;
  description: string;
  prep_time: number;
  cook_time: number;
  total_time: number;
  servings: number;
  servings_unit: string;
  ingredients: IngredientGroup[];
  instructions: InstructionGroup[];
  nutrition: NutritionInfo;
  tags: {
    term_id: number;
    course: Tag[];
    cuisine: Tag[];
    keyword: Tag[];
  };
  rating: {
    average: number;
    count: number;
  };
  notes: string;
  parent_post_id: number;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
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
  useDietaryPreferences?: boolean;
}

export interface RecipeComment {
  id: string | number;
  content:
    | {
        rendered: string;
      }
    | string;
  rating?: number;
  author?: string | number;
  author_name?: string;
  created_at?: string;
  date?: string;
  date_gmt?: string;
  meta?: {
    wprm_comment_rating?: number;
  };
}
