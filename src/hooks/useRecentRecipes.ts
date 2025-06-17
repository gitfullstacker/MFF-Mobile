import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  favoriteRecipeIdsAtom,
  addToastAtom,
  recentRecipesAtom,
  recentRecipesLoadingAtom,
} from '../store';
import { Recipe } from '../types/recipe';

const RECENT_RECIPES_KEY = 'recentRecipes';
const MAX_RECENT_RECIPES = 10;

export const useRecentRecipes = () => {
  const [favoriteIds] = useAtom(favoriteRecipeIdsAtom);
  const [, addToast] = useAtom(addToastAtom);
  const [recentRecipes, setRecentRecipes] = useAtom(recentRecipesAtom);
  const [loading, setLoading] = useAtom(recentRecipesLoadingAtom);

  const fetchRecentRecipes = useCallback(
    async (limit = 10, forceRefresh = false) => {
      try {
        setLoading(true);

        const stored = await AsyncStorage.getItem(RECENT_RECIPES_KEY);
        const storedRecipes: Recipe[] = stored ? JSON.parse(stored) : [];

        // Sync favorite status with global state
        const recipesWithUpdatedFavoriteStatus = storedRecipes.map(recipe => ({
          ...recipe,
          is_favorite: favoriteIds.includes(recipe._id),
        }));

        const limitedRecipes = recipesWithUpdatedFavoriteStatus.slice(0, limit);
        setRecentRecipes(limitedRecipes);

        return limitedRecipes;
      } catch (error) {
        console.error('Error fetching recent recipes:', error);
        addToast({
          message: 'Failed to load recent recipes',
          type: 'error',
          duration: 3000,
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [addToast, favoriteIds, setRecentRecipes, setLoading],
  );

  // Update recent recipes when favoriteIds change
  useEffect(() => {
    if (recentRecipes.length > 0) {
      const updatedRecipes = recentRecipes.map(recipe => ({
        ...recipe,
        is_favorite: favoriteIds.includes(recipe._id),
      }));

      // Only update state if there's actually a change
      const hasChanges = updatedRecipes.some(
        (recipe, index) =>
          recipe.is_favorite !== recentRecipes[index]?.is_favorite,
      );

      if (hasChanges) {
        setRecentRecipes(updatedRecipes);
        // Also update AsyncStorage to keep it in sync
        AsyncStorage.setItem(
          RECENT_RECIPES_KEY,
          JSON.stringify(updatedRecipes),
        ).catch(error =>
          console.error('Error updating recent recipes storage:', error),
        );
      }
    }
  }, [favoriteIds, recentRecipes, setRecentRecipes]);

  const addToRecentRecipes = useCallback(
    async (recipe: Recipe) => {
      try {
        // Sync favorite status with global state
        const syncedRecipe = {
          ...recipe,
          is_favorite: favoriteIds.includes(recipe._id),
        };

        const stored = await AsyncStorage.getItem(RECENT_RECIPES_KEY);
        const existingRecipes: Recipe[] = stored ? JSON.parse(stored) : [];

        // Remove if already exists to avoid duplicates
        const filtered = existingRecipes.filter(
          r => r._id !== syncedRecipe._id,
        );

        // Add to beginning and limit to MAX_RECENT_RECIPES
        const updatedRecipes = [syncedRecipe, ...filtered].slice(
          0,
          MAX_RECENT_RECIPES,
        );

        // Save to storage
        await AsyncStorage.setItem(
          RECENT_RECIPES_KEY,
          JSON.stringify(updatedRecipes),
        );

        // Update global state immediately
        setRecentRecipes(updatedRecipes);
      } catch (error) {
        console.error('Error adding to recent recipes:', error);
        addToast({
          message: 'Failed to update recent recipes',
          type: 'error',
          duration: 3000,
        });
      }
    },
    [addToast, favoriteIds, setRecentRecipes],
  );

  const removeFromRecentRecipes = useCallback(
    async (recipeId: string) => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_RECIPES_KEY);
        const existingRecipes: Recipe[] = stored ? JSON.parse(stored) : [];
        const filtered = existingRecipes.filter(r => r._id !== recipeId);

        await AsyncStorage.setItem(
          RECENT_RECIPES_KEY,
          JSON.stringify(filtered),
        );
        setRecentRecipes(filtered);
      } catch (error) {
        console.error('Error removing from recent recipes:', error);
        addToast({
          message: 'Failed to remove from recent recipes',
          type: 'error',
          duration: 3000,
        });
      }
    },
    [addToast, setRecentRecipes],
  );

  const clearRecentRecipes = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(RECENT_RECIPES_KEY);
      setRecentRecipes([]);
      addToast({
        message: 'Recent recipes cleared',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error clearing recent recipes:', error);
      addToast({
        message: 'Failed to clear recent recipes',
        type: 'error',
        duration: 3000,
      });
    }
  }, [addToast, setRecentRecipes]);

  // Load recent recipes on mount (only once)
  useEffect(() => {
    if (recentRecipes.length === 0) {
      fetchRecentRecipes();
    }
  }, []);

  return {
    recentRecipes,
    loading,
    fetchRecentRecipes,
    addToRecentRecipes,
    removeFromRecentRecipes,
    clearRecentRecipes,
  };
};
