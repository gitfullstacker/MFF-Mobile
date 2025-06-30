import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Input } from '../../components/forms/Input';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { RecipeFilterModal } from '../../components/modals/RecipeFilterModal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useRecipes } from '../../hooks/useRecipes';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
} from '../../theme';
import { Recipe, RecipeFilters } from '../../types/recipe';
import { useFavorites } from '@/hooks/useFavorites';
import { useNavigationHelpers } from '@/hooks/useNavigation';

const RecipeListScreen: React.FC = () => {
  const { navigateToRecipeDetail } = useNavigationHelpers();
  const { toggleFavorite } = useFavorites();
  const { recipes, loading, hasMore, filters, fetchRecipes, applyFilters } =
    useRecipes();

  const [searchQuery, setSearchQuery] = useState('');
  const [showRecipeFilterModal, setShowRecipeFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Initial load
    if (recipes.length === 0) {
      fetchRecipes();
    }
  }, []);

  const handleSearch = useCallback(() => {
    const newFilters: RecipeFilters = {
      ...filters,
      search: searchQuery.trim() || undefined,
    };
    applyFilters(newFilters);
  }, [searchQuery, filters, applyFilters]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecipes(filters, true);
    setRefreshing(false);
  }, [fetchRecipes, filters]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchRecipes();
    }
  }, [loading, hasMore, fetchRecipes]);

  const handleApplyFilters = useCallback(
    (newFilters: RecipeFilters) => {
      applyFilters(newFilters);
      setShowRecipeFilterModal(false);
    },
    [applyFilters],
  );

  const getFilterCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (
        key !== 'search' &&
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        count++;
      }
    });
    return count;
  };

  const renderRecipe = ({ item, index }: { item: Recipe; index: number }) => {
    return (
      <View style={styles.recipeCardContainer}>
        <RecipeCard
          recipe={item}
          onPress={() => navigateToRecipeDetail(item.slug, item)}
          onFavoriteToggle={recipeId => toggleFavorite(recipeId)}
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
    if (loading) return null;

    if (filters.search) {
      return (
        <EmptyState
          title="No recipes found"
          description={`We couldn't find any recipes matching "${filters.search}"`}
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
        title="No recipes yet"
        description="Check back later for new macro-friendly recipes"
      />
    );
  };

  const filterCount = getFilterCount();

  return (
    <PageContainer safeArea={false}>
      <Header
        title="Recipes"
        showBack={false}
        rightAction={{
          icon: 'filter',
          onPress: () => setShowRecipeFilterModal(true),
        }}
      />

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search recipes..."
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

        {filterCount > 0 && (
          <TouchableOpacity
            style={styles.filterBadge}
            onPress={() => setShowRecipeFilterModal(true)}>
            <Text style={styles.filterBadgeText}>{filterCount} filters</Text>
            <Icon name="x" size={14} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={recipes}
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
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
      />

      <RecipeFilterModal
        visible={showRecipeFilterModal}
        onClose={() => setShowRecipeFilterModal(false)}
        filters={filters}
        onApply={handleApplyFilters}
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
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  filterBadgeText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginRight: spacing.xs,
    fontWeight: fontWeights.medium,
  },
  listContent: {
    padding: spacing.sm,
    paddingTop: spacing.sm,
  },
  recipeCardContainer: {
    marginBottom: spacing.md,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});

export default RecipeListScreen;
