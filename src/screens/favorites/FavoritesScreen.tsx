import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Input } from '../../components/forms/Input';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { colors, spacing } from '../../theme';
import { Recipe } from '../../types/recipe';
import { useFavorites } from '@/hooks/useFavorites';
import { useAtom } from 'jotai';
import { favoriteRecipesAtom } from '@/store';
import { SCREEN_NAMES } from '@/constants';
import { useNavigationHelpers } from '@/hooks/useNavigation';

const FavoritesScreen: React.FC = () => {
  const { navigateToMainTab, navigateToRecipeDetail } = useNavigationHelpers();
  const [favoriteRecipes] = useAtom(favoriteRecipesAtom);
  const {
    loading,
    refreshing,
    hasMore,
    toggleFavorite,
    fetchFavorites,
    loadMoreFavorites,
    refreshFavorites,
  } = useFavorites();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFavorites, setFilteredFavorites] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initial load
  useEffect(() => {
    if (favoriteRecipes.length === 0) {
      fetchFavorites(0, true);
    }
  }, [favoriteRecipes.length, fetchFavorites]);

  // Filter favorites based on search query
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

  const handleRefresh = useCallback(async () => {
    await refreshFavorites();
  }, [refreshFavorites]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !isSearching) {
      loadMoreFavorites();
    }
  }, [loading, hasMore, isSearching, loadMoreFavorites]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const renderRecipe = ({ item }: { item: Recipe }) => {
    return (
      <View style={styles.recipeCardContainer}>
        <RecipeCard
          recipe={item}
          onPress={() => navigateToRecipeDetail(item.slug, item)}
          onFavoriteToggle={recipeId => {
            toggleFavorite(recipeId);
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
          onPress: () => navigateToMainTab(SCREEN_NAMES.MAIN_TAB.RECIPES),
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
