import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  favoriteRecipeIdsAtom,
  favoriteRecipesAtom,
  addToastAtom,
  recipesAtom,
  selectedRecipeAtom,
  suggestedPlanAtom,
  activePlanAtom,
  selectedPlanAtom,
  recipeFiltersAtom,
} from '../store';
import { favoriteService } from '../services/favorite';
import { Recipe, RecipeFilters } from '../types/recipe';
import { PlanSchedule } from '@/types/plan';

const RECENT_RECIPES_KEY = 'recentRecipes';

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useAtom(favoriteRecipeIdsAtom);
  const [favoriteRecipes, setFavoriteRecipes] = useAtom(favoriteRecipesAtom);
  const [recipes, setRecipes] = useAtom(recipesAtom);
  const [selectedRecipe, setSelectedRecipe] = useAtom(selectedRecipeAtom);
  const [filters, setFilters] = useAtom(recipeFiltersAtom);
  const [suggestedPlan, setSuggestedPlan] = useAtom(suggestedPlanAtom);
  const [activePlan, setActivePlan] = useAtom(activePlanAtom);
  const [selectedPlan, setSelectedPlan] = useAtom(selectedPlanAtom);
  const [, addToast] = useAtom(addToastAtom);

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to update recent recipes in AsyncStorage
  const updateRecentRecipesStorage = useCallback(
    async (recipeId: string, isFavorite: boolean) => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_RECIPES_KEY);
        if (stored) {
          const recentRecipes: Recipe[] = JSON.parse(stored);
          const updatedRecipes = recentRecipes.map(recipe =>
            recipe._id === recipeId
              ? { ...recipe, is_favorite: isFavorite }
              : recipe,
          );
          await AsyncStorage.setItem(
            RECENT_RECIPES_KEY,
            JSON.stringify(updatedRecipes),
          );
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error updating recent recipes storage:', error);
        }
      }
    },
    [],
  );

  // Helper function to update active plan recipes
  const updateActivePlanRecipes = useCallback(
    (recipeId: string, isFavorite: boolean) => {
      if (!activePlan) return;

      const updatedSchedule = { ...activePlan.schedule };

      Object.keys(updatedSchedule).forEach(dayKey => {
        const daySchedule = updatedSchedule[dayKey as keyof PlanSchedule];
        if (Array.isArray(daySchedule)) {
          daySchedule.forEach(scheduledRecipe => {
            if (
              typeof scheduledRecipe.recipe === 'object' &&
              scheduledRecipe.recipe?._id === recipeId
            ) {
              scheduledRecipe.recipe.is_favorite = isFavorite;
            }
          });
        }
      });

      setActivePlan({
        ...activePlan,
        schedule: updatedSchedule,
      });
    },
    [activePlan, setActivePlan],
  );

  // Helper function to update selected plan recipes
  const updateSelectedPlanRecipes = useCallback(
    (recipeId: string, isFavorite: boolean) => {
      if (!selectedPlan) return;

      const updatedSchedule = { ...selectedPlan.schedule };

      Object.keys(updatedSchedule).forEach(dayKey => {
        const daySchedule = updatedSchedule[dayKey as keyof PlanSchedule];
        if (Array.isArray(daySchedule)) {
          daySchedule.forEach(scheduledRecipe => {
            if (
              typeof scheduledRecipe.recipe === 'object' &&
              scheduledRecipe.recipe?._id === recipeId
            ) {
              scheduledRecipe.recipe.is_favorite = isFavorite;
            }
          });
        }
      });

      setSelectedPlan({
        ...selectedPlan,
        schedule: updatedSchedule,
      });
    },
    [selectedPlan, setSelectedPlan],
  );

  // Helper function to update suggested plan recipes
  const updateSuggestedPlanRecipes = useCallback(
    (recipeId: string, isFavorite: boolean) => {
      if (!suggestedPlan) return;

      const updatedSchedule = { ...suggestedPlan.schedule };

      Object.keys(updatedSchedule).forEach(dayKey => {
        const daySchedule = updatedSchedule[dayKey as keyof PlanSchedule];
        if (Array.isArray(daySchedule)) {
          daySchedule.forEach(scheduledRecipe => {
            if (
              typeof scheduledRecipe.recipe === 'object' &&
              scheduledRecipe.recipe?._id === recipeId
            ) {
              scheduledRecipe.recipe.is_favorite = isFavorite;
            }
          });
        }
      });

      setSuggestedPlan({
        ...suggestedPlan,
        schedule: updatedSchedule,
      });
    },
    [suggestedPlan, setSuggestedPlan],
  );

  const fetchFavorites = useCallback(
    async (appliedFilters?: RecipeFilters | null, reset = false) => {
      if (loading && !reset && !refreshing) return;

      try {
        setLoading(true);
        const currentPage = reset ? 0 : page + 1;
        const filtersToUse = appliedFilters || filters;

        const response = await favoriteService.getFavorites({
          ...filtersToUse,
          page: currentPage,
          pageSize: 18,
        });

        // Since these are favorites from the API, they should all be favorites
        const recipesWithFavoriteStatus = response.data.map(
          (recipe: Recipe) => ({
            ...recipe,
            is_favorite: true, // All favorites should be marked as favorite
          }),
        );

        if (reset) {
          setFavoriteRecipes(recipesWithFavoriteStatus);
          setPage(0);
        } else {
          // Prevent duplicates when adding new data
          const existingIds = new Set(favoriteRecipes.map(r => r._id));
          const newRecipes = recipesWithFavoriteStatus.filter(
            (recipe: Recipe) => !existingIds.has(recipe._id),
          );
          setFavoriteRecipes(prev => [...prev, ...newRecipes]);
          setPage(currentPage);
        }

        setHasMore(response.hasMore);
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to fetch favorites',
          type: 'error',
          duration: 5000,
        });
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [
      favoriteRecipes,
      filters,
      page,
      hasMore,
      loading,
      refreshing,
      setFavoriteRecipes,
      addToast,
    ],
  );

  const toggleFavorite = useCallback(
    async (recipe: Recipe) => {
      try {
        const response = await favoriteService.toggleFavorite(recipe._id);
        const isFavorite = response.isFavorite;

        // Update favorite IDs
        if (isFavorite) {
          setFavoriteIds(prev => [recipe._id, ...prev]);
        } else {
          setFavoriteIds(prev => prev.filter(id => id !== recipe._id));
        }

        // Update recipes list - FIXED: Use correct variable names
        setRecipes(prev =>
          prev.map(r =>
            r._id === recipe._id ? { ...r, is_favorite: isFavorite } : r,
          ),
        );

        // Update selected recipe
        if (selectedRecipe?._id === recipe._id) {
          setSelectedRecipe({ ...selectedRecipe, is_favorite: isFavorite });
        }

        // Update favorite recipes list
        if (isFavorite) {
          setFavoriteRecipes(prev => [
            { ...recipe, is_favorite: true },
            ...prev,
          ]);
        } else {
          // Recipe was removed from favorites
          setFavoriteRecipes(prev => prev.filter(r => r._id !== recipe._id));
        }

        // Update active plan recipes
        updateActivePlanRecipes(recipe._id, isFavorite);

        // Update suggested plan recipes
        updateSuggestedPlanRecipes(recipe._id, isFavorite);

        // Update selected plan recipes
        updateSelectedPlanRecipes(recipe._id, isFavorite);

        // Update recent recipes in AsyncStorage
        await updateRecentRecipesStorage(recipe._id, isFavorite);

        addToast({
          message: isFavorite ? 'Added to favorites' : 'Removed from favorites',
          type: 'success',
          duration: 3000,
        });
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to update favorite status',
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
      favoriteRecipes,
      setFavoriteIds,
      setRecipes,
      setSelectedRecipe,
      setFavoriteRecipes,
      addToast,
      updateRecentRecipesStorage,
      updateActivePlanRecipes,
      updateSuggestedPlanRecipes,
      updateSelectedPlanRecipes,
    ],
  );

  const loadMoreFavorites = useCallback(() => {
    if (!loading && hasMore) {
      fetchFavorites();
    }
  }, [loading, hasMore, fetchFavorites]);

  const refreshFavorites = useCallback(
    async (appliedFilters?: RecipeFilters) => {
      setRefreshing(true);
      await fetchFavorites(appliedFilters || filters, true);
      setRefreshing(false);
    },
    [fetchFavorites, filters],
  );

  const applyFilters = useCallback(
    (newFilters: RecipeFilters) => {
      setFilters(newFilters);
      fetchFavorites(newFilters, true);
    },
    [setFilters, fetchFavorites],
  );

  return {
    favoriteIds,
    favoriteRecipes,
    filters,
    loading,
    refreshing,
    hasMore,
    page,
    toggleFavorite,
    fetchFavorites,
    loadMoreFavorites,
    refreshFavorites,
    applyFilters,
  };
};
