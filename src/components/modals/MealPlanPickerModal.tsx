import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheet } from './BottomSheet';
import { Button } from '../forms/Button';
import { LoadingOverlay } from '../feedback/LoadingOverlay';
import { usePlans } from '../../hooks/usePlans';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Recipe } from '../../types/recipe';
import {
  Plan,
  PlanSchedule,
  ScheduledRecipe,
  DayOfWeek,
  DAYS_OF_WEEK,
} from '../../types/plan';

interface MealPlanPickerModalProps {
  visible: boolean;
  onClose: () => void;
  recipe: Recipe;
  onSuccess?: () => void;
}

type ViewMode = 'plans' | 'days' | 'options';

export const MealPlanPickerModal: React.FC<MealPlanPickerModalProps> = ({
  visible,
  onClose,
  recipe,
  onSuccess,
}) => {
  const { plans, loading, fetchPlans, updatePlan, createPlan } = usePlans();
  const [viewMode, setViewMode] = useState<ViewMode>('plans');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [existingDays, setExistingDays] = useState<DayOfWeek[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchPlans();
      setViewMode('plans');
      setSelectedPlan(null);
      setSelectedDay(null);
      setExistingDays([]);
    }
  }, [visible, fetchPlans]);

  // Check if recipe exists in the selected plan and on which days
  const checkRecipeInPlan = (plan: Plan): DayOfWeek[] => {
    const daysWithRecipe: DayOfWeek[] = [];

    DAYS_OF_WEEK.forEach(dayInfo => {
      const daySchedule = plan.schedule[dayInfo.value];
      if (Array.isArray(daySchedule)) {
        const hasRecipe = daySchedule.some((item: ScheduledRecipe) => {
          // Backend returns populated Recipe objects, not IDs
          const recipeId = (item.recipe as Recipe)?._id;
          return recipeId === recipe._id;
        });

        if (hasRecipe) {
          daysWithRecipe.push(dayInfo.value);
        }
      }
    });

    return daysWithRecipe;
  };

  // Get recipe count for a specific day in a plan
  const getRecipeCountForDay = (plan: Plan, day: DayOfWeek): number => {
    const daySchedule = plan.schedule[day];
    return Array.isArray(daySchedule) ? daySchedule.length : 0;
  };

  // Check if recipe exists on a specific day
  const isRecipeOnDay = (plan: Plan, day: DayOfWeek): boolean => {
    const daySchedule = plan.schedule[day];
    if (!Array.isArray(daySchedule)) return false;

    return daySchedule.some((item: ScheduledRecipe) => {
      // Backend returns populated Recipe objects, not IDs
      const recipeId = (item.recipe as Recipe)?._id;
      return recipeId === recipe._id;
    });
  };

  // Handle plan selection
  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    const existingRecipeDays = checkRecipeInPlan(plan);
    setExistingDays(existingRecipeDays);
    setViewMode('days');
  };

  // Handle day selection
  const handleDaySelect = (day: DayOfWeek) => {
    if (!selectedPlan) return;

    // Check if recipe already exists on this specific day (should be disabled, but just in case)
    if (isRecipeOnDay(selectedPlan, day)) {
      return; // This day should be disabled
    }

    // Set the selected day first
    setSelectedDay(day);

    // Check if recipe exists in other days of the plan (use current existingDays state)
    if (existingDays.length > 0) {
      // Show options for duplicate handling since recipe exists elsewhere in the plan
      setViewMode('options');
    } else {
      // Add recipe directly since it doesn't exist anywhere in the plan
      // Use the day parameter directly instead of waiting for state update
      addRecipeDirectly(day, false); // false = with ingredients (default)
    }
  };

  // Add recipe directly with the specified day (avoiding state timing issues)
  const addRecipeDirectly = async (
    day: DayOfWeek,
    onlyRecipe: boolean = false,
  ) => {
    if (!selectedPlan) return;

    try {
      setIsUpdating(true);

      const newScheduledRecipe: ScheduledRecipe = {
        recipe: recipe._id,
        only_recipe: onlyRecipe,
      };

      // Restructure the entire schedule to clean format
      const cleanSchedule: PlanSchedule = {
        su: [],
        mo: [],
        tu: [],
        we: [],
        th: [],
        fr: [],
        sa: [],
      };

      // Copy existing schedule data in clean format
      DAYS_OF_WEEK.forEach(dayInfo => {
        const daySchedule = selectedPlan.schedule[dayInfo.value];
        if (Array.isArray(daySchedule)) {
          cleanSchedule[dayInfo.value] = daySchedule.map(item => ({
            recipe:
              typeof item.recipe === 'object'
                ? (item.recipe as Recipe)._id
                : item.recipe,
            only_recipe: item.only_recipe,
          }));
        }
      });

      // Check if recipe already exists on this day
      const existingIndex = cleanSchedule[day].findIndex(
        (item: ScheduledRecipe) => {
          return item.recipe === recipe._id;
        },
      );

      if (existingIndex >= 0) {
        // This shouldn't happen since we disable days with existing recipes
        return;
      } else {
        // Add new entry
        cleanSchedule[day].push(newScheduledRecipe);
      }

      // Update the plan
      await updatePlan(selectedPlan._id, { schedule: cleanSchedule });

      // Show success message
      Alert.alert(
        'Success!',
        `"${recipe.name}" has been added to ${selectedPlan.name} for ${
          DAYS_OF_WEEK.find(d => d.value === day)?.fullName
        }.`,
        [{ text: 'OK', onPress: handleSuccess }],
      );
    } catch (error) {
      console.error('Error adding recipe to plan:', error);
      Alert.alert(
        'Error',
        'Failed to add recipe to meal plan. Please try again.',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Add recipe to the selected plan and day (for options modal)
  const addRecipeToPlan = async (onlyRecipe: boolean = false) => {
    if (!selectedPlan || !selectedDay) return;

    try {
      setIsUpdating(true);

      const newScheduledRecipe: ScheduledRecipe = {
        recipe: recipe._id,
        only_recipe: onlyRecipe,
      };

      // Restructure the entire schedule to clean format
      const cleanSchedule: PlanSchedule = {
        su: [],
        mo: [],
        tu: [],
        we: [],
        th: [],
        fr: [],
        sa: [],
      };

      // Copy existing schedule data in clean format
      DAYS_OF_WEEK.forEach(dayInfo => {
        const daySchedule = selectedPlan.schedule[dayInfo.value];
        if (Array.isArray(daySchedule)) {
          cleanSchedule[dayInfo.value] = daySchedule.map(item => ({
            recipe:
              typeof item.recipe === 'object'
                ? (item.recipe as Recipe)._id
                : item.recipe,
            only_recipe: item.only_recipe,
          }));
        }
      });

      // Check if recipe already exists on this day
      const existingIndex = cleanSchedule[selectedDay].findIndex(
        (item: ScheduledRecipe) => {
          return item.recipe === recipe._id;
        },
      );

      if (existingIndex >= 0) {
        // This shouldn't happen since we disable days with existing recipes
        return;
      } else {
        // Add new entry
        cleanSchedule[selectedDay].push(newScheduledRecipe);
      }

      // Update the plan
      await updatePlan(selectedPlan._id, { schedule: cleanSchedule });

      // Show success message
      Alert.alert(
        'Success!',
        `"${recipe.name}" has been added to ${selectedPlan.name} for ${
          DAYS_OF_WEEK.find(d => d.value === selectedDay)?.fullName
        }.`,
        [{ text: 'OK', onPress: handleSuccess }],
      );
    } catch (error) {
      console.error('Error adding recipe to plan:', error);
      Alert.alert(
        'Error',
        'Failed to add recipe to meal plan. Please try again.',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle successful addition
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  // Create new meal plan
  const handleCreateNewPlan = () => {
    Alert.alert('Create New Plan', 'Enter a name for your new meal plan:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Create',
        onPress: async () => {
          try {
            setIsUpdating(true);

            // Create clean schedule without any _id fields
            const cleanSchedule: PlanSchedule = {
              su: [],
              mo: [],
              tu: [],
              we: [],
              th: [],
              fr: [],
              sa: [],
            };

            const newPlan = await createPlan({
              name: `New Plan - ${new Date().toLocaleDateString()}`,
              schedule: cleanSchedule,
              removed_ingredient_ids: [],
            });

            setSelectedPlan(newPlan);
            setExistingDays([]);
            setViewMode('days');
          } catch (error) {
            Alert.alert('Error', 'Failed to create new meal plan.');
          } finally {
            setIsUpdating(false);
          }
        },
      },
    ]);
  };

  // Get total recipe count for a plan
  const getTotalRecipeCount = (plan: Plan): number => {
    let total = 0;
    Object.values(plan.schedule).forEach(day => {
      if (Array.isArray(day)) {
        total += day.length;
      }
    });
    return total;
  };

  // Render plan selection view
  const renderPlanSelection = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Select Meal Plan</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Create New Plan Option */}
        <TouchableOpacity
          style={styles.createPlanCard}
          onPress={handleCreateNewPlan}>
          <View style={styles.createPlanIcon}>
            <Icon name="plus" size={24} color={colors.primary} />
          </View>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>Create New Meal Plan</Text>
            <Text style={styles.planSubtitle}>
              Start a new plan with this recipe
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.text.secondary} />
        </TouchableOpacity>

        {/* Existing Plans */}
        {plans.map(plan => {
          const recipeCount = getTotalRecipeCount(plan);
          const existingRecipeDays = checkRecipeInPlan(plan);

          return (
            <TouchableOpacity
              key={plan._id}
              style={styles.planCard}
              onPress={() => handlePlanSelect(plan)}>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planSubtitle}>
                  {recipeCount} recipe{recipeCount !== 1 ? 's' : ''}
                  {existingRecipeDays.length > 0 && (
                    <Text style={styles.existingRecipeText}>
                      {' '}
                      • Recipe already added
                    </Text>
                  )}
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          );
        })}

        {plans.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No meal plans found. Create your first plan to get started.
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );

  // Render day selection view
  const renderDaySelection = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setViewMode('plans')}
          style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Day</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.planHeader}>
        <Text style={styles.selectedPlanName}>{selectedPlan?.name}</Text>
        <Text style={styles.recipeBeingAdded}>Adding: {recipe.name}</Text>
      </View>

      <ScrollView style={styles.content}>
        {existingDays.length > 0 && (
          <View style={styles.warningSection}>
            <View style={styles.warningHeader}>
              <Icon name="info" size={20} color={colors.semantic.warning} />
              <Text style={styles.warningTitle}>Recipe Already in Plan</Text>
            </View>
            <Text style={styles.warningText}>
              This recipe is already scheduled on:{' '}
              {existingDays
                .map(day => DAYS_OF_WEEK.find(d => d.value === day)?.label)
                .join(', ')}
              . You can add it to other available days.
            </Text>
          </View>
        )}

        <View style={styles.daysGrid}>
          {DAYS_OF_WEEK.map(dayInfo => {
            const isExisting = existingDays.includes(dayInfo.value);
            const recipeCount = selectedPlan
              ? getRecipeCountForDay(selectedPlan, dayInfo.value)
              : 0;

            return (
              <TouchableOpacity
                key={dayInfo.value}
                style={[styles.dayCard, isExisting && styles.dayCardDisabled]}
                onPress={() => handleDaySelect(dayInfo.value)}
                disabled={isExisting}>
                <Text
                  style={[
                    styles.dayLabel,
                    isExisting && styles.dayLabelDisabled,
                  ]}>
                  {dayInfo.label}
                </Text>
                <Text
                  style={[
                    styles.dayFullName,
                    isExisting && styles.dayFullNameDisabled,
                  ]}>
                  {dayInfo.fullName}
                </Text>

                {/* Recipe count badge */}
                {recipeCount > 0 && (
                  <View
                    style={[
                      styles.recipeCountBadge,
                      isExisting && styles.recipeCountBadgeDisabled,
                    ]}>
                    <Text
                      style={[
                        styles.recipeCountText,
                        isExisting && styles.recipeCountTextDisabled,
                      ]}>
                      {recipeCount}
                    </Text>
                  </View>
                )}

                {/* Existing recipe indicator */}
                {isExisting && (
                  <View style={styles.disabledOverlay}>
                    <Icon name="check" size={16} color={colors.white} />
                    <Text style={styles.disabledText}>Added</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </>
  );

  // Render options view for duplicate handling
  const renderOptionsView = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setViewMode('days')}
          style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Options</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.duplicateWarning}>
        <Icon name="alert-circle" size={24} color={colors.semantic.info} />
        <Text style={styles.duplicateWarningText}>
          "{recipe.name}" already exists in this meal plan. How would you like
          to add it to{' '}
          {DAYS_OF_WEEK.find(d => d.value === selectedDay)?.fullName}?
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.optionsTitle}>How would you like to add it?</Text>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => addRecipeToPlan(false)}>
          <View style={styles.optionIcon}>
            <Icon name="list" size={24} color={colors.primary} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>With Ingredients</Text>
            <Text style={styles.optionDescription}>
              Include ingredients in shopping list (recommended)
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => addRecipeToPlan(true)}>
          <View style={styles.optionIcon}>
            <Icon name="book-open" size={24} color={colors.primary} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Recipe Only</Text>
            <Text style={styles.optionDescription}>
              Don't include ingredients in shopping list
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );

  // Render current view based on mode
  const renderCurrentView = () => {
    switch (viewMode) {
      case 'plans':
        return renderPlanSelection();
      case 'days':
        return renderDaySelection();
      case 'options':
        return renderOptionsView();
      default:
        return renderPlanSelection();
    }
  };

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose} height="80%">
        {renderCurrentView()}
      </BottomSheet>

      <LoadingOverlay
        visible={loading || isUpdating}
        message={isUpdating ? 'Adding recipe...' : 'Loading plans...'}
      />
    </>
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
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: spacing.xs,
  },
  backButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    paddingTop: spacing.md,
  },

  // Plan selection styles
  createPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  createPlanIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  planSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  existingRecipeText: {
    color: colors.semantic.warning,
    fontWeight: typography.fontWeights.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Day selection styles
  planHeader: {
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  selectedPlanName: {
    ...typography.h6,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.bold,
  },
  recipeBeingAdded: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  warningSection: {
    backgroundColor: colors.semantic.warning + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.semantic.warning + '30',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  warningTitle: {
    ...typography.bodyRegular,
    color: colors.semantic.warning,
    fontWeight: typography.fontWeights.semibold,
    marginLeft: spacing.xs,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCard: {
    width: '48%',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    position: 'relative',
  },
  dayCardExisting: {
    backgroundColor: colors.semantic.warning + '10',
    borderColor: colors.semantic.warning + '50',
  },
  dayLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  dayLabelExisting: {
    color: colors.semantic.warning,
  },
  dayFullName: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.semibold,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  dayFullNameExisting: {
    color: colors.semantic.warning,
  },
  existingBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.semantic.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Options view styles
  duplicateWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.semantic.warning + '10',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  duplicateWarningText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  optionsTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },

  // Disabled day card styles
  dayCardDisabled: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[200],
    opacity: 0.6,
  },
  dayLabelDisabled: {
    color: colors.gray[400],
  },
  dayFullNameDisabled: {
    color: colors.gray[400],
  },
  recipeCountBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  recipeCountBadgeDisabled: {
    backgroundColor: colors.gray[400],
  },
  recipeCountText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: 10,
  },
  recipeCountTextDisabled: {
    color: colors.white,
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledText: {
    ...typography.caption,
    color: colors.white,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeights.semibold,
  },
});
