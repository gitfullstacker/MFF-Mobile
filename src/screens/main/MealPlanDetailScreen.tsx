import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import { format, parseISO } from 'date-fns';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { Button } from '../../components/forms/Button';
import { MacroDisplay } from '../../components/recipe/MacroDisplay';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { DaySelector } from '../../components/meal-plan/DaySelector';
import { RecipeListDisplay } from '../../components/meal-plan/RecipeListDisplay';
import { usePlans } from '../../hooks/usePlans';
import { colors, typography, spacing, fontWeights } from '../../theme';
import { MealPlanStackParamList } from '../../navigation/types';
import { Plan, PlanSchedule, ScheduledRecipe } from '../../types/plan';
import { Recipe } from '@/types/recipe';
import { ShoppingListModal } from '@/components/modals/ShoppingListModal';

type MealPlanDetailNavigationProp = StackNavigationProp<
  MealPlanStackParamList,
  'MealPlanDetail'
>;

type MealPlanDetailRouteProp = RouteProp<
  MealPlanStackParamList,
  'MealPlanDetail'
>;

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
  const navigation = useNavigation<MealPlanDetailNavigationProp>();
  const route = useRoute<MealPlanDetailRouteProp>();
  const { planId, plan } = route.params;
  const { deletePlan, duplicatePlan } = usePlans();

  const [selectedDay, setSelectedDay] = useState<string>('su');
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<Plan | null>(null);
  const [dailyMacros, setDailyMacros] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
  });
  const [weeklyMacros, setWeeklyMacros] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
  });
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [dayRecipes, setDayRecipes] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);

  // Use plan from route params or fetch if not available
  useEffect(() => {
    if (plan) {
      // Use plan from params (passed from EditMealPlan or other screens)
      setMealPlan(plan);
    } else {
      // Fallback: This shouldn't happen in normal flow, but just in case
      console.warn(
        'No plan provided in params. This should not happen in normal flow.',
      );
    }
  }, [plan]);

  // Calculate macros and extract recipes when meal plan changes
  useEffect(() => {
    if (mealPlan) {
      calculateMacros();
      extractRecipes();
    }
  }, [mealPlan]);

  // Recalculate daily macros and extract day recipes when selected day changes
  useEffect(() => {
    if (mealPlan) {
      calculateDailyMacros();
      extractDayRecipes();
    }
  }, [selectedDay, mealPlan]);

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
    if (!mealPlan) return;

    const allExtractedRecipes: Recipe[] = [];
    const validDayKeys = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

    validDayKeys.forEach(dayKey => {
      const daySchedule = mealPlan.schedule[dayKey as keyof PlanSchedule];

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
    if (!mealPlan) return;

    const recipes: Recipe[] = [];
    const daySchedule = mealPlan.schedule[selectedDay as keyof PlanSchedule];

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

  // Calculate macros for the selected day and the whole week
  const calculateMacros = () => {
    if (!mealPlan) return;

    calculateWeeklyMacros();
  };

  // Calculate daily macros
  const calculateDailyMacros = () => {
    if (!mealPlan) return;

    const daySchedule = mealPlan.schedule[selectedDay as keyof PlanSchedule];

    // Check if it's actually an array
    if (!Array.isArray(daySchedule)) {
      setDailyMacros({
        protein: 0,
        carbs: 0,
        fat: 0,
        calories: 0,
      });
      return;
    }

    let proteinTotal = 0;
    let carbsTotal = 0;
    let fatTotal = 0;
    let caloriesTotal = 0;

    daySchedule.forEach((item: ScheduledRecipe) => {
      const recipe = getRecipeObject(item);
      if (recipe && recipe.nutrition) {
        proteinTotal += recipe.nutrition.protein;
        carbsTotal += recipe.nutrition.carbohydrates;
        fatTotal += recipe.nutrition.fat;
        caloriesTotal += recipe.nutrition.calories;
      }
    });

    setDailyMacros({
      protein: proteinTotal,
      carbs: carbsTotal,
      fat: fatTotal,
      calories: caloriesTotal,
    });
  };

  // Calculate weekly macros
  const calculateWeeklyMacros = () => {
    if (!mealPlan) return;

    let weeklyProtein = 0;
    let weeklyCarbs = 0;
    let weeklyFat = 0;
    let weeklyCalories = 0;

    // Filter valid day keys to avoid non-array values like _id
    const validDayKeys = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

    validDayKeys.forEach(dayKey => {
      const daySchedule = mealPlan.schedule[dayKey as keyof PlanSchedule];

      // Skip if not an array or undefined
      if (!Array.isArray(daySchedule)) return;

      daySchedule.forEach((item: ScheduledRecipe) => {
        const recipe = getRecipeObject(item);
        if (recipe && recipe.nutrition) {
          weeklyProtein += recipe.nutrition.protein;
          weeklyCarbs += recipe.nutrition.carbohydrates;
          weeklyFat += recipe.nutrition.fat;
          weeklyCalories += recipe.nutrition.calories;
        }
      });
    });

    setWeeklyMacros({
      protein: weeklyProtein,
      carbs: weeklyCarbs,
      fat: weeklyFat,
      calories: weeklyCalories,
    });
  };

  // Get recipe counts by day
  const getRecipeCountByDay = (dayKey: string) => {
    if (!mealPlan) return 0;

    const daySchedule = mealPlan.schedule[dayKey as keyof PlanSchedule];
    // Check if it's actually an array
    return Array.isArray(daySchedule) ? daySchedule.length : 0;
  };

  // Handle edit plan
  const handleEditPlan = () => {
    if (mealPlan) {
      navigation.navigate('EditMealPlan', { planId, plan: mealPlan });
    }
  };

  // Handle duplicate plan
  const handleDuplicatePlan = async () => {
    try {
      setLoading(true);
      await duplicatePlan(planId);
      navigation.goBack();
    } catch (error) {
      console.error('Error duplicating plan:', error);
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
              await deletePlan(planId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting plan:', error);
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
  if (!mealPlan) {
    return <LoadingOverlay visible={true} message="Loading meal plan..." />;
  }

  return (
    <PageContainer safeArea={false}>
      <Header
        title="Meal Plan Details"
        showBack={true}
        rightAction={{
          icon: 'edit-2',
          onPress: handleEditPlan,
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Plan Header */}
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{mealPlan.name}</Text>
          <Text style={styles.planDate}>
            Created {format(parseISO(mealPlan.created_at), 'MMM d, yyyy')}
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
          <View style={styles.macroSummary}>
            <MacroDisplay
              protein={weeklyMacros.protein}
              carbs={weeklyMacros.carbs}
              fat={weeklyMacros.fat}
              calories={weeklyMacros.calories}
              variant="circle"
              size="medium"
              precision={0}
            />
          </View>

          <View style={styles.actionButtonsContainer}>
            <Button
              title="Shopping List"
              onPress={handleGenerateShoppingList}
              variant="outline"
              size="small"
              icon={
                <Icon name="shopping-cart" size={18} color={colors.primary} />
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
        <Section
          title={`${getSelectedDayLabel()} Meals`}
          action={{
            label: 'Macros',
            onPress: () => {
              Alert.alert(
                'Daily Macros',
                `Protein: ${dailyMacros.protein.toFixed(
                  2,
                )}g\nCarbs: ${dailyMacros.carbs.toFixed(
                  2,
                )}g\nFat: ${dailyMacros.fat.toFixed(2)}g\nCalories: ${
                  dailyMacros.calories
                }`,
              );
            },
          }}>
          <RecipeListDisplay
            recipes={dayRecipes}
            selectedDayLabel={getSelectedDayLabel()}
            onRecipeSelect={() => {}} // Read-only view, no recipe selection
            emptyStateText={`No recipes scheduled for ${getSelectedDayLabel()}.`}
          />
        </Section>
      </ScrollView>

      <ShoppingListModal
        visible={showShoppingList}
        onClose={() => setShowShoppingList(false)}
        recipes={allRecipes}
      />

      <LoadingOverlay visible={loading} message="Loading..." />
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
  macroSummary: {
    alignItems: 'center',
    marginBottom: spacing.md,
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
