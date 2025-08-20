import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { RangeSlider } from 'react-native-product-sliders';
import Icon from 'react-native-vector-icons/Feather';
import { Button } from '../forms/Button';
import { Input } from '../forms/Input';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { RecipeFilters } from '../../types/recipe';
import { RECIPE_CATEGORIES } from '@/constants';

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest' },
  { id: 'oldest', name: 'Oldest' },
  { id: 'timeAsc', name: 'Cooking Time (Low to High)' },
  { id: 'timeDesc', name: 'Cooking Time (High to Low)' },
];

// Generate year options (current year and previous 10 years)
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => currentYear - i);

// Month options
const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

interface RecipeFilterPanelProps {
  filters: RecipeFilters;
  onApply: (filters: RecipeFilters) => void;
}

export const RecipeFilterPanel: React.FC<RecipeFilterPanelProps> = ({
  filters,
  onApply,
}) => {
  const [localFilters, setLocalFilters] = useState<RecipeFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleReset = useCallback(() => {
    setLocalFilters({ sort: 'newest' });
    onApply({ sort: 'newest' });
  }, [onApply]);

  const handleApply = useCallback(() => {
    const updatedFilters = { ...localFilters };
    onApply(updatedFilters);
  }, [localFilters, onApply]);

  const updateFilter = useCallback(
    (key: keyof RecipeFilters, value: any) => {
      const newFilters = {
        ...localFilters,
        [key]: value,
      };
      setLocalFilters(newFilters);
    },
    [localFilters],
  );

  const toggleCategorySelection = useCallback(
    (category: string) => {
      const currentCategories = localFilters.types?.split(',') || [];
      let updatedCategories: string[];

      if (currentCategories.includes(category)) {
        updatedCategories = currentCategories.filter(item => item !== category);
      } else {
        updatedCategories = [...currentCategories, category];
      }

      const newTypes =
        updatedCategories.length === 0
          ? undefined
          : updatedCategories.join(',');
      updateFilter('types', newTypes);
    },
    [localFilters.types, updateFilter],
  );

  const isCategorySelected = useCallback(
    (category: string) => {
      const currentCategories = localFilters.types?.split(',') || [];
      return currentCategories.includes(category);
    },
    [localFilters.types],
  );

  const renderCategoryChips = useCallback(
    (categories: CategoryOption[]) => {
      return (
        <View style={styles.chipContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.chip,
                isCategorySelected(category.slug) && styles.chipSelected,
              ]}
              onPress={() => toggleCategorySelection(category.slug)}>
              <Text
                style={[
                  styles.chipText,
                  isCategorySelected(category.slug) && styles.chipTextSelected,
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

  const renderSlider = useCallback(
    (
      label: string,
      minKey: keyof RecipeFilters,
      maxKey: keyof RecipeFilters,
      sliderRange: [number, number],
      unit: string = 'g',
    ) => {
      const minValue =
        localFilters[minKey] !== undefined
          ? (localFilters[minKey] as number)
          : sliderRange[0];
      const maxValue =
        localFilters[maxKey] !== undefined
          ? (localFilters[maxKey] as number)
          : sliderRange[1];

      const handleRangeChange = (low: number, high: number) => {
        const newFilters = {
          ...localFilters,
          [minKey]: low === sliderRange[0] ? undefined : low,
          [maxKey]: high === sliderRange[1] ? undefined : high,
        };
        setLocalFilters(newFilters);
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

  const renderYearSelector = useCallback(() => {
    return (
      <View>
        <View style={styles.chipContainer}>
          <TouchableOpacity
            style={[styles.chip, !localFilters.year && styles.chipSelected]}
            onPress={() => updateFilter('year', undefined)}>
            <Text
              style={[
                styles.chipText,
                !localFilters.year && styles.chipTextSelected,
              ]}>
              All Years
            </Text>
          </TouchableOpacity>
          {YEAR_OPTIONS.map(year => (
            <TouchableOpacity
              key={year}
              style={[
                styles.chip,
                localFilters.year === year && styles.chipSelected,
              ]}
              onPress={() => updateFilter('year', year)}>
              <Text
                style={[
                  styles.chipText,
                  localFilters.year === year && styles.chipTextSelected,
                ]}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [localFilters.year, updateFilter]);

  const renderMonthSelector = useCallback(() => {
    return (
      <View>
        <View style={styles.chipContainer}>
          <TouchableOpacity
            style={[styles.chip, !localFilters.month && styles.chipSelected]}
            onPress={() => updateFilter('month', undefined)}>
            <Text
              style={[
                styles.chipText,
                !localFilters.month && styles.chipTextSelected,
              ]}>
              All Months
            </Text>
          </TouchableOpacity>
          {MONTH_OPTIONS.map(month => (
            <TouchableOpacity
              key={month.value}
              style={[
                styles.chip,
                localFilters.month === month.value && styles.chipSelected,
              ]}
              onPress={() => updateFilter('month', month.value)}>
              <Text
                style={[
                  styles.chipText,
                  localFilters.month === month.value && styles.chipTextSelected,
                ]}>
                {month.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [localFilters.month, updateFilter]);

  return (
    <View style={styles.container}>
      {/* Action Buttons at the top */}
      <View style={styles.header}>
        <Button
          title="Reset"
          onPress={handleReset}
          variant="outline"
          size="small"
          style={styles.resetButton}
          icon={<Icon name="refresh-cw" size={16} color={colors.primary} />}
        />
        <Button
          title="Apply Filters"
          onPress={handleApply}
          size="small"
          variant="primary"
          style={styles.applyButton}
          icon={<Icon name="check" size={16} color={colors.white} />}
        />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}>
        {/* Search by Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search by Ingredients</Text>
          <Input
            placeholder="e.g., tomatoes, chicken, onions"
            value={localFilters.ingredients || ''}
            onChangeText={text =>
              updateFilter('ingredients', text || undefined)
            }
            leftIcon="search"
            containerStyle={{ marginBottom: 0 }}
          />
        </View>

        {/* Year Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter by Year</Text>
          {renderYearSelector()}
        </View>

        {/* Month Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter by Month</Text>
          {renderMonthSelector()}
        </View>

        {/* Recipe Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          {renderCategoryChips(RECIPE_CATEGORIES)}
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
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
    fontWeight: typography.fontWeights.semibold,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  chip: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  sortOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortOptionText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  sortOptionTextSelected: {
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});
