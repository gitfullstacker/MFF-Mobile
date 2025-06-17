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
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  // Use the favoriteService directly
  const { favoriteService } = require('../../services/favorite');

  // Fetch favorite recipes with pagination
  const fetchFavorites = useCallback(
    async (pageNum = 1, reset = false) => {
      try {
        if (loading && !reset) return;

        setLoading(true);
        const response = await favoriteService.getFavorites(pageNum);

        if (reset) {
          setFavoriteRecipes(response.data);
          setPage(1);
        } else {
          // Prevent duplicates when adding new data
          const existingIds = new Set(favoriteRecipes.map(r => r._id));
          const newRecipes = response.data.filter(
            (recipe: Recipe) => !existingIds.has(recipe._id),
          );
          setFavoriteRecipes(prev => [...prev, ...newRecipes]);
        }

        setHasMore(response.hasMore);
        setLoading(false);
        return response;
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setLoading(false);
        setHasMore(false);
        return { data: [], total: 0, hasMore: false };
      }
    },
    [loading, favoriteRecipes],
  );

  useEffect(() => {
    // Initial load
    if (favoriteRecipes.length === 0) {
      loadFavorites();
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setFilteredFavorites(
        favoriteRecipes.filter(recipe =>
          recipe.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    } else {
      setIsSearching(false);
      setFilteredFavorites(favoriteRecipes);
    }
  }, [searchQuery, favoriteRecipes]);

  const loadFavorites = async () => {
    await fetchFavorites(1, true);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFavorites(1, true);
    setRefreshing(false);
  }, [fetchFavorites]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !isSearching) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFavorites(nextPage, false);
    }
  }, [loading, hasMore, isSearching, page, fetchFavorites]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

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
          onFavoriteToggle={recipeId => {
            toggleFavorite(recipeId);
            // Remove from local state when unfavorited
            setFavoriteRecipes(prev =>
              prev.filter(recipe => recipe._id !== recipeId),
            );
          }}
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || !hasMore || isSearching) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
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
            onPress: () => {
              setSearchQuery('');
              setIsSearching(false);
            },
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
          onRightIconPress={() => {
            setSearchQuery('');
            setIsSearching(false);
          }}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredFavorites}
        renderItem={renderRecipe}
        keyExtractor={item => item._id}
        numColumns={1}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
      />
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
  listContent: {
    padding: spacing.sm,
    paddingTop: spacing.sm,
    flexGrow: 1,
  },
  recipeCardContainer: {
    marginBottom: spacing.md,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});

export default FavoritesScreen;
