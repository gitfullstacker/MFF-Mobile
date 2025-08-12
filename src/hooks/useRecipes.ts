import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import {
  recipesAtom,
  selectedRecipeAtom,
  favoriteRecipeIdsAtom,
  addToastAtom,
  recipeFiltersAtom,
} from '../store';
import { recipeService } from '../services/recipe';
import { Recipe, RecipeFilters } from '../types/recipe';

export const useRecipes = () => {
  const [recipes, setRecipes] = useAtom(recipesAtom);
  const [selectedRecipe, setSelectedRecipe] = useAtom(selectedRecipeAtom);
  const [filters, setFilters] = useAtom(recipeFiltersAtom);
  const [favoriteIds] = useAtom(favoriteRecipeIdsAtom);
  const [, addToast] = useAtom(addToastAtom);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecipes = useCallback(
    async (appliedFilters?: RecipeFilters, reset = false) => {
      if (loading && !reset && !refreshing) return;

      try {
        setLoading(true);
        // FIXED: For pagination, use next page when not resetting
        const currentPage = reset ? 0 : page + 1;
        const filtersToUse = appliedFilters || filters;

        const response = await recipeService.getRecipes({
          ...filtersToUse,
          page: currentPage,
          pageSize: 18,
        });

        // Sync favorite status with global state
        const recipesWithFavoriteStatus = response.data.map(
          (recipe: Recipe) => ({
            ...recipe,
            is_favorite: favoriteIds.includes(recipe._id),
          }),
        );

        if (reset) {
          setRecipes(recipesWithFavoriteStatus);
          setPage(0);
        } else {
          // Prevent duplicates
          const existingIds = new Set(recipes.map(r => r._id));
          const newRecipes = recipesWithFavoriteStatus.filter(
            (recipe: Recipe) => !existingIds.has(recipe._id),
          );
          setRecipes(prev => [...prev, ...newRecipes]);
          setPage(currentPage);
        }

        setHasMore(response.hasMore);
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to fetch recipes',
          type: 'error',
          duration: 5000,
        });
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [
      recipes,
      filters,
      page,
      loading,
      refreshing,
      setRecipes,
      addToast,
      favoriteIds,
    ],
  );

  const fetchRecipe = useCallback(
    async (slug: string) => {
      try {
        setLoading(true);
        const recipe = await recipeService.getRecipe(slug);

        // Sync favorite status with global state
        const recipeWithFavoriteStatus = {
          ...recipe,
          is_favorite: favoriteIds.includes(recipe._id),
        };

        setSelectedRecipe(recipeWithFavoriteStatus);
        return recipeWithFavoriteStatus;
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to fetch recipe',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setSelectedRecipe, addToast, favoriteIds],
  );

  const loadMoreRecipes = useCallback(() => {
    if (!loading && hasMore) {
      fetchRecipes();
    }
  }, [loading, hasMore, fetchRecipes]);

  const refreshRecipes = useCallback(
    async (appliedFilters?: RecipeFilters) => {
      setRefreshing(true);
      await fetchRecipes(appliedFilters || filters, true);
      setRefreshing(false);
    },
    [fetchRecipes, filters],
  );

  const applyFilters = useCallback(
    (newFilters: RecipeFilters) => {
      setFilters(newFilters);
      fetchRecipes(newFilters, true);
    },
    [setFilters, fetchRecipes],
  );

  return {
    recipes,
    selectedRecipe,
    filters,
    loading,
    refreshing,
    hasMore,
    fetchRecipes,
    fetchRecipe,
    loadMoreRecipes,
    refreshRecipes,
    applyFilters,
  };
};
