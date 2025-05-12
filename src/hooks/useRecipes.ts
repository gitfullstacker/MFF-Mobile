import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import {
  recipesAtom,
  selectedRecipeAtom,
  recipeFiltersAtom,
  favoriteRecipeIdsAtom,
  addToastAtom,
} from '../store';
import { recipeService } from '../services/recipe';
import { favoriteService } from '../services/favorite';
import { RecipeFilters } from '../types/recipe';

export const useRecipes = () => {
  const [recipes, setRecipes] = useAtom(recipesAtom);
  const [selectedRecipe, setSelectedRecipe] = useAtom(selectedRecipeAtom);
  const [filters, setFilters] = useAtom(recipeFiltersAtom);
  const [favoriteIds, setFavoriteIds] = useAtom(favoriteRecipeIdsAtom);
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

        const response = await recipeService.getRecipes({
          ...filters,
          ...appliedFilters,
          page: currentPage,
          pageSize: 20,
        });

        if (reset) {
          setRecipes(response.data);
        } else {
          setRecipes([...recipes, ...response.data]);
        }

        setHasMore(response.hasMore);
        setPage(currentPage + 1);
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
    [recipes, filters, page, hasMore, loading, setRecipes, addToast],
  );

  const fetchRecipe = useCallback(
    async (slug: string) => {
      try {
        setLoading(true);
        const recipe = await recipeService.getRecipe(slug);
        setSelectedRecipe(recipe);
        return recipe;
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
    [setSelectedRecipe, addToast],
  );

  const toggleFavorite = useCallback(
    async (recipeId: string) => {
      try {
        const { isFavorite } = await favoriteService.toggleFavorite(recipeId);

        if (isFavorite) {
          setFavoriteIds([...favoriteIds, recipeId]);
        } else {
          setFavoriteIds(favoriteIds.filter(id => id !== recipeId));
        }

        // Update the recipe in the list
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
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to update favorite',
          type: 'error',
          duration: 5000,
        });
      }
    },
    [
      recipes,
      selectedRecipe,
      favoriteIds,
      setRecipes,
      setSelectedRecipe,
      setFavoriteIds,
      addToast,
    ],
  );

  const searchRecipes = useCallback(
    async (query: string) => {
      try {
        setLoading(true);
        const response = await recipeService.searchRecipes(query);
        setRecipes(response.data);
        setHasMore(response.hasMore);
        setPage(1);
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Search failed',
          type: 'error',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    },
    [setRecipes, addToast],
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
    favoriteIds,
    loading,
    hasMore,
    fetchRecipes,
    fetchRecipe,
    toggleFavorite,
    searchRecipes,
    applyFilters,
  };
};
