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
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
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
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Recipe, RecipeFilters } from '../../types/recipe';

type RecipesNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Recipes'>,
  StackNavigationProp<RootStackParamList>
>;

const RecipesScreen: React.FC = () => {
  const navigation = useNavigation<RecipesNavigationProp>();
  const {
    recipes,
    loading,
    hasMore,
    filters,
    fetchRecipes,
    searchRecipes,
    toggleFavorite,
    applyFilters,
  } = useRecipes();

  const [searchQuery, setSearchQuery] = useState('');
  const [showRecipeFilterModal, setShowRecipeFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Initial load
    if (recipes.length === 0) {
      fetchRecipes();
    }
  }, []);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      searchRecipes(searchQuery.trim());
    } else {
      setIsSearching(false);
      fetchRecipes({}, true);
    }
  }, [searchQuery, searchRecipes, fetchRecipes]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecipes({}, true);
    setRefreshing(false);
  }, [fetchRecipes]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !isSearching) {
      fetchRecipes();
    }
  }, [loading, hasMore, isSearching, fetchRecipes]);

  const handleRecipePress = useCallback(
    (recipe: Recipe) => {
      navigation.navigate('RecipeStack', {
        screen: 'RecipeDetail',
        params: { recipeId: recipe.slug, recipe },
      } as any);
    },
    [navigation],
  );

  const handleApplyFilters = useCallback(
    (newFilters: RecipeFilters) => {
      applyFilters(newFilters);
      setShowRecipeFilterModal(false);
    },
    [applyFilters],
  );

  const handleFavoriteToggle = useCallback(
    async (recipeId: string, isFavorite: boolean) => {
      await toggleFavorite(recipeId);
    },
    [toggleFavorite],
  );

  const getFilterCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
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
          onPress={() => handleRecipePress(item)}
          onFavoriteToggle={(recipeId, isFavorite) =>
            handleFavoriteToggle(recipeId, isFavorite)
          }
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

    if (isSearching) {
      return (
        <EmptyState
          title="No recipes found"
          description={`We couldn't find any recipes matching "${searchQuery}"`}
          action={{
            label: 'Clear Search',
            onPress: () => {
              setSearchQuery('');
              setIsSearching(false);
              fetchRecipes({}, true);
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
            setIsSearching(false);
            fetchRecipes({}, true);
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

export default RecipesScreen;
