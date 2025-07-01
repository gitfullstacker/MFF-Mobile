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
import { FavoriteFilters } from '@/types/favorite';

const FavoritesScreen: React.FC = () => {
  const { navigateToMainTab, navigateToRecipeDetail } = useNavigationHelpers();
  const [favoriteRecipes] = useAtom(favoriteRecipesAtom);
  const {
    loading,
    refreshing,
    hasMore,
    filters,
    toggleFavorite,
    fetchFavorites,
    loadMoreFavorites,
    refreshFavorites,
    applyFilters,
  } = useFavorites();

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Initial load
    if (favoriteRecipes.length === 0) {
      fetchFavorites({}, true);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    await refreshFavorites(filters);
  }, [refreshFavorites, filters]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadMoreFavorites();
    }
  }, [loading, hasMore, loadMoreFavorites]);

  const handleSearch = useCallback(() => {
    const newFilters: FavoriteFilters = {
      ...filters,
      search: searchQuery.trim() || undefined,
    };
    applyFilters(newFilters);
  }, [searchQuery, filters, applyFilters]);

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
    if (!loading || !hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading && !refreshing) return null;

    if (filters.search) {
      return (
        <EmptyState
          title="No recipes found"
          description={`We couldn't find any favorites matching "${filters.search}"`}
          action={{
            label: 'Clear Search',
            onPress: () => {
              setSearchQuery('');
              const newFilters = { ...filters };
              delete newFilters.search;
              applyFilters(newFilters);
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
            const newFilters = { ...filters };
            delete newFilters.search;
            applyFilters(newFilters);
          }}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={favoriteRecipes}
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
