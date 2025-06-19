import { atom } from 'jotai';
import { Recipe } from '../../types/recipe';

export const favoriteRecipesAtom = atom<Recipe[]>([]);
export const favoriteRecipeIdsAtom = atom<string[]>([]);
