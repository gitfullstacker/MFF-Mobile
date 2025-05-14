import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheet } from './BottomSheet';
import { Input } from '../forms/Input';
import { colors, typography, spacing, borderRadius } from '../../theme';
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

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={[styles.recipeItem, isSelected(item) && styles.selectedRecipe]}
      onPress={() => onSelect(item)}>
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.recipeInfo}>
          {item.total_time} min • {item.nutrition.calories} cal
        </Text>
      </View>
      {isSelected(item) && (
        <Icon name="check-circle" size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} height="75%">
      <View style={styles.header}>
        <Text style={styles.title}>Select Recipe</Text>
        <TouchableOpacity onPress={onClose}>
          <Icon name="x" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          onSubmitEditing={handleSearch}
        />
      </View>

      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    paddingVertical: spacing.md,
  },
  listContainer: {
    paddingBottom: spacing.lg,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectedRecipe: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  recipeContent: {
    flex: 1,
  },
  recipeTitle: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.medium,
  },
  recipeInfo: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
