import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAtom } from 'jotai';
import { addToastAtom, favoriteRecipeIdsAtom } from '../store';
import { recipeService } from '../services/recipe';
import { Recipe } from '../types/recipe';

const RECENT_RECIPES_KEY = '@recent_recipes';
const MAX_RECENT_RECIPES = 10;

export const useRecentRecipes = () => {
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, addToast] = useAtom(addToastAtom);
  const [favoriteIds] = useAtom(favoriteRecipeIdsAtom); // Use atom directly

  // Load recent recipes from storage and fetch if needed
  const fetchRecentRecipes = useCallback(
    async (limit: number = 5, forceRefresh: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        // Always get from local storage first
        const stored = await AsyncStorage.getItem(RECENT_RECIPES_KEY);
        const storedRecipes: Recipe[] = stored ? JSON.parse(stored) : [];

        if (storedRecipes.length > 0 && !forceRefresh) {
          // Use stored recipes and limit them, sync with current favorite status
          const syncedRecipes = storedRecipes.map(recipe => ({
            ...recipe,
            is_favorite: favoriteIds.includes(recipe._id),
          }));
          setRecentRecipes(syncedRecipes.slice(0, limit));
        } else if (storedRecipes.length > 0 && forceRefresh) {
          // Force refresh: update state with stored recipes first, sync favorite status
          const syncedRecipes = storedRecipes.map(recipe => ({
            ...recipe,
            is_favorite: favoriteIds.includes(recipe._id),
          }));
          setRecentRecipes(syncedRecipes.slice(0, limit));
        } else {
          // Fallback to API if no stored recipes - get newest recipes
          const response = await recipeService.getRecipes({
            sort: 'newest',
            page: 0,
            pageSize: limit,
          });
          const syncedRecipes = response.data.map(recipe => ({
            ...recipe,
            is_favorite: favoriteIds.includes(recipe._id),
          }));
          setRecentRecipes(syncedRecipes || []);
        }
      } catch (err: any) {
        console.error('Error fetching recent recipes:', err);
        setError('Failed to load recent recipes');
        addToast({
          message: 'Failed to load recent recipes',
          type: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    },
    [addToast, favoriteIds],
  );

  // Sync recent recipes with global favorite changes
  useEffect(() => {
    if (recentRecipes.length > 0) {
      const syncedRecipes = recentRecipes.map(recipe => ({
        ...recipe,
        is_favorite: favoriteIds.includes(recipe._id),
      }));
      setRecentRecipes(syncedRecipes);
    }
  }, [favoriteIds]); // This will sync whenever global favorites change

  // Add a recipe to recent recipes
  const addToRecentRecipes = useCallback(
    async (recipe: Recipe) => {
      try {
        // Sync favorite status with global state
        const syncedRecipe = {
          ...recipe,
          is_favorite: favoriteIds.includes(recipe._id),
        };

        // Get existing recent recipes from storage
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

        // Update local state
        setRecentRecipes(prev => {
          const filteredPrev = prev.filter(r => r._id !== syncedRecipe._id);
          return [syncedRecipe, ...filteredPrev].slice(0, MAX_RECENT_RECIPES);
        });
      } catch (error) {
        console.error('Error adding to recent recipes:', error);
        addToast({
          message: 'Failed to update recent recipes',
          type: 'error',
          duration: 3000,
        });
      }
    },
    [addToast, favoriteIds],
  );

  // Remove a specific recipe from recent recipes
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
        setRecentRecipes(prev => prev.filter(r => r._id !== recipeId));
      } catch (error) {
        console.error('Error removing from recent recipes:', error);
        addToast({
          message: 'Failed to remove from recent recipes',
          type: 'error',
          duration: 3000,
        });
      }
    },
    [addToast],
  );

  // Clear all recent recipes
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
  }, [addToast]);

  // Load recent recipes on mount
  useEffect(() => {
    fetchRecentRecipes();
  }, []);

  // Refresh recent recipes (to be called when screen focuses)
  const refreshRecentRecipes = useCallback(
    async (limit?: number) => {
      await fetchRecentRecipes(limit || 5, true); // Force refresh from storage
    },
    [fetchRecentRecipes],
  );

  return {
    recentRecipes,
    loading,
    error,
    fetchRecentRecipes,
    refreshRecentRecipes,
    addToRecentRecipes,
    removeFromRecentRecipes,
    clearRecentRecipes,
  };
};
