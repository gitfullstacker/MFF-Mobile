import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RecipeCard } from '../recipe/RecipeCard';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Recipe } from '../../types/recipe';

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

  return (
    <ScrollView
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}>
      {recipes.map(item => (
        <View key={item._id} style={styles.recipeCardContainer}>
          <RecipeCard
            recipe={item}
            showSelectionIcon={showSelectionIcon}
            isAdded
            onRemoveClick={onRecipeSelect}
            onPress={() => {}}
          />
        </View>
      ))}
    </ScrollView>
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
});
