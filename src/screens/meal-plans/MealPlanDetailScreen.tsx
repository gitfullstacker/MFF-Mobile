import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { format, parseISO } from 'date-fns';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { Button } from '../../components/forms/Button';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { DaySelector } from '../../components/meal-plan/DaySelector';
import { RecipeListDisplay } from '../../components/meal-plan/RecipeListDisplay';
import { usePlans } from '../../hooks/usePlans';
import { colors, typography, spacing, fontWeights } from '../../theme';
import { PlanSchedule, ScheduledRecipe } from '../../types/plan';
import { Recipe } from '@/types/recipe';
import { ShoppingListModal } from '@/components/modals/ShoppingListModal';
import { MealPlanRouteProp } from '@/types';
import {
  useCurrentRoute,
  useNavigationHelpers,
  useSafeNavigation,
} from '@/hooks/useNavigation';
import { useFavorites } from '@/hooks/useFavorites';
import { WeeklyNutritionAnalysisModal } from '@/components/modals/WeeklyNutritionAnalysisModal';
import { useNutrition } from '@/hooks/useNutrition';

// Days of the week for DaySelector
const DAYS = [
  { key: 'su', label: 'Sunday' },
  { key: 'mo', label: 'Monday' },
  { key: 'tu', label: 'Tuesday' },
  { key: 'we', label: 'Wednesday' },
  { key: 'th', label: 'Thursday' },
  { key: 'fr', label: 'Friday' },
  { key: 'sa', label: 'Saturday' },
];

const MealPlanDetailScreen: React.FC = () => {
  const { params } = useCurrentRoute();
  const { safeGoBack } = useSafeNavigation();
  const { navigateToEditMealPlan } = useNavigationHelpers();
  const { toggleFavorite } = useFavorites();
  const { nutritionProfile } = useNutrition();
  const {
    loading: planLoading,
    selectedPlan,
    fetchPlan,
    deletePlan,
    duplicatePlan,
  } = usePlans();

  const routeParams = params as MealPlanRouteProp<'MealPlanDetail'>['params'];
  const planId = routeParams?.planId;

  const [selectedDay, setSelectedDay] = useState<string>('su');
  const [loading, setLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showNutritionAnalysis, setShowNutritionAnalysis] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [dayRecipes, setDayRecipes] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (isDeleted) return;

    if (planId && (!selectedPlan || selectedPlan._id !== planId)) {
      fetchPlan(planId);
    }
  }, [planId, selectedPlan, fetchPlan, isDeleted]);

  // Calculate macros and extract recipes when meal plan changes
  useEffect(() => {
    if (selectedPlan) {
      extractRecipes();
    }
  }, [selectedPlan]);

  // Recalculate daily macros and extract day recipes when selected day changes
  useEffect(() => {
    if (selectedPlan) {
      extractDayRecipes();
    }
  }, [selectedDay, selectedPlan]);

  // Helper function to extract recipe object from a scheduled recipe item
  const getRecipeObject = (item: ScheduledRecipe): Recipe | null => {
    if (typeof item.recipe === 'string') {
      return null;
    } else if (item.recipe && typeof item.recipe === 'object') {
      return item.recipe as Recipe;
    }
    return null;
  };

  // Extract all recipes from the meal plan
  const extractRecipes = () => {
    if (!selectedPlan) return;

    const allExtractedRecipes: Recipe[] = [];
    const validDayKeys = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

    validDayKeys.forEach(dayKey => {
      const daySchedule = selectedPlan.schedule[dayKey as keyof PlanSchedule];

      if (!Array.isArray(daySchedule)) return;

      daySchedule.forEach(item => {
        const recipe = getRecipeObject(item);
        if (recipe) {
          // Check if recipe is already in the array to avoid duplicates
          if (!allExtractedRecipes.some(r => r._id === recipe._id)) {
            allExtractedRecipes.push(recipe);
          }
        }
      });
    });

    setAllRecipes(allExtractedRecipes);
  };

  // Extract recipes for the currently selected day
  const extractDayRecipes = () => {
    if (!selectedPlan) return;

    const recipes: Recipe[] = [];
    const daySchedule =
      selectedPlan.schedule[selectedDay as keyof PlanSchedule];

    if (!Array.isArray(daySchedule)) {
      setDayRecipes([]);
      return;
    }

    daySchedule.forEach(item => {
      const recipe = getRecipeObject(item);
      if (recipe) {
        recipes.push(recipe);
      }
    });

    setDayRecipes(recipes);
  };

  // Get recipe counts by day
  const getRecipeCountByDay = (dayKey: string) => {
    if (!selectedPlan) return 0;

    const daySchedule = selectedPlan.schedule[dayKey as keyof PlanSchedule];
    // Check if it's actually an array
    return Array.isArray(daySchedule) ? daySchedule.length : 0;
  };

  // Handle duplicate plan
  const handleDuplicatePlan = async () => {
    try {
      setLoading(true);
      await duplicatePlan(planId);
      safeGoBack();
    } catch (error) {
      if (__DEV__) {
        console.error('Error duplicating plan:', error);
      }
      Alert.alert('Error', 'Failed to duplicate meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete plan
  const handleDeletePlan = () => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this meal plan?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              setIsDeleted(true);
              await deletePlan(planId);
              safeGoBack();
            } catch (error) {
              if (__DEV__) {
                console.error('Error deleting plan:', error);
              }
              Alert.alert(
                'Error',
                'Failed to delete meal plan. Please try again.',
              );
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // Generate shopping list
  const handleGenerateShoppingList = () => {
    if (allRecipes.length === 0) {
      Alert.alert('No Recipes', 'There are no recipes in this meal plan.');
      return;
    }

    setShowShoppingList(true);
  };

  // Get the selected day label
  const getSelectedDayLabel = (): string => {
    return DAYS.find(day => day.key === selectedDay)?.label || 'Selected Day';
  };

  // Show loading if no meal plan is available
  if (planLoading || !selectedPlan) {
    return <LoadingOverlay message="Loading meal plan..." />;
  }

  return (
    <PageContainer>
      <Header
        title="Meal Plan Details"
        showBack={true}
        rightAction={{
          icon: 'edit-2',
          onPress: () => navigateToEditMealPlan(planId),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Plan Header */}
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{selectedPlan.name}</Text>
          <Text style={styles.planDate}>
            Created {format(parseISO(selectedPlan.created_at), 'MMM d, yyyy')}
          </Text>
        </View>

        {/* Plan Management Actions */}
        <View style={styles.planManagementContainer}>
          <Button
            title="Duplicate"
            onPress={handleDuplicatePlan}
            variant="outline"
            size="small"
            icon={<Icon name="copy" size={18} color={colors.primary} />}
            style={styles.managementButton}
          />

          <Button
            title="Delete"
            onPress={handleDeletePlan}
            variant="outline"
            size="small"
            textStyle={{ color: colors.semantic.error }}
            style={{ ...styles.managementButton, ...styles.deleteButton }}
            icon={
              <Icon name="trash-2" size={18} color={colors.semantic.error} />
            }
          />
        </View>

        {/* Weekly Summary */}
        <Section title="Weekly Summary">
          <View style={styles.actionButtonsContainer}>
            <Button
              title="Nutrition Analysis"
              onPress={() => setShowNutritionAnalysis(true)}
              variant="secondary"
              size="small"
              icon={<Icon name="bar-chart-2" size={18} color={colors.white} />}
              style={styles.actionButton}
            />
            <Button
              title="Shopping List"
              onPress={handleGenerateShoppingList}
              variant="primary"
              size="small"
              icon={
                <Icon name="shopping-cart" size={18} color={colors.white} />
              }
              style={styles.actionButton}
            />
          </View>
        </Section>

        {/* Days */}
        <Section title="Days">
          <DaySelector
            days={DAYS}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
            getRecipeCountByDay={getRecipeCountByDay}
          />
        </Section>

        {/* Selected Day Meals */}
        <Section title={`${getSelectedDayLabel()} Meals`}>
          <RecipeListDisplay
            recipes={dayRecipes}
            selectedDayLabel={getSelectedDayLabel()}
            onRecipeSelect={() => {}}
            onRecipeFavorite={toggleFavorite}
            emptyStateText={`No recipes scheduled for ${getSelectedDayLabel()}.`}
          />
        </Section>
      </ScrollView>

      <WeeklyNutritionAnalysisModal
        visible={showNutritionAnalysis}
        onClose={() => setShowNutritionAnalysis(false)}
        plan={selectedPlan}
        nutritionProfile={nutritionProfile}
      />

      <ShoppingListModal
        visible={showShoppingList}
        onClose={() => setShowShoppingList(false)}
        recipes={allRecipes}
      />

      {loading && <LoadingOverlay message="Loading..." />}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  planHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  planName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  planDate: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  planManagementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  managementButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  deleteButton: {
    borderColor: colors.semantic.error,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default MealPlanDetailScreen;
