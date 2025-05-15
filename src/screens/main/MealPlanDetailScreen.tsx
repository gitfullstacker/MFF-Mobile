import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
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
import { usePlans } from '../../hooks/usePlans';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  fontWeights,
} from '../../theme';
import { MealPlanStackParamList } from '../../navigation/types';
import { MealPlan, MealSchedule, ScheduledRecipe } from '../../types/plan';
import { Recipe } from '@/types/recipe';

type MealPlanDetailNavigationProp = StackNavigationProp<
  MealPlanStackParamList,
  'MealPlanDetail'
>;

type MealPlanDetailRouteProp = RouteProp<
  MealPlanStackParamList,
  'MealPlanDetail'
>;

// Days of the week
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
  const { deletePlan, duplicatePlan, fetchPlan } = usePlans();

  const [selectedDay, setSelectedDay] = useState<string>('su');
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(plan || null);
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

  // Load the plan data on mount if needed
  useEffect(() => {
    if (!mealPlan) {
      loadPlanData();
    } else {
      // Calculate macros on initial load
      calculateMacros();
    }
  }, []);

  // Recalculate macros when selected day changes
  useEffect(() => {
    if (mealPlan) {
      calculateDailyMacros();
    }
  }, [selectedDay, mealPlan]);

  // Helper function to extract recipe ID from a scheduled recipe item
  const getRecipeId = (item: ScheduledRecipe): string => {
    if (typeof item.recipe === 'string') {
      return item.recipe;
    } else if (item.recipe && typeof item.recipe === 'object') {
      return (item.recipe as Recipe)._id;
    }
    // Fallback
    return '';
  };

  // Helper function to extract recipe object from a scheduled recipe item
  const getRecipeObject = (item: ScheduledRecipe): Recipe | null => {
    if (typeof item.recipe === 'string') {
      return null;
    } else if (item.recipe && typeof item.recipe === 'object') {
      return item.recipe as Recipe;
    }
    return null;
  };

  // Function to load plan data from API
  const loadPlanData = async () => {
    setLoading(true);
    try {
      const loadedPlan = await fetchPlan(planId);
      setMealPlan(loadedPlan);
      calculateMacros();
    } catch (error) {
      console.error('Error loading plan data:', error);
      Alert.alert(
        'Error',
        'Failed to load meal plan details. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate macros for the selected day and the whole week
  const calculateMacros = () => {
    if (!mealPlan) return;

    calculateDailyMacros();
    calculateWeeklyMacros();
  };

  // Calculate daily macros
  const calculateDailyMacros = () => {
    if (!mealPlan) return;

    const daySchedule = mealPlan.schedule[selectedDay as keyof MealSchedule];

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
      const daySchedule = mealPlan.schedule[dayKey as keyof MealSchedule];

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

    const daySchedule = mealPlan.schedule[dayKey as keyof MealSchedule];
    // Check if it's actually an array
    return Array.isArray(daySchedule) ? daySchedule.length : 0;
  };

  // Handle edit plan
  const handleEditPlan = () => {
    if (mealPlan) {
      navigation.navigate('EditMealPlan', {
        planId,
        plan: mealPlan,
      });
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

  // Handle share plan
  const handleSharePlan = async () => {
    if (!mealPlan) return;

    try {
      // Generate a text summary of the plan
      let planSummary = `${mealPlan.name}\n\n`;

      // Only process valid day keys
      const validDayKeys = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

      DAYS.forEach(day => {
        if (!validDayKeys.includes(day.key)) return;

        const daySchedule = mealPlan.schedule[day.key as keyof MealSchedule];

        // Skip if not an array or empty
        if (!Array.isArray(daySchedule) || daySchedule.length === 0) return;

        planSummary += `${day.label}:\n`;

        daySchedule.forEach((item: ScheduledRecipe) => {
          const recipe = getRecipeObject(item);
          if (recipe) {
            planSummary += `- ${recipe.name}\n`;
          }
        });

        planSummary += '\n';
      });

      // Add weekly totals
      planSummary += `Weekly Totals: ${weeklyMacros.calories} calories, ${weeklyMacros.protein}g protein, ${weeklyMacros.carbs}g carbs, ${weeklyMacros.fat}g fat\n\n`;
      planSummary += 'Created with Macro Friendly Food App';

      await Share.share({
        message: planSummary,
        title: mealPlan.name,
      });
    } catch (error) {
      console.error('Error sharing plan:', error);
      Alert.alert('Error', 'Failed to share meal plan. Please try again.');
    }
  };

  // Generate shopping list
  const handleGenerateShoppingList = () => {
    // This would be implemented to generate a shopping list based on the recipes
    Alert.alert(
      'Coming Soon',
      'Shopping list generation will be available in a future update.',
    );
  };

  // View recipe details
  const handleViewRecipe = (recipeId: string) => {
    navigation.navigate(
      'RecipeStack' as any,
      {
        screen: 'RecipeDetail',
        params: { recipeId },
      } as any,
    );
  };

  // Render scheduled recipes for the selected day
  const renderScheduledRecipes = () => {
    if (!mealPlan) return null;

    const daySchedule = mealPlan.schedule[selectedDay as keyof MealSchedule];

    // Check if it's actually an array
    if (!Array.isArray(daySchedule)) {
      return (
        <View style={styles.emptyDayContainer}>
          <Text style={styles.emptyDayText}>
            No recipes scheduled for{' '}
            {DAYS.find(day => day.key === selectedDay)?.label}.
          </Text>
        </View>
      );
    }

    if (daySchedule.length === 0) {
      return (
        <View style={styles.emptyDayContainer}>
          <Text style={styles.emptyDayText}>
            No recipes scheduled for{' '}
            {DAYS.find(day => day.key === selectedDay)?.label}.
          </Text>
        </View>
      );
    }

    return daySchedule.map((item: ScheduledRecipe, index) => {
      const recipeId = getRecipeId(item);
      const recipe = getRecipeObject(item);

      // If we couldn't extract a recipe object, show a loading state
      if (!recipe) {
        return (
          <View key={`${recipeId || index}`} style={styles.recipeItem}>
            <Text style={styles.recipeName}>Loading recipe...</Text>
          </View>
        );
      }

      return (
        <TouchableOpacity
          key={recipeId || index}
          style={styles.recipeItem}
          onPress={() => handleViewRecipe(recipeId)}>
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            <Text style={styles.recipeDetails}>
              {recipe.total_time} min • {recipe.nutrition.calories} cal
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.gray[400]} />
        </TouchableOpacity>
      );
    });
  };

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
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{mealPlan.name}</Text>
          <Text style={styles.planDate}>
            Created {format(parseISO(mealPlan.created_at), 'MMM d, yyyy')}
          </Text>
        </View>

        <Section title="Weekly Summary">
          <View style={styles.macroSummary}>
            <MacroDisplay
              protein={weeklyMacros.protein}
              carbs={weeklyMacros.carbs}
              fat={weeklyMacros.fat}
              calories={weeklyMacros.calories}
              variant="circle"
              size="medium"
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
            <Button
              title="Share Plan"
              onPress={handleSharePlan}
              variant="outline"
              size="small"
              icon={<Icon name="share-2" size={18} color={colors.primary} />}
              style={styles.actionButton}
            />
          </View>
        </Section>

        <Section title="Days">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.daysScrollView}>
            {DAYS.map(day => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  selectedDay === day.key && styles.selectedDayButton,
                ]}
                onPress={() => setSelectedDay(day.key)}>
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedDay === day.key && styles.selectedDayButtonText,
                  ]}>
                  {day.label.substring(0, 3)}
                </Text>
                {getRecipeCountByDay(day.key) > 0 && (
                  <View style={styles.recipeBadge}>
                    <Text style={styles.recipeBadgeText}>
                      {getRecipeCountByDay(day.key)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Section>

        <Section
          title={`${DAYS.find(day => day.key === selectedDay)?.label} Meals`}
          action={{
            label: 'Macros',
            onPress: () => {
              Alert.alert(
                'Daily Macros',
                `Protein: ${dailyMacros.protein}g\nCarbs: ${dailyMacros.carbs}g\nFat: ${dailyMacros.fat}g\nCalories: ${dailyMacros.calories}`,
              );
            },
          }}>
          <View style={styles.mealsContainer}>{renderScheduledRecipes()}</View>
        </Section>

        <Section>
          <View style={styles.planManagementContainer}>
            <Button
              title="Duplicate Plan"
              onPress={handleDuplicatePlan}
              variant="outline"
              icon={<Icon name="copy" size={18} color={colors.primary} />}
              style={styles.managementButton}
            />

            <Button
              title="Delete Plan"
              onPress={handleDeletePlan}
              variant="outline"
              textStyle={{ color: colors.semantic.error }}
              style={{ ...styles.managementButton, ...styles.deleteButton }}
              icon={
                <Icon name="trash-2" size={18} color={colors.semantic.error} />
              }
            />
          </View>
        </Section>
      </ScrollView>

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
  macroSummary: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  daysScrollView: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  selectedDayButton: {
    backgroundColor: colors.primary,
  },
  dayButtonText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: fontWeights.medium,
  },
  selectedDayButtonText: {
    color: colors.white,
  },
  recipeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.semantic.info,
    borderRadius: borderRadius.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: fontWeights.bold,
  },
  mealsContainer: {
    marginBottom: spacing.md,
  },
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
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.xs,
  },
  recipeDetails: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  planManagementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  managementButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  deleteButton: {
    borderColor: colors.semantic.error,
  },
});

export default MealPlanDetailScreen;
