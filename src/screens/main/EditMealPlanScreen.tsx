import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/forms/Button';
import { RecipePickerModal } from '../../components/modals/RecipePickerModal';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { usePlans } from '../../hooks/usePlans';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
} from '../../theme';
import { MealPlanStackParamList } from '../../navigation/types';
import { Recipe } from '../../types/recipe';
import {
  Plan,
  PlanSchedule,
  ScheduledRecipe,
  DAYS_OF_WEEK,
} from '../../types/plan';

type EditMealPlanNavigationProp = StackNavigationProp<
  MealPlanStackParamList,
  'EditMealPlan'
>;

type EditMealPlanRouteProp = RouteProp<MealPlanStackParamList, 'EditMealPlan'>;

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

const EditMealPlanScreen: React.FC = () => {
  const navigation = useNavigation<EditMealPlanNavigationProp>();
  const route = useRoute<EditMealPlanRouteProp>();
  const { planId, plan } = route.params;
  const { updatePlan } = usePlans();

  const [planName, setPlanName] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>('su');
  const [schedule, setSchedule] = useState<PlanSchedule>({
    su: [],
    mo: [],
    tu: [],
    we: [],
    th: [],
    fr: [],
    sa: [],
  });
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipeMap, setRecipeMap] = useState<Record<string, Recipe>>({});
  const [dayRecipes, setDayRecipes] = useState<Recipe[]>([]);

  // Use plan from route params
  useEffect(() => {
    if (plan) {
      const mealPlan = plan;

      // Set initial state from plan
      setPlanName(mealPlan.name);

      // Restructure schedule to clean format
      const cleanSchedule: PlanSchedule = {
        su: [],
        mo: [],
        tu: [],
        we: [],
        th: [],
        fr: [],
        sa: [],
      };

      // Build a map of recipe IDs to recipe objects for display
      const recipes: Record<string, Recipe> = {};

      DAYS_OF_WEEK.forEach(dayInfo => {
        const daySchedule = mealPlan.schedule[dayInfo.value];
        if (Array.isArray(daySchedule)) {
          daySchedule.forEach((item: ScheduledRecipe) => {
            if (item.recipe && typeof item.recipe === 'object') {
              const recipeItem = item.recipe as Recipe;
              // Store the recipe object for display purposes
              recipes[recipeItem._id] = recipeItem;

              // Add to clean schedule with just the ID
              cleanSchedule[dayInfo.value].push({
                recipe: recipeItem._id,
                only_recipe: item.only_recipe,
              });
            } else if (typeof item.recipe === 'string') {
              // If it's just an ID, keep it as is
              cleanSchedule[dayInfo.value].push({
                recipe: item.recipe,
                only_recipe: item.only_recipe,
              });
            }
          });
        }
      });

      setSchedule(cleanSchedule);
      setRecipeMap(recipes);
      updateDayRecipes(cleanSchedule, selectedDay, recipes);
    } else {
      // Fallback: This shouldn't happen in normal flow
      console.warn(
        'No plan provided in params. This should not happen in normal flow.',
      );
    }
  }, [plan]);

  // Update day recipes when selected day changes
  useEffect(() => {
    updateDayRecipes(schedule, selectedDay, recipeMap);
  }, [selectedDay, schedule, recipeMap]);

  // Function to update day recipes
  const updateDayRecipes = (
    currentSchedule: PlanSchedule,
    day: string,
    recipes: Record<string, Recipe>,
  ) => {
    const daySchedule = currentSchedule[day as keyof PlanSchedule];

    if (!Array.isArray(daySchedule)) {
      setDayRecipes([]);
      return;
    }

    const dayRecipesList: Recipe[] = [];
    daySchedule.forEach(item => {
      const recipeId =
        typeof item.recipe === 'string' ? item.recipe : item.recipe._id;

      if (recipes[recipeId]) {
        dayRecipesList.push(recipes[recipeId]);
      }
    });

    setDayRecipes(dayRecipesList);
  };

  // Function to open recipe picker
  const handleAddRecipe = () => {
    setShowRecipePicker(true);
  };

  // Function to handle recipe selection from the picker
  const handleRecipeSelect = (recipe: Recipe) => {
    // Store the recipe object for display purposes
    const updatedRecipeMap = {
      ...recipeMap,
      [recipe._id]: recipe,
    };
    setRecipeMap(updatedRecipeMap);

    const newScheduledRecipe: ScheduledRecipe = {
      recipe: recipe._id,
      only_recipe: false,
    };

    // Update the schedule
    const updatedSchedule = { ...schedule };
    const daySchedule = [...updatedSchedule[selectedDay as keyof PlanSchedule]];

    // Check if we already have this recipe in this slot
    const existingIndex = daySchedule.findIndex(
      item => item.recipe === recipe._id,
    );

    if (existingIndex >= 0) {
      // Recipe already exists, remove it (toggle behavior)
      daySchedule.splice(existingIndex, 1);
    } else {
      // Add the new recipe
      daySchedule.push(newScheduledRecipe);
    }

    updatedSchedule[selectedDay as keyof PlanSchedule] = daySchedule;
    setSchedule(updatedSchedule);

    // Update day recipes
    updateDayRecipes(updatedSchedule, selectedDay, updatedRecipeMap);
  };

  // Function to save the updated meal plan
  const handleSavePlan = async () => {
    if (!planName.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter a name for your meal plan.',
      );
      return;
    }

    // Check if any days have recipes scheduled
    const hasRecipes = Object.values(schedule).some(day => day.length > 0);

    if (!hasRecipes) {
      Alert.alert(
        'Empty Plan',
        'Please add at least one recipe to your meal plan.',
      );
      return;
    }

    try {
      setLoading(true);

      // Restructure schedule to clean format (remove any _id fields)
      const cleanSchedule: PlanSchedule = {
        su: [],
        mo: [],
        tu: [],
        we: [],
        th: [],
        fr: [],
        sa: [],
      };

      // Copy schedule data in clean format
      DAYS_OF_WEEK.forEach(dayInfo => {
        const daySchedule = schedule[dayInfo.value];
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

      const updatedPlanData: Partial<Plan> = {
        name: planName,
        schedule: cleanSchedule,
      };

      const updatedPlan = await updatePlan(planId, updatedPlanData);

      // Navigate back to detail screen with updated plan data
      navigation.navigate('MealPlanDetail', {
        planId,
        plan: updatedPlan,
      });
    } catch (error) {
      console.error('Error updating meal plan:', error);
      Alert.alert('Error', 'Failed to update meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get recipe counts by day
  const getRecipeCountByDay = (dayKey: string) => {
    return schedule[dayKey as keyof PlanSchedule].length;
  };

  return (
    <PageContainer safeArea={false}>
      <Header
        title="Edit Meal Plan"
        showBack={true}
        rightAction={{
          icon: 'check',
          onPress: handleSavePlan,
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Section>
          <Input
            label="Plan Name"
            placeholder="Enter a name for your meal plan"
            value={planName}
            onChangeText={setPlanName}
          />
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
          title={`${DAYS.find(day => day.key === selectedDay)?.label} Meals`}>
          {dayRecipes.length === 0 ? (
            <View style={styles.emptyDayContainer}>
              <Text style={styles.emptyDayText}>
                No recipes scheduled for{' '}
                {DAYS.find(day => day.key === selectedDay)?.label}. Add recipes
                using the button below.
              </Text>
            </View>
          ) : (
            <FlatList
              data={dayRecipes}
              renderItem={({ item }) => (
                <View style={styles.recipeCardContainer}>
                  <RecipeCard
                    recipe={item}
                    showSelectionIcon
                    isAdded
                    onRemoveClick={handleRecipeSelect}
                    onPress={() => {}}
                  />
                </View>
              )}
              keyExtractor={item => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
            />
          )}

          <Button
            title="Add Recipe"
            onPress={handleAddRecipe}
            variant="primary"
            size="medium"
            icon={<Icon name="plus" size={18} color={colors.white} />}
            style={styles.addRecipeButton}
          />
        </Section>
      </ScrollView>

      <RecipePickerModal
        visible={showRecipePicker}
        onClose={() => setShowRecipePicker(false)}
        onSelect={handleRecipeSelect}
        selectedRecipes={dayRecipes}
      />

      <LoadingOverlay visible={loading} message="Saving meal plan..." />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  daysScrollView: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
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
  listContainer: {
    paddingBottom: spacing.lg,
  },
  recipeCardContainer: {
    marginBottom: spacing.md,
  },
  addRecipeButton: {
    marginBottom: spacing.md,
  },
});

export default EditMealPlanScreen;
