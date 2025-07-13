import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, ScrollView, Alert, View } from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/forms/Button';
import { RecipePickerModal } from '../../components/modals/RecipePickerModal';
import { DuplicateRecipeModal } from '../../components/modals/DuplicateRecipeModal';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { DaySelector, DayOption } from '../../components/meal-plan/DaySelector';
import { RecipeListDisplay } from '../../components/meal-plan/RecipeListDisplay';
import { MealPlanFormHeader } from '../../components/meal-plan/MealPlanFormHeader';
import { usePlans } from '../../hooks/usePlans';
import { Recipe } from '../../types/recipe';
import {
  Plan,
  PlanSchedule,
  ScheduledRecipe,
  DAYS_OF_WEEK,
} from '../../types/plan';
import { MealPlanStackParamList } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';
import { spacing } from '../../theme';

type EditMealPlanNavigationProp = StackNavigationProp<
  MealPlanStackParamList,
  'EditMealPlan'
>;

type EditMealPlanRouteProp = RouteProp<MealPlanStackParamList, 'EditMealPlan'>;

// Days of the week
const DAYS: DayOption[] = [
  { key: 'su', label: 'Sunday' },
  { key: 'mo', label: 'Monday' },
  { key: 'tu', label: 'Tuesday' },
  { key: 'we', label: 'Wednesday' },
  { key: 'th', label: 'Thursday' },
  { key: 'fr', label: 'Friday' },
  { key: 'sa', label: 'Saturday' },
];

const MealPlanEditScreen: React.FC = () => {
  const navigation = useNavigation<EditMealPlanNavigationProp>();
  const route = useRoute<EditMealPlanRouteProp>();
  const { planId } = route.params;
  const { toggleFavorite } = useFavorites();
  const { updatePlan, fetchPlan } = usePlans();

  // Refs to store the latest state values for navigation listener
  const latestPlanNameRef = useRef('');
  const latestScheduleRef = useRef<PlanSchedule>({
    su: [],
    mo: [],
    tu: [],
    we: [],
    th: [],
    fr: [],
    sa: [],
  });

  // Local state
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
  const [planLoading, setPlanLoading] = useState(false);
  const [recipeMap, setRecipeMap] = useState<Record<string, Recipe>>({});
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);

  // Duplicate recipe dialog state
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateRecipeInfo, setDuplicateRecipeInfo] = useState<{
    recipe: Recipe;
    existingDays: string[];
  } | null>(null);

  // Track changes for unsaved changes dialog
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialPlanName, setInitialPlanName] = useState('');
  const [initialSchedule, setInitialSchedule] = useState<PlanSchedule>({
    su: [],
    mo: [],
    tu: [],
    we: [],
    th: [],
    fr: [],
    sa: [],
  });

  // Update refs whenever state changes to ensure navigation listener has latest values
  useEffect(() => {
    latestPlanNameRef.current = planName;
  }, [planName]);

  useEffect(() => {
    latestScheduleRef.current = schedule;
  }, [schedule]);

  // Enhanced plan name change handler with immediate ref update
  const handlePlanNameChange = useCallback(
    (text: string) => {
      setPlanName(text);
      latestPlanNameRef.current = text;

      // Force immediate change detection
      setTimeout(() => {
        const scheduleChanged =
          JSON.stringify(latestScheduleRef.current) !==
          JSON.stringify(initialSchedule);
        const nameChanged = text !== initialPlanName;
        setHasUnsavedChanges(scheduleChanged || nameChanged);
      }, 0);
    },
    [initialPlanName, initialSchedule],
  );

  // Fetch plan data when component mounts or planId changes
  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) return;

      try {
        setPlanLoading(true);
        const plan = await fetchPlan(planId);
        setCurrentPlan(plan);
      } catch (error) {
        console.error('Error fetching plan:', error);
        Alert.alert('Error', 'Failed to load meal plan. Please try again.');
        navigation.goBack();
      } finally {
        setPlanLoading(false);
      }
    };

    loadPlan();
  }, [planId, fetchPlan, navigation]);

  // Initialize form data when plan is loaded
  useEffect(() => {
    if (currentPlan) {
      // Set initial state from plan
      setPlanName(currentPlan.name);
      setInitialPlanName(currentPlan.name);
      latestPlanNameRef.current = currentPlan.name;

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
        const daySchedule = currentPlan.schedule[dayInfo.value];
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
      setInitialSchedule(cleanSchedule);
      latestScheduleRef.current = cleanSchedule;
      setRecipeMap(recipes);
    }
  }, [currentPlan]);

  // Track changes to detect unsaved changes with refs for accuracy
  useEffect(() => {
    if (!currentPlan) return;

    const scheduleChanged =
      JSON.stringify(schedule) !== JSON.stringify(initialSchedule);
    const nameChanged = planName !== initialPlanName;
    setHasUnsavedChanges(scheduleChanged || nameChanged);
  }, [planName, schedule, initialPlanName, initialSchedule, currentPlan]);

  // Enhanced change detection function for navigation listener
  const checkForUnsavedChanges = useCallback(() => {
    const currentSchedule = latestScheduleRef.current;
    const currentPlanName = latestPlanNameRef.current;

    const scheduleChanged =
      JSON.stringify(currentSchedule) !== JSON.stringify(initialSchedule);
    const nameChanged = currentPlanName !== initialPlanName;

    return scheduleChanged || nameChanged;
  }, [initialSchedule, initialPlanName]);

  // Handle back button and navigation prevention with improved change detection
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', e => {
        // Use the latest values from refs instead of state
        const hasChanges = checkForUnsavedChanges();

        if (!hasChanges || loading) {
          return;
        }

        e.preventDefault();

        Alert.alert(
          'Unsaved Changes',
          'You have unsaved changes. Do you want to save before leaving?',
          [
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => navigation.dispatch(e.data.action),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Save',
              onPress: () => handleSaveAndExit(),
            },
          ],
        );
      });

      return unsubscribe;
    }, [navigation, loading, checkForUnsavedChanges]),
  );

  // Function to open recipe picker
  const handleAddRecipe = () => {
    setShowRecipePicker(true);
  };

  // Function to handle recipe selection from the picker
  const handleRecipeSelect = (recipe: Recipe) => {
    // Check if recipe exists in other days
    const existingDays: string[] = [];

    Object.keys(schedule).forEach(dayKey => {
      if (dayKey !== selectedDay) {
        const daySchedule = schedule[dayKey as keyof PlanSchedule];
        const hasRecipe = daySchedule.some(item => item.recipe === recipe._id);
        if (hasRecipe) {
          const dayLabel =
            DAYS.find(day => day.key === dayKey)?.label || dayKey;
          existingDays.push(dayLabel);
        }
      }
    });

    // If recipe exists in other days, show duplicate dialog
    if (existingDays.length > 0) {
      setShowRecipePicker(false); // Hide recipe picker modal
      setDuplicateRecipeInfo({ recipe, existingDays });
      setShowDuplicateDialog(true);
      return;
    }

    // If no duplicates, add normally
    addRecipeToSchedule(recipe, false);
  };

  // Enhanced function to add recipe to schedule with immediate ref update
  const addRecipeToSchedule = useCallback(
    (recipe: Recipe, onlyRecipe: boolean) => {
      // Store the recipe object for display purposes
      const updatedRecipeMap = {
        ...recipeMap,
        [recipe._id]: recipe,
      };
      setRecipeMap(updatedRecipeMap);

      const newScheduledRecipe: ScheduledRecipe = {
        recipe: recipe._id,
        only_recipe: onlyRecipe,
      };

      // Update the schedule
      const updatedSchedule = { ...schedule };
      const daySchedule = [
        ...updatedSchedule[selectedDay as keyof PlanSchedule],
      ];

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

      // Update both state and ref immediately
      setSchedule(updatedSchedule);
      latestScheduleRef.current = updatedSchedule;

      // Force immediate change detection
      setTimeout(() => {
        const scheduleChanged =
          JSON.stringify(updatedSchedule) !== JSON.stringify(initialSchedule);
        const nameChanged = latestPlanNameRef.current !== initialPlanName;
        setHasUnsavedChanges(scheduleChanged || nameChanged);
      }, 0);
    },
    [recipeMap, schedule, selectedDay, initialSchedule, initialPlanName],
  );

  // Handle duplicate recipe dialog actions
  const handleDuplicateRecipeAction = (
    action: 'cancel' | 'with-ingredients' | 'only-recipe',
  ) => {
    if (!duplicateRecipeInfo) return;

    if (action === 'cancel') {
      setDuplicateRecipeInfo(null);
      setShowRecipePicker(true); // Show recipe picker again
      return;
    }

    const onlyRecipe = action === 'only-recipe';
    addRecipeToSchedule(duplicateRecipeInfo.recipe, onlyRecipe);
    setDuplicateRecipeInfo(null);
  };

  // Function to save the updated meal plan
  const handleSavePlan = async () => {
    // Use latest values from refs to ensure we have the most current data
    const currentPlanName = latestPlanNameRef.current;
    const currentSchedule = latestScheduleRef.current;

    if (!currentPlanName.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter a name for your meal plan.',
      );
      return;
    }

    try {
      setLoading(true);

      // Convert schedule to the format expected by the API
      const cleanSchedule: any = {};
      Object.keys(currentSchedule).forEach(day => {
        cleanSchedule[day] = currentSchedule[day as keyof PlanSchedule].map(
          item => ({
            recipe:
              typeof item.recipe === 'object'
                ? (item.recipe as Recipe)._id
                : item.recipe,
            only_recipe: item.only_recipe,
          }),
        );
      });

      const planData = {
        name: currentPlanName,
        schedule: cleanSchedule,
        removed_ingredient_ids: [],
      };

      await updatePlan(planId, planData);

      // Clear unsaved changes flag
      setHasUnsavedChanges(false);

      // Navigate back to meal plan details
      navigation.goBack();
    } catch (error) {
      console.error('Error updating meal plan:', error);
      Alert.alert('Error', 'Failed to update meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to save and exit (for unsaved changes dialog)
  const handleSaveAndExit = async () => {
    await handleSavePlan();
  };

  // Get recipe counts by day
  const getRecipeCountByDay = (dayKey: string) => {
    return schedule[dayKey as keyof PlanSchedule].length;
  };

  // Get the current day's recipes for display
  const getCurrentDayRecipes = (): Recipe[] => {
    const daySchedule = schedule[selectedDay as keyof PlanSchedule];

    if (!Array.isArray(daySchedule)) {
      return [];
    }

    const recipes: Recipe[] = [];
    daySchedule.forEach(item => {
      const recipeId =
        typeof item.recipe === 'string' ? item.recipe : item.recipe._id;
      if (recipeMap[recipeId]) {
        recipes.push(recipeMap[recipeId]);
      }
    });

    return recipes;
  };

  // Get the selected day label
  const getSelectedDayLabel = (): string => {
    return DAYS.find(day => day.key === selectedDay)?.label || 'Selected Day';
  };

  // Show loading if plan is being fetched
  if (planLoading || !currentPlan) {
    return <LoadingOverlay message="Loading meal plan..." />;
  }

  return (
    <PageContainer safeArea={false}>
      <Header title="Edit Meal Plan" showBack={true} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}>
        {/* Plan Name Input */}
        <Section>
          <Input
            label="Plan Name"
            placeholder="Enter a name for your meal plan"
            value={planName}
            onChangeText={handlePlanNameChange}
          />
        </Section>

        {/* Day Selection */}
        <Section title="Days">
          <DaySelector
            days={DAYS}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
            getRecipeCountByDay={getRecipeCountByDay}
          />
        </Section>

        {/* Meals Section with Header */}
        <Section>
          <MealPlanFormHeader
            selectedDayLabel={getSelectedDayLabel()}
            onAddRecipe={handleAddRecipe}
          />

          <RecipeListDisplay
            recipes={getCurrentDayRecipes()}
            showSelectionIcon
            selectedDayLabel={getSelectedDayLabel()}
            onRecipeSelect={handleRecipeSelect}
            onRecipeFavorite={toggleFavorite}
          />
        </Section>
      </ScrollView>

      <RecipePickerModal
        visible={showRecipePicker && !showDuplicateDialog}
        onClose={() => setShowRecipePicker(false)}
        onSelect={handleRecipeSelect}
        selectedRecipes={getCurrentDayRecipes()}
      />

      {/* Duplicate Recipe Dialog */}
      <DuplicateRecipeModal
        visible={showDuplicateDialog}
        onClose={() => setShowDuplicateDialog(false)}
        recipe={duplicateRecipeInfo?.recipe || null}
        existingDays={duplicateRecipeInfo?.existingDays || []}
        onAction={handleDuplicateRecipeAction}
      />

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <Button
          title="Save Changes"
          onPress={handleSavePlan}
          loading={loading}
          disabled={loading}
        />
      </View>

      {loading && <LoadingOverlay message="Saving meal plan..." />}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  saveContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});

export default MealPlanEditScreen;
