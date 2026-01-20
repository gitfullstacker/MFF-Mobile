import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { RecipeCard } from '../recipe/RecipeCard';
import { SwipeIndicator } from '../ui/SwipeIndicator';
import { Button } from '../forms/Button';
import { DaySelector } from '../meal-plan/DaySelector';
import { useFavorites } from '../../hooks/useFavorites';
import { usePlans } from '../../hooks/usePlans';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { Recipe } from '../../types/recipe';
import {
  Plan,
  PlanSchedule,
  DAYS_OF_WEEK,
  CreatePlanRequest,
} from '../../types/plan';
import { useNavigationHelpers } from '@/hooks/useNavigation';

const { width: screenWidth } = Dimensions.get('window');

interface SuggestedMealPlanSectionProps {
  onSavePlan?: (plan: Plan) => void;
}

const mealCardWidth = screenWidth * 0.75;

export const SuggestedMealPlanSection: React.FC<
  SuggestedMealPlanSectionProps
> = ({ onSavePlan }) => {
  const { navigateToRecipeDetail } = useNavigationHelpers();
  const { toggleFavorite } = useFavorites();
  const { suggestedPlan, fetchSuggestedMealPlan, createPlan } = usePlans();

  // Local state
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('su');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs for scroll tracking
  const recipesScrollRef = useRef<FlatList>(null);
  const recipesScrollX = useRef(new Animated.Value(0)).current;

  const loadSuggestedMealPlan = async () => {
    try {
      setLoading(true);
      await fetchSuggestedMealPlan();
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to load suggested meal plan:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggested meal plan when user expands the section
  const toggleExpanded = async () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    // Only fetch when expanding and if we don't have suggested plan yet
    if (newExpanded) {
      await loadSuggestedMealPlan();
    }
  };

  const handleSavePlan = async () => {
    if (!suggestedPlan || isSaving) return;

    setIsSaving(true);
    try {
      // Convert schedule to the format expected by the API
      // Extract recipe IDs from recipe objects, similar to MealPlanEditScreen
      const cleanSchedule: any = {};
      Object.keys(suggestedPlan.schedule).forEach(day => {
        cleanSchedule[day] = suggestedPlan.schedule[
          day as keyof PlanSchedule
        ].map(item => ({
          recipe:
            typeof item.recipe === 'object'
              ? (item.recipe as Recipe)._id
              : item.recipe,
          only_recipe: item.only_recipe,
        }));
      });

      const planData: CreatePlanRequest = {
        name: suggestedPlan.name,
        schedule: cleanSchedule,
        removed_ingredient_ids: [],
      };

      // Call the createPlan API to actually save the plan
      await createPlan(planData);

      // Show success message
      Alert.alert(
        'Plan Saved',
        `"${suggestedPlan.name}" has been saved to your meal plans.`,
        [
          {
            text: 'OK',
            style: 'default',
          },
        ],
      );

      // Call optional callback if provided
      onSavePlan?.(suggestedPlan);
    } catch (error: any) {
      if (__DEV__) {
        console.error('Error saving plan:', error);
      }
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Failed to save meal plan. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Get recipe count by day
  const getRecipeCountByDay = (dayKey: string) => {
    if (!suggestedPlan) return 0;
    const daySchedule = suggestedPlan.schedule[dayKey as keyof PlanSchedule];
    return Array.isArray(daySchedule) ? daySchedule.length : 0;
  };

  // Get selected day recipes
  const getSelectedDayRecipes = (): Recipe[] => {
    if (!suggestedPlan) return [];

    const daySchedule =
      suggestedPlan.schedule[selectedDay as keyof PlanSchedule];
    if (!Array.isArray(daySchedule)) return [];

    return daySchedule
      .map(item => (typeof item.recipe === 'string' ? null : item.recipe))
      .filter((recipe): recipe is Recipe => recipe !== null);
  };

  const selectedDayRecipes = getSelectedDayRecipes();

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      key={item._id}
      style={styles.recipeCardContainer}
      onPress={() => navigateToRecipeDetail(item.slug)}>
      <RecipeCard
        recipe={item}
        onPress={() => navigateToRecipeDetail(item.slug)}
        onFavoriteToggle={() => toggleFavorite(item)}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        <Text style={styles.headerTitle}>Suggested Meal Plan</Text>
        <View style={styles.headerRight}>
          <Text style={styles.guideText}>
            {isExpanded ? 'Tap to collapse' : 'Tap to expand'}
          </Text>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.text.primary}
          />
        </View>
      </TouchableOpacity>

      {/* Loading state when expanding */}
      {isExpanded && loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading suggested meal plan...</Text>
        </View>
      )}

      {/* Content - only show if we have data */}
      {isExpanded && suggestedPlan && !loading && (
        <View style={styles.content}>
          {/* Plan Info and Save Button */}
          <View style={styles.planInfoSection}>
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{suggestedPlan.name}</Text>
              <Text style={styles.planDescription}>
                {Object.values(suggestedPlan.schedule).flat().length} recipes •
                7 days
              </Text>
            </View>
            <Button
              title={isSaving ? 'Saving...' : 'Save Plan'}
              onPress={handleSavePlan}
              variant="primary"
              size="small"
              disabled={isSaving}
              icon={
                <Icon
                  name={isSaving ? 'clock' : 'bookmark'}
                  size={16}
                  color={colors.white}
                />
              }
            />
          </View>

          {/* Day Selector */}
          <View style={styles.daySection}>
            <DaySelector
              days={DAYS_OF_WEEK.map(day => ({
                key: day.value,
                label: day.fullName,
              }))}
              selectedDay={selectedDay}
              onDaySelect={setSelectedDay}
              getRecipeCountByDay={getRecipeCountByDay}
            />
          </View>

          {/* Selected Day Recipes */}
          <View style={styles.recipesSection}>
            {selectedDayRecipes.length > 0 ? (
              <View style={styles.recipesContainer}>
                <FlatList
                  ref={recipesScrollRef}
                  data={selectedDayRecipes}
                  renderItem={renderRecipeCard}
                  keyExtractor={item => item._id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recipesList}
                  decelerationRate="fast"
                  pagingEnabled={false}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: recipesScrollX } } }],
                    { useNativeDriver: false },
                  )}
                  scrollEventThrottle={16}
                />
                {selectedDayRecipes.length > 1 && (
                  <SwipeIndicator
                    itemCount={selectedDayRecipes.length}
                    itemWidth={mealCardWidth}
                    scrollX={recipesScrollX}
                    style={styles.recipesIndicator}
                  />
                )}
              </View>
            ) : (
              <Text style={styles.noRecipesText}>
                No recipes planned for this day
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Error state when expanded but no data and not loading */}
      {isExpanded && !suggestedPlan && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Unable to load suggested meal plan
          </Text>
          <TouchableOpacity onPress={loadSuggestedMealPlan}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h5,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  guideText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginRight: spacing.xs,
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  errorContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  content: {
    gap: spacing.lg,
  },
  planInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  planInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  planName: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  planDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  daySection: {
    gap: spacing.sm,
  },
  recipesSection: {
    gap: spacing.sm,
  },
  recipesContainer: {
    position: 'relative',
  },
  recipesList: {
    paddingRight: spacing.md,
  },
  recipeCardContainer: {
    width: mealCardWidth,
    marginRight: spacing.md,
  },
  recipesIndicator: {
    marginTop: spacing.sm,
  },
  noRecipesText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    padding: spacing.lg,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
  },
});
