import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Input } from '../../components/forms/Input';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useRecipes } from '../../hooks/useRecipes';
import { colors, spacing } from '../../theme';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Recipe } from '../../types/recipe';

type FavoritesNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Favorites'>,
  StackNavigationProp<RootStackParamList>
>;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesNavigationProp>();
  const { recipes, loading, hasMore, toggleFavorite } = useRecipes();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredFavorites, setFilteredFavorites] = useState<Recipe[]>([]);

  // Use the favoriteService directly
  const { favoriteService } = require('../../services/favorite');

  // Fetch favorite recipes
  const fetchFavorites = useCallback(async (page = 0) => {
    try {
      const response = await favoriteService.getFavorites(page);
      return response;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return { data: [], total: 0, hasMore: false };
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredFavorites(
        favoriteRecipes.filter(recipe =>
          recipe.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    } else {
      setFilteredFavorites(favoriteRecipes);
    }
  }, [searchQuery, favoriteRecipes]);

  const loadFavorites = async () => {
    const response = await fetchFavorites();
    setFavoriteRecipes(response.data);
    setFilteredFavorites(response.data);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  const handleRecipePress = useCallback(
    (recipeId: string) => {
      navigation.navigate('RecipeStack', {
        screen: 'RecipeDetail',
        params: { recipeId },
      } as any);
    },
    [navigation],
  );

  const handleToggleFavorite = useCallback(
    async (recipeId: string) => {
      await toggleFavorite(recipeId);
      // Remove from the list immediately for better UX
      setFavoriteRecipes(prev =>
        prev.filter(recipe => recipe._id !== recipeId),
      );
      setFilteredFavorites(prev =>
        prev.filter(recipe => recipe._id !== recipeId),
      );
    },
    [toggleFavorite],
  );

  const renderRecipe = ({ item, index }: { item: Recipe; index: number }) => {
    const isLeft = index % 2 === 0;
    return (
      <View style={[styles.recipeCardContainer, isLeft && styles.leftCard]}>
        <RecipeCard
          recipe={item}
          onPress={() => handleRecipePress(item._id)}
          onFavorite={() => handleToggleFavorite(item._id)}
          variant="compact"
        />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading && !refreshing) return null;

    if (searchQuery) {
      return (
        <EmptyState
          title="No recipes found"
          description={`We couldn't find any favorites matching "${searchQuery}"`}
          action={{
            label: 'Clear Search',
            onPress: () => setSearchQuery(''),
          }}
        />
      );
    }

    return (
      <EmptyState
        title="No favorites yet"
        description="Save your favorite recipes for quick access"
        action={{
          label: 'Browse Recipes',
          onPress: () => navigation.navigate('Recipes'),
        }}
      />
    );
  };

  return (
    <PageContainer safeArea={false}>
      <Header title="Favorites" showBack={false} />

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search favorites..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          rightIcon={searchQuery ? 'x' : undefined}
          onRightIconPress={() => setSearchQuery('')}
          containerStyle={styles.searchInput}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredFavorites}
          renderItem={renderRecipe}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchInput: {
    marginBottom: 0,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  recipeCardContainer: {
    flex: 0.48,
    marginBottom: spacing.md,
  },
  leftCard: {
    marginRight: spacing.sm,
  },
});

export default FavoritesScreen;
