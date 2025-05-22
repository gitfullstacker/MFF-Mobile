import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { RangeSlider } from 'react-native-product-sliders';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheet } from './BottomSheet';
import { Button } from '../forms/Button';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { RecipeFilters } from '../../types/recipe';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: RecipeFilters;
  onApply: (filters: RecipeFilters) => void;
}

interface CategoryOption {
  id: string;
  name: string;
}

// Meal types configuration
const MEAL_TYPES: CategoryOption[] = [
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'lunch', name: 'Lunch' },
  { id: 'dinner', name: 'Dinner' },
  { id: 'snack', name: 'Snack' },
  { id: 'dessert', name: 'Dessert' },
];

// Sort options configuration
const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest' },
  { id: 'oldest', name: 'Oldest' },
  { id: 'timeAsc', name: 'Cooking Time (Low to High)' },
  { id: 'timeDesc', name: 'Cooking Time (High to Low)' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApply,
}) => {
  const [localFilters, setLocalFilters] = useState<RecipeFilters>(filters);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Reset local state when modal opens
  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
      setShowFavoritesOnly(!!filters.favorites);
    }
  }, [visible, filters]);

  const handleReset = useCallback(() => {
    setLocalFilters({});
    setShowFavoritesOnly(false);
  }, []);

  const handleApply = useCallback(() => {
    const updatedFilters = { ...localFilters };

    // Set favorites filter if enabled
    if (showFavoritesOnly) {
      updatedFilters.favorites = true;
    } else {
      updatedFilters.favorites = undefined;
    }

    onApply(updatedFilters);
    onClose();
  }, [localFilters, showFavoritesOnly, onApply, onClose]);

  const updateFilter = useCallback((key: keyof RecipeFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Handle category selection (meal types)
  const toggleCategorySelection = useCallback((category: string) => {
    setLocalFilters(prev => {
      const currentCategories = prev.types?.split(',') || [];
      let updatedCategories: string[];

      if (currentCategories.includes(category)) {
        updatedCategories = currentCategories.filter(item => item !== category);
      } else {
        updatedCategories = [...currentCategories, category];
      }

      if (updatedCategories.length === 0) {
        const newFilters = { ...prev };
        delete newFilters.types;
        return newFilters;
      } else {
        return {
          ...prev,
          types: updatedCategories.join(','),
        };
      }
    });
  }, []);

  const isCategorySelected = useCallback(
    (category: string) => {
      const currentCategories = localFilters.types?.split(',') || [];
      return currentCategories.includes(category);
    },
    [localFilters.types],
  );

  // Render category selection chips
  const renderCategoryChips = useCallback(
    (categories: CategoryOption[]) => {
      return (
        <View style={styles.chipContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.chip,
                isCategorySelected(category.id) && styles.chipSelected,
              ]}
              onPress={() => toggleCategorySelection(category.id)}>
              <Text
                style={[
                  styles.chipText,
                  isCategorySelected(category.id) && styles.chipTextSelected,
                ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    },
    [isCategorySelected, toggleCategorySelection],
  );

  // Render sort options
  const renderSortOptions = useCallback(() => {
    return (
      <View style={styles.sortOptionsContainer}>
        {SORT_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortOption,
              localFilters.sort === option.id && styles.sortOptionSelected,
            ]}
            onPress={() => updateFilter('sort', option.id)}>
            <Text
              style={[
                styles.sortOptionText,
                localFilters.sort === option.id &&
                  styles.sortOptionTextSelected,
              ]}>
              {option.name}
            </Text>
            {localFilters.sort === option.id && (
              <Icon name="check" size={16} color={colors.white} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [localFilters.sort, updateFilter]);

  // Render range slider
  const renderSlider = useCallback(
    (
      label: string,
      minKey: keyof RecipeFilters,
      maxKey: keyof RecipeFilters,
      sliderRange: [number, number],
      unit: string = 'g',
    ) => {
      // Ensure we always have valid values, defaulting to the slider range
      const minValue =
        localFilters[minKey] !== undefined
          ? (localFilters[minKey] as number)
          : sliderRange[0];
      const maxValue =
        localFilters[maxKey] !== undefined
          ? (localFilters[maxKey] as number)
          : sliderRange[1];

      const handleRangeChange = (low: number, high: number) => {
        setLocalFilters(prev => ({
          ...prev,
          [minKey]: low === sliderRange[0] ? undefined : low,
          [maxKey]: high === sliderRange[1] ? undefined : high,
        }));
      };

      return (
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabelContainer}>
            <Text style={styles.sliderLabel}>
              {label} ({unit})
            </Text>
            <Text style={styles.sliderValue}>
              {minValue}-{maxValue}
              {maxValue == sliderRange[1] ? '+' : ''}
            </Text>
          </View>

          <RangeSlider
            min={sliderRange[0]}
            max={sliderRange[1]}
            lowValue={minValue}
            highValue={maxValue}
            step={1}
            minRange={1}
            disabled={false}
            onRangeChange={handleRangeChange}
            thumbStyle={styles.sliderThumb}
            trackStyle={styles.sliderTrack}
            selectedTrackStyle={styles.sliderSelectedTrack}
          />

          <View style={styles.sliderRangeContainer}>
            <Text style={styles.sliderRangeText}>{sliderRange[0]}</Text>
            <Text style={styles.sliderRangeText}>{sliderRange[1]}+</Text>
          </View>
        </View>
      );
    },
    [localFilters],
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} height={600}>
      <View style={styles.header}>
        <Text style={styles.title}>Filter Recipes</Text>
        <Button
          title="Reset"
          onPress={handleReset}
          variant="text"
          size="small"
        />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false} // Prevents the scroll from bouncing
        scrollEventThrottle={16} // Ensures smooth scrolling
        // Prevent scroll gestures from being passed to the parent when we're at the top
        onScrollBeginDrag={e => {
          const offsetY = e.nativeEvent.contentOffset.y;
          if (offsetY <= 0) {
            e.stopPropagation();
          }
        }}>
        {/* Recipe Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          {renderCategoryChips(MEAL_TYPES)}
        </View>

        {/* Nutrition Ranges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition</Text>
          {renderSlider('Protein', 'proteinMin', 'proteinMax', [0, 50])}
          {renderSlider('Carbs', 'carbsMin', 'carbsMax', [0, 70])}
          {renderSlider('Fat', 'fatMin', 'fatMax', [0, 50])}
        </View>

        {/* Time Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooking Time</Text>
          {renderSlider('Total Time', 'timeMin', 'timeMax', [0, 120], 'min')}
        </View>

        {/* Sort Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          {renderSortOptions()}
        </View>

        {/* Favorites Switch */}
        <View style={styles.switchSection}>
          <Text style={styles.switchLabel}>Show favorites only</Text>
          <Switch
            value={showFavoritesOnly}
            onValueChange={setShowFavoritesOnly}
            trackColor={{
              false: colors.gray[300],
              true: colors.primary + '70',
            }}
            thumbColor={showFavoritesOnly ? colors.primary : colors.gray[100]}
          />
        </View>

        {/* Add extra padding at the bottom to ensure content is fully scrollable */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Apply Filters"
          onPress={handleApply}
          variant="primary"
          fullWidth
        />
      </View>
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
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  chip: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  chipTextSelected: {
    color: colors.white,
  },
  sliderContainer: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  sliderLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sliderLabel: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.medium,
  },
  sliderValue: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  sliderThumb: {
    backgroundColor: colors.primary,
    borderColor: colors.white,
    borderWidth: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sliderTrack: {
    backgroundColor: colors.gray[200],
    height: 4,
    borderRadius: 2,
  },
  sliderSelectedTrack: {
    backgroundColor: colors.primary,
    height: 4,
    borderRadius: 2,
  },
  sliderRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sliderRangeText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  sortOptionsContainer: {
    marginVertical: spacing.xs,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.gray[50],
  },
  sortOptionSelected: {
    backgroundColor: colors.primary,
  },
  sortOptionText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  sortOptionTextSelected: {
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
  },
  switchSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  switchLabel: {
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  footer: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  bottomPadding: {
    height: 50, // Extra padding at the bottom for better scrolling
  },
});
