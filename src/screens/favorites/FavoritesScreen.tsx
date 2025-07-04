import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
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

const { width: screenWidth } = Dimensions.get('window');

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

  // Determine number of columns based on screen width and orientation
  // Show 1 column on phones, 2 columns on tablets portrait, 3 columns on tablets landscape
  const getNumColumns = () => {
    if (screenWidth < 600) {
      return 1; // Phone
    } else if (screenWidth < 900) {
      return 2; // Tablet portrait
    } else {
      return 3; // Tablet landscape
    }
  };

  const [numColumns, setNumColumns] = useState(getNumColumns());

  useEffect(() => {
    // Update columns when screen orientation changes
    const updateColumns = () => {
      const { width } = Dimensions.get('window');
      const newColumns = width < 600 ? 1 : width < 900 ? 2 : 3;
      if (newColumns !== numColumns) {
        setNumColumns(newColumns);
      }
    };

    const subscription = Dimensions.addEventListener('change', updateColumns);
    return () => subscription?.remove();
  }, [numColumns]);

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
    const isMultiColumn = numColumns > 1;
    const cardStyle = isMultiColumn
      ? [styles.recipeCardContainer, styles.recipeCardMultiColumn]
      : styles.recipeCardContainer;

    return (
      <View style={cardStyle}>
        <RecipeCard
          recipe={item}
          onPress={() => navigateToRecipeDetail(item.slug)}
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
        numColumns={numColumns}
        key={numColumns} // Force re-render when columns change
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
  recipeCardMultiColumn: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});

export default FavoritesScreen;
