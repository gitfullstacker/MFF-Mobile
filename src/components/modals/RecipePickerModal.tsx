import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Input } from '../forms/Input';
import { RecipeCard } from '../recipe/RecipeCard';
import { colors, typography, spacing } from '../../theme';
import { Recipe } from '../../types/recipe';
import { useRecipes } from '../../hooks/useRecipes';

interface RecipePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  selectedRecipes?: Recipe[];
}

export const RecipePickerModal: React.FC<RecipePickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedRecipes = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { recipes, loading, searchRecipes, fetchRecipes } = useRecipes();

  useEffect(() => {
    if (visible) {
      fetchRecipes({}, true);
    }
  }, [visible]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchRecipes(searchQuery);
    } else {
      fetchRecipes({}, true);
    }
  };

  const isSelected = (recipe: Recipe) => {
    return selectedRecipes.some(r => r._id === recipe._id);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height="80%">
      <View style={styles.header}>
        <Text style={styles.title}>Select Recipe</Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {recipes.map(item => (
          <View key={item._id} style={styles.recipeCardContainer}>
            <RecipeCard
              recipe={item}
              showSelectionIcon
              isAdded={isSelected(item)}
              onAddClick={onSelect}
              onRemoveClick={onSelect}
              onPress={() => {}}
            />
          </View>
        ))}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.h5,
    color: colors.text.primary,
  },
  searchContainer: {
    paddingVertical: spacing.sm,
  },
  listContainer: {
    paddingBottom: spacing.lg,
  },
  recipeCardContainer: {
    marginBottom: spacing.md,
  },
});
