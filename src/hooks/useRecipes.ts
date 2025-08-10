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
import { RecipeFilters } from '../types/recipe';

export const useRecipes = () => {
  const [recipes, setRecipes] = useAtom(recipesAtom);
  const [selectedRecipe, setSelectedRecipe] = useAtom(selectedRecipeAtom);
  const [filters, setFilters] = useAtom(recipeFiltersAtom);
  const [favoriteIds] = useAtom(favoriteRecipeIdsAtom);
  const [, addToast] = useAtom(addToastAtom);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchRecipes = useCallback(
    async (appliedFilters?: RecipeFilters, reset = false) => {
      if (loading || (!hasMore && !reset)) return;

      try {
        setLoading(true);
        const currentPage = reset ? 0 : page;
        const filtersToUse = appliedFilters || filters;

        const response = await recipeService.getRecipes({
          ...filtersToUse,
          page: currentPage,
          pageSize: 18,
        });

        // Sync favorite status with global state
        const recipesWithFavoriteStatus = response.data.map(recipe => ({
          ...recipe,
          is_favorite: favoriteIds.includes(recipe._id),
        }));

        if (reset) {
          setRecipes(recipesWithFavoriteStatus);
          setPage(1);
        } else {
          // Prevent duplicates
          const existingIds = new Set(recipes.map(r => r._id));
          const newRecipes = recipesWithFavoriteStatus.filter(
            recipe => !existingIds.has(recipe._id),
          );
          setRecipes(prev => [...prev, ...newRecipes]);
          setPage(currentPage + 1);
        }

        setHasMore(response.hasMore);
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to fetch recipes',
          type: 'error',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    },
    [
      recipes,
      filters,
      page,
      hasMore,
      loading,
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
    hasMore,
    fetchRecipes,
    fetchRecipe,
    applyFilters,
  };
};
