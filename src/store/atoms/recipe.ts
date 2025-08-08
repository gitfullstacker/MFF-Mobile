import { atom } from 'jotai';
import { Recipe, RecipeFilters } from '../../types/recipe';

export const recipesAtom = atom<Recipe[]>([]);
export const selectedRecipeAtom = atom<Recipe | null>(null);
export const recipeFiltersAtom = atom<RecipeFilters>({ sort: 'newest' });
export const recentRecipesAtom = atom<Recipe[]>([]);
