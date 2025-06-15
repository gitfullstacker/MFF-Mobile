import { useCallback } from 'react';
import { useAtom } from 'jotai';
import {
  favoriteRecipeIdsAtom,
  recipesAtom,
  selectedRecipeAtom,
  addToastAtom,
} from '../store';
import { favoriteService } from '../services/favorite';

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useAtom(favoriteRecipeIdsAtom);
  const [recipes, setRecipes] = useAtom(recipesAtom);
  const [selectedRecipe, setSelectedRecipe] = useAtom(selectedRecipeAtom);
  const [, addToast] = useAtom(addToastAtom);

  const toggleFavorite = useCallback(
    async (recipeId: string) => {
      try {
        const { isFavorite } = await favoriteService.toggleFavorite(recipeId);

        // Update global favorite IDs
        if (isFavorite) {
          setFavoriteIds([...favoriteIds, recipeId]);
        } else {
          setFavoriteIds(favoriteIds.filter(id => id !== recipeId));
        }

        // Update recipes in main recipes list (for RecipesScreen)
        setRecipes(
          recipes.map(recipe =>
            recipe._id === recipeId
              ? { ...recipe, is_favorite: isFavorite }
              : recipe,
          ),
        );

        // Update selected recipe if it's the same
        if (selectedRecipe?._id === recipeId) {
          setSelectedRecipe({ ...selectedRecipe, is_favorite: isFavorite });
        }

        addToast({
          message: isFavorite ? 'Added to favorites' : 'Removed from favorites',
          type: 'success',
          duration: 3000,
        });

        return { isFavorite };
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to update favorite',
          type: 'error',
          duration: 5000,
        });
        throw error;
      }
    },
    [
      favoriteIds,
      recipes,
      selectedRecipe,
      setFavoriteIds,
      setRecipes,
      setSelectedRecipe,
      addToast,
    ],
  );

  const addFavorite = useCallback(
    async (recipeId: string) => {
      try {
        await favoriteService.addFavorite(recipeId);

        // Update global favorite IDs
        setFavoriteIds([...favoriteIds, recipeId]);

        // Update recipes in main recipes list
        setRecipes(
          recipes.map(recipe =>
            recipe._id === recipeId ? { ...recipe, is_favorite: true } : recipe,
          ),
        );

        // Update selected recipe if it's the same
        if (selectedRecipe?._id === recipeId) {
          setSelectedRecipe({ ...selectedRecipe, is_favorite: true });
        }

        addToast({
          message: 'Added to favorites',
          type: 'success',
          duration: 3000,
        });
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to add favorite',
          type: 'error',
          duration: 5000,
        });
        throw error;
      }
    },
    [
      favoriteIds,
      recipes,
      selectedRecipe,
      setFavoriteIds,
      setRecipes,
      setSelectedRecipe,
      addToast,
    ],
  );

  const removeFavorite = useCallback(
    async (recipeId: string) => {
      try {
        await favoriteService.removeFavorite(recipeId);

        // Update global favorite IDs
        setFavoriteIds(favoriteIds.filter(id => id !== recipeId));

        // Update recipes in main recipes list
        setRecipes(
          recipes.map(recipe =>
            recipe._id === recipeId
              ? { ...recipe, is_favorite: false }
              : recipe,
          ),
        );

        // Update selected recipe if it's the same
        if (selectedRecipe?._id === recipeId) {
          setSelectedRecipe({ ...selectedRecipe, is_favorite: false });
        }

        addToast({
          message: 'Removed from favorites',
          type: 'success',
          duration: 3000,
        });
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to remove favorite',
          type: 'error',
          duration: 5000,
        });
        throw error;
      }
    },
    [
      favoriteIds,
      recipes,
      selectedRecipe,
      setFavoriteIds,
      setRecipes,
      setSelectedRecipe,
      addToast,
    ],
  );

  const isFavorite = useCallback(
    (recipeId: string) => {
      return favoriteIds.includes(recipeId);
    },
    [favoriteIds],
  );

  return {
    favoriteIds,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
};
