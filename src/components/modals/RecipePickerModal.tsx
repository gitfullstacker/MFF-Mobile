import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheet } from './BottomSheet';
import { Input } from '../forms/Input';
import { RecipeCard } from '../recipe/RecipeCard';
import { RecipeFilterPanel } from '../recipe/RecipeFilterPanel';
import { colors, typography, spacing } from '../../theme';
import { Recipe, RecipeFilters } from '../../types/recipe';
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
  const [showFilters, setShowFilters] = useState(false);
  const {
    recipes,
    filters,
    loading,
    searchRecipes,
    fetchRecipes,
    applyFilters,
  } = useRecipes();

  useEffect(() => {
    if (visible) {
      loadRecipes();
    }
  }, [visible]);

  const loadRecipes = () => {
    if (searchQuery.trim()) {
      searchRecipes(searchQuery);
    } else {
      fetchRecipes(filters, true);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchRecipes(searchQuery);
    } else {
      fetchRecipes(filters, true);
    }
  };

  const handleApplyFilters = (newFilters: RecipeFilters) => {
    applyFilters(newFilters);
    toggleFilters();
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const getFilterCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        count++;
      }
    });
    return count;
  };

  const isSelected = (recipe: Recipe) => {
    return selectedRecipes.some(r => r._id === recipe._id);
  };

  const filterCount = getFilterCount();

  if (showFilters) {
    return (
      <BottomSheet visible={visible} onClose={onClose} height="80%">
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleFilters} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Filter Recipes</Text>
          <View style={styles.placeholder} />
        </View>

        <RecipeFilterPanel filters={filters} onApply={handleApplyFilters} />
      </BottomSheet>
    );
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} height="80%">
      <View style={styles.header}>
        <Text style={styles.title}>Select Recipe</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            containerStyle={styles.searchInput}
          />
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterCount > 0 && styles.filterButtonActive,
            ]}
            onPress={toggleFilters}>
            <Icon
              name="filter"
              size={20}
              color={filterCount > 0 ? colors.white : colors.primary}
            />
            {filterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
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
  closeButton: {
    padding: spacing.xs,
  },
  backButton: {
    padding: spacing.xs,
  },
  placeholder: {
    width: 32, // Same width as close button for centering
  },
  searchContainer: {
    paddingVertical: spacing.sm,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.semantic.info,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: 10,
  },
  listContainer: {
    paddingBottom: spacing.lg,
  },
  recipeCardContainer: {
    marginBottom: spacing.md,
  },
});
