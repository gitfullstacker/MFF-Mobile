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
  shadows,
  fontWeights,
} from '../../theme';
import { MealPlanStackParamList } from '../../navigation/types';
import { Recipe } from '../../types/recipe';
import { MealPlan, MealSchedule, ScheduledRecipe } from '../../types/plan';

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
  const { updatePlan, fetchPlan } = usePlans();

  const [planName, setPlanName] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>('su');
  const [schedule, setSchedule] = useState<MealSchedule>({
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
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(plan || null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [recipeMap, setRecipeMap] = useState<Record<string, Recipe>>({});
  const [dayRecipes, setDayRecipes] = useState<Recipe[]>([]);

  // Load the plan data on mount
  useEffect(() => {
    if (plan) {
      // Set initial state from plan
      setPlanName(plan.name);

      // We need to transform the schedule to match the expected structure
      // The backend populates recipe objects, but for updating we need just the IDs
      const simplifiedSchedule: MealSchedule = {
        su: [],
        mo: [],
        tu: [],
        we: [],
        th: [],
        fr: [],
        sa: [],
      };

      // Also build a map of recipe IDs to recipe objects for display
      const recipes: Record<string, Recipe> = {};

      DAYS.forEach(day => {
        const dayKey = day.key as keyof MealSchedule;

        if (plan.schedule[dayKey]) {
          plan.schedule[dayKey].forEach((item: ScheduledRecipe) => {
            if (item.recipe && typeof item.recipe !== 'string') {
              const recipeItem = item.recipe as Recipe;
              // Store the recipe object for display purposes
              recipes[recipeItem._id] = recipeItem;

              // Add to simplified schedule with just the ID
              simplifiedSchedule[dayKey].push({
                recipe: recipeItem._id,
                only_recipe: item.only_recipe,
              });
            } else if (typeof item.recipe === 'string') {
              // If it's just an ID, keep it as is
              simplifiedSchedule[dayKey].push(item);
            }
          });
        }
      });

      setSchedule(simplifiedSchedule);
      setRecipeMap(recipes);
      setInitialLoad(false);
      updateDayRecipes(simplifiedSchedule, selectedDay, recipes);
    } else if (planId) {
      // If no plan was passed but we have an ID, fetch it
      loadPlanData();
    }
  }, [plan, planId]);

  // Update day recipes when selected day changes
  useEffect(() => {
    if (!initialLoad) {
      updateDayRecipes(schedule, selectedDay, recipeMap);
    }
  }, [selectedDay, initialLoad]);

  // Function to update day recipes
  const updateDayRecipes = (
    currentSchedule: MealSchedule,
    day: string,
    recipes: Record<string, Recipe>,
  ) => {
    const daySchedule = currentSchedule[day as keyof MealSchedule];

    if (!Array.isArray(daySchedule)) {
      setDayRecipes([]);
      return;
    }

    const dayRecipesList: Recipe[] = [];
    daySchedule.forEach(item => {
      const recipeId =
        typeof item.recipe === 'string'
          ? item.recipe
          : (item.recipe as Recipe)._id;

      if (recipes[recipeId]) {
        dayRecipesList.push(recipes[recipeId]);
      }
    });

    setDayRecipes(dayRecipesList);
  };

  // Function to load plan data if needed
  const loadPlanData = async () => {
    setLoading(true);
    try {
      const loadedPlan = await fetchPlan(planId);
      setMealPlan(loadedPlan);

      if (loadedPlan) {
        setPlanName(loadedPlan.name);

        // Process schedule as above
        const simplifiedSchedule: MealSchedule = {
          su: [],
          mo: [],
          tu: [],
          we: [],
          th: [],
          fr: [],
          sa: [],
        };

        const recipes: Record<string, Recipe> = {};

        DAYS.forEach(day => {
          const dayKey = day.key as keyof MealSchedule;

          if (loadedPlan.schedule[dayKey]) {
            loadedPlan.schedule[dayKey].forEach((item: ScheduledRecipe) => {
              if (item.recipe && typeof item.recipe !== 'string') {
                const recipeItem = item.recipe as Recipe;
                recipes[recipeItem._id] = recipeItem;

                simplifiedSchedule[dayKey].push({
                  recipe: recipeItem._id,
                  only_recipe: item.only_recipe,
                });
              } else if (typeof item.recipe === 'string') {
                simplifiedSchedule[dayKey].push(item);
              }
            });
          }
        });

        setSchedule(simplifiedSchedule);
        setRecipeMap(recipes);
        updateDayRecipes(simplifiedSchedule, selectedDay, recipes);
      }
    } catch (error) {
      console.error('Error loading plan data:', error);
      Alert.alert('Error', 'Failed to load meal plan. Please try again.');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
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
    const daySchedule = [...updatedSchedule[selectedDay as keyof MealSchedule]];

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

    updatedSchedule[selectedDay as keyof MealSchedule] = daySchedule;
    setSchedule(updatedSchedule);

    // Update day recipes
    updateDayRecipes(updatedSchedule, selectedDay, updatedRecipeMap);

    // Close the picker
    setShowRecipePicker(false);
  };

  // Function to remove a recipe from the schedule
  const handleRemoveRecipe = (recipeId: string) => {
    const updatedSchedule = { ...schedule };
    const daySchedule = [...updatedSchedule[selectedDay as keyof MealSchedule]];

    const newDaySchedule = daySchedule.filter(item =>
      typeof item.recipe === 'string'
        ? item.recipe !== recipeId
        : (item.recipe as any)._id !== recipeId,
    );

    updatedSchedule[selectedDay as keyof MealSchedule] = newDaySchedule;
    setSchedule(updatedSchedule);

    // Update day recipes
    updateDayRecipes(updatedSchedule, selectedDay, recipeMap);
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

      const updatedPlan: Partial<MealPlan> = {
        name: planName,
        schedule,
      };

      await updatePlan(planId, updatedPlan);

      // Navigate back to meal plans list
      navigation.goBack();
    } catch (error) {
      console.error('Error updating meal plan:', error);
      Alert.alert('Error', 'Failed to update meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get recipe counts by day
  const getRecipeCountByDay = (dayKey: string) => {
    return schedule[dayKey as keyof MealSchedule].length;
  };

  if (initialLoad) {
    return <LoadingOverlay visible={true} message="Loading meal plan..." />;
  }

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
                  <RecipeCard recipe={item} onPress={() => {}} />
                </View>
              )}
              keyExtractor={item => item._id}
              scrollEnabled={false} // Since we're already in a ScrollView
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

        <View style={styles.saveButtonContainer}>
          <Button title="Save Changes" onPress={handleSavePlan} fullWidth />
        </View>
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
  recipeCardContainer: {
    marginBottom: spacing.md,
  },
  addRecipeButton: {
    marginBottom: spacing.md,
  },
  saveButtonContainer: {
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
});

export default EditMealPlanScreen;
