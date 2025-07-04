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
} from '../store';
import { favoriteService } from '../services/favorite';
import { Recipe } from '../types/recipe';
import { FavoriteFilters } from '@/types/favorite';
import { PlanSchedule } from '@/types/plan';

const RECENT_RECIPES_KEY = 'recentRecipes';

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useAtom(favoriteRecipeIdsAtom);
  const [favoriteRecipes, setFavoriteRecipes] = useAtom(favoriteRecipesAtom);
  const [recipes, setRecipes] = useAtom(recipesAtom);
  const [selectedRecipe, setSelectedRecipe] = useAtom(selectedRecipeAtom);
  const [suggestedPlan, setSuggestedPlan] = useAtom(suggestedPlanAtom);
  const [, addToast] = useAtom(addToastAtom);

  // Local state for pagination and filters
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<FavoriteFilters>({});

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
        console.error('Error updating recent recipes storage:', error);
      }
    },
    [],
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
    async (appliedFilters?: FavoriteFilters, reset = false) => {
      try {
        if (loading && !reset && !refreshing) return;

        setLoading(true);
        const currentPage = reset ? 0 : page + 1;
        const filtersToUse = appliedFilters || filters;

        const response = await favoriteService.getFavorites({
          page: currentPage,
          pageSize: 10, // Match backend default
          search: filtersToUse.search,
        });

        // Sync favorite status with global state
        const recipesWithFavoriteStatus = response.data.map(
          (recipe: Recipe) => ({
            ...recipe,
            is_favorite: favoriteIds.includes(recipe._id),
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
        setLoading(false);
        return response;
      } catch (error: any) {
        console.error('Error fetching favorites:', error);
        setLoading(false);
        setHasMore(false);
        addToast({
          message: error.response?.data?.message || 'Failed to fetch favorites',
          type: 'error',
          duration: 5000,
        });
        return { data: [], total: 0, hasMore: false };
      }
    },
    [
      loading,
      refreshing,
      favoriteRecipes,
      favoriteIds,
      setFavoriteRecipes,
      addToast,
      page,
      filters,
    ],
  );

  const applyFilters = useCallback(
    (newFilters: FavoriteFilters) => {
      setFilters(newFilters);
      fetchFavorites(newFilters, true);
    },
    [setFilters, fetchFavorites],
  );

  const toggleFavorite = useCallback(
    async (recipeId: string) => {
      try {
        const response = await favoriteService.toggleFavorite(recipeId);
        const isFavorite = response.isFavorite;

        // Update favorite IDs
        if (isFavorite) {
          setFavoriteIds(prev => [...prev, recipeId]);
        } else {
          setFavoriteIds(prev => prev.filter(id => id !== recipeId));
        }

        // Update recipes list
        setRecipes(prev =>
          prev.map(recipe =>
            recipe._id === recipeId
              ? { ...recipe, is_favorite: isFavorite }
              : recipe,
          ),
        );

        // Update selected recipe
        if (selectedRecipe?._id === recipeId) {
          setSelectedRecipe({ ...selectedRecipe, is_favorite: isFavorite });
        }

        // Update favorite recipes list
        if (isFavorite) {
          // Recipe was added to favorites - we might need to fetch it if not in the list
          const existingFavorite = favoriteRecipes.find(
            r => r._id === recipeId,
          );
          if (!existingFavorite) {
            // If the recipe isn't in our favorites list, we'll need to refresh to get it
            // For now, just update the existing one if it exists
            setFavoriteRecipes(prev =>
              prev.map(recipe =>
                recipe._id === recipeId
                  ? { ...recipe, is_favorite: true }
                  : recipe,
              ),
            );
          }
        } else {
          // Recipe was removed from favorites
          setFavoriteRecipes(prev =>
            prev.filter(recipe => recipe._id !== recipeId),
          );
        }

        // Update suggested plan recipes
        updateSuggestedPlanRecipes(recipeId, isFavorite);

        // Update recent recipes in AsyncStorage
        await updateRecentRecipesStorage(recipeId, isFavorite);

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
      updateSuggestedPlanRecipes,
    ],
  );

  const addFavorite = useCallback(
    async (recipeId: string) => {
      try {
        await favoriteService.addFavorite(recipeId);

        // Update favorite IDs
        setFavoriteIds(prev => [...prev, recipeId]);

        // Update recipes list
        setRecipes(prev =>
          prev.map(recipe =>
            recipe._id === recipeId ? { ...recipe, is_favorite: true } : recipe,
          ),
        );

        // Update selected recipe
        if (selectedRecipe?._id === recipeId) {
          setSelectedRecipe({ ...selectedRecipe, is_favorite: true });
        }

        // Update suggested plan recipes
        updateSuggestedPlanRecipes(recipeId, true);

        // Update recent recipes in AsyncStorage
        await updateRecentRecipesStorage(recipeId, true);

        addToast({
          message: 'Added to favorites',
          type: 'success',
          duration: 3000,
        });
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to add to favorites',
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
      updateRecentRecipesStorage,
      updateSuggestedPlanRecipes,
    ],
  );

  const removeFavorite = useCallback(
    async (recipeId: string) => {
      try {
        await favoriteService.removeFavorite(recipeId);

        // Update favorite IDs
        setFavoriteIds(prev => prev.filter(id => id !== recipeId));

        // Update recipes list
        setRecipes(prev =>
          prev.map(recipe =>
            recipe._id === recipeId
              ? { ...recipe, is_favorite: false }
              : recipe,
          ),
        );

        // Update selected recipe
        if (selectedRecipe?._id === recipeId) {
          setSelectedRecipe({ ...selectedRecipe, is_favorite: false });
        }

        // Remove from favorite recipes list
        setFavoriteRecipes(prev =>
          prev.filter(recipe => recipe._id !== recipeId),
        );

        // Update suggested plan recipes
        updateSuggestedPlanRecipes(recipeId, false);

        // Update recent recipes in AsyncStorage
        await updateRecentRecipesStorage(recipeId, false);

        addToast({
          message: 'Removed from favorites',
          type: 'success',
          duration: 3000,
        });
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to remove from favorites',
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
      setFavoriteRecipes,
      addToast,
      updateRecentRecipesStorage,
      updateSuggestedPlanRecipes,
    ],
  );

  const loadMoreFavorites = useCallback(() => {
    if (!loading && hasMore) {
      fetchFavorites();
    }
  }, [loading, hasMore, fetchFavorites]);

  const refreshFavorites = useCallback(
    async (appliedFilters?: FavoriteFilters) => {
      setRefreshing(true);
      await fetchFavorites(appliedFilters || filters, true);
      setRefreshing(false);
    },
    [fetchFavorites, filters],
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
    addFavorite,
    removeFavorite,
    fetchFavorites,
    loadMoreFavorites,
    refreshFavorites,
    applyFilters,
  };
};
