import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { RecipeCard } from '../recipe/RecipeCard';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Recipe } from '../../types/recipe';

const { width: screenWidth } = Dimensions.get('window');

interface RecipeListDisplayProps {
  recipes: Recipe[];
  showSelectionIcon?: boolean;
  selectedDayLabel: string;
  onRecipeSelect: (recipe: Recipe) => void;
  onRecipeFavorite: (recipe: Recipe) => void;
  emptyStateText?: string;
  scrollEnabled?: boolean; // Add this prop to control scroll behavior
}

export const RecipeListDisplay: React.FC<RecipeListDisplayProps> = ({
  recipes,
  showSelectionIcon = false,
  selectedDayLabel,
  onRecipeSelect,
  onRecipeFavorite,
  emptyStateText,
  scrollEnabled = true, // Default to true for backward compatibility
}) => {
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

  // Empty state component
  if (recipes.length === 0) {
    return (
      <View style={styles.emptyDayContainer}>
        <Text style={styles.emptyDayText}>
          {emptyStateText ||
            `No recipes scheduled for ${selectedDayLabel}. Add recipes using the button above.`}
        </Text>
      </View>
    );
  }

  // Recipe item renderer for both FlatList and direct rendering
  const renderRecipeItem = (recipe: Recipe, index: number) => {
    const isMultiColumn = numColumns > 1;
    const cardStyle = isMultiColumn
      ? [styles.recipeCardContainer, styles.recipeCardMultiColumn]
      : styles.recipeCardContainer;

    return (
      <View key={recipe._id} style={cardStyle}>
        <RecipeCard
          recipe={recipe}
          showSelectionIcon={showSelectionIcon}
          isAdded
          onRemoveClick={onRecipeSelect}
          onPress={() => {}}
          onFavoriteToggle={onRecipeFavorite}
        />
      </View>
    );
  };

  // If scrollEnabled is false (inside ScrollView), render directly without FlatList
  if (!scrollEnabled) {
    const isMultiColumn = numColumns > 1;

    if (isMultiColumn) {
      // For multi-column layout, group recipes into rows
      const rows = [];
      for (let i = 0; i < recipes.length; i += numColumns) {
        rows.push(recipes.slice(i, i + numColumns));
      }

      return (
        <View style={styles.directRenderContainer}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((recipe, index) => renderRecipeItem(recipe, index))}
              {/* Fill empty columns in the last row */}
              {row.length < numColumns &&
                Array.from({ length: numColumns - row.length }).map(
                  (_, emptyIndex) => (
                    <View
                      key={`empty-${emptyIndex}`}
                      style={[
                        styles.recipeCardContainer,
                        styles.recipeCardMultiColumn,
                      ]}
                    />
                  ),
                )}
            </View>
          ))}
        </View>
      );
    } else {
      // For single column layout, render directly
      return (
        <View style={styles.directRenderContainer}>
          {recipes.map((recipe, index) => renderRecipeItem(recipe, index))}
        </View>
      );
    }
  }

  // If scrollEnabled is true (standalone), use FlatList
  const renderRecipe = ({ item }: { item: Recipe }) => {
    const isMultiColumn = numColumns > 1;
    const cardStyle = isMultiColumn
      ? [styles.recipeCardContainer, styles.recipeCardMultiColumn]
      : styles.recipeCardContainer;

    return (
      <View style={cardStyle}>
        <RecipeCard
          recipe={item}
          showSelectionIcon={showSelectionIcon}
          isAdded
          onRemoveClick={onRecipeSelect}
          onPress={() => {}}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={recipes}
      renderItem={renderRecipe}
      keyExtractor={item => item._id}
      numColumns={numColumns}
      key={numColumns} // Force re-render when columns change
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    />
  );
};

const styles = StyleSheet.create({
  emptyDayContainer: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  emptyDayText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: spacing.lg,
  },
  directRenderContainer: {
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recipeCardContainer: {
    marginBottom: spacing.md,
  },
  recipeCardMultiColumn: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
