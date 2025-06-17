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
import { useFavorites } from '@/hooks/useFavorites';

type FavoritesNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Favorites'>,
  StackNavigationProp<RootStackParamList>
>;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesNavigationProp>();
  const { toggleFavorite } = useFavorites();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filteredFavorites, setFilteredFavorites] = useState<Recipe[]>([]);

  // Use the favoriteService directly
  const { favoriteService } = require('../../services/favorite');

  // Fetch favorite recipes
  const fetchFavorites = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      const response = await favoriteService.getFavorites(page);
      setLoading(false);
      return response;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setLoading(false);
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
    (recipe: Recipe) => {
      navigation.navigate('RecipeStack', {
        screen: 'RecipeDetail',
        params: { recipeId: recipe.slug, recipe },
      } as any);
    },
    [navigation],
  );

  const renderRecipe = ({ item }: { item: Recipe }) => {
    return (
      <View style={styles.recipeCardContainer}>
        <RecipeCard
          recipe={item}
          onPress={() => handleRecipePress(item)}
          onFavoriteToggle={recipeId => toggleFavorite(recipeId)}
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
          numColumns={1} // Changed from 2 to 1 for horizontal cards
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
    paddingHorizontal: spacing.sm,
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
    padding: spacing.sm,
    paddingTop: spacing.sm,
    flexGrow: 1,
  },
  recipeCardContainer: {
    marginBottom: spacing.md,
  },
});

export default FavoritesScreen;
