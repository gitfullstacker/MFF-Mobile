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
  emptyStateText?: string;
}

export const RecipeListDisplay: React.FC<RecipeListDisplayProps> = ({
  recipes,
  showSelectionIcon = false,
  selectedDayLabel,
  onRecipeSelect,
  emptyStateText,
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
  recipeCardContainer: {
    marginBottom: spacing.md,
  },
  recipeCardMultiColumn: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
