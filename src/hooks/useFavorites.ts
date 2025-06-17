import { useCallback } from 'react';
import { useAtom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  favoriteRecipeIdsAtom,
  recipesAtom,
  selectedRecipeAtom,
  addToastAtom,
} from '../store';
import { favoriteService } from '../services/favorite';

const RECENT_RECIPES_KEY = 'recentRecipes';

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useAtom(favoriteRecipeIdsAtom);
  const [recipes, setRecipes] = useAtom(recipesAtom);
  const [selectedRecipe, setSelectedRecipe] = useAtom(selectedRecipeAtom);
  const [, addToast] = useAtom(addToastAtom);

  // Helper function to update recent recipes in AsyncStorage
  const updateRecentRecipesStorage = useCallback(
    async (recipeId: string, isFavorite: boolean) => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_RECIPES_KEY);
        if (stored) {
          const recentRecipes = JSON.parse(stored);
          const updatedRecipes = recentRecipes.map((recipe: any) =>
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

  const toggleFavorite = useCallback(
    async (recipeId: string) => {
      try {
        const { isFavorite } = await favoriteService.toggleFavorite(recipeId);

        // Update global favorite IDs
        if (isFavorite) {
          setFavoriteIds(prev => [...prev, recipeId]);
        } else {
          setFavoriteIds(prev => prev.filter(id => id !== recipeId));
        }

        // Update recipes in main recipes list
        setRecipes(prev =>
          prev.map(recipe =>
            recipe._id === recipeId
              ? { ...recipe, is_favorite: isFavorite }
              : recipe,
          ),
        );

        // Update selected recipe if it's the same
        if (selectedRecipe?._id === recipeId) {
          setSelectedRecipe({ ...selectedRecipe, is_favorite: isFavorite });
        }

        // Update recent recipes in AsyncStorage
        await updateRecentRecipesStorage(recipeId, isFavorite);

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
      updateRecentRecipesStorage,
    ],
  );

  const addFavorite = useCallback(
    async (recipeId: string) => {
      try {
        await favoriteService.addFavorite(recipeId);
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
    ],
  );

  const removeFavorite = useCallback(
    async (recipeId: string) => {
      try {
        await favoriteService.removeFavorite(recipeId);
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
      addToast,
      updateRecentRecipesStorage,
    ],
  );

  const fetchFavorites = useCallback(async () => {
    try {
      const favoriteRecipes = await favoriteService.getFavorites();
      const favoriteRecipeIds = favoriteRecipes.data.map(recipe => recipe._id);
      setFavoriteIds(favoriteRecipeIds);
      return favoriteRecipes.data;
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      addToast({
        message: error.response?.data?.message || 'Failed to fetch favorites',
        type: 'error',
        duration: 5000,
      });
      return [];
    }
  }, [setFavoriteIds, addToast]);

  return {
    favoriteIds,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    fetchFavorites,
  };
};
