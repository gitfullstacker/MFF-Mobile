import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
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
  PlanSchedule,
  ScheduledRecipe,
  CreatePlanRequest,
  DAYS_OF_WEEK,
} from '../../types/plan';
import { MealPlanStackParamList } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';
import { spacing } from '../../theme';

type CreateMealPlanNavigationProp = StackNavigationProp<
  MealPlanStackParamList,
  'CreateMealPlan'
>;

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

const MealPlanCreateScreen: React.FC = () => {
  const navigation = useNavigation<CreateMealPlanNavigationProp>();
  const { toggleFavorite } = useFavorites();
  const { createPlan } = usePlans();

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
  const [recipes, setRecipes] = useState<Record<string, Recipe>>({});

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

  useEffect(() => {
    // Set default plan name
    const defaultName = `Meal Plan - ${format(new Date(), 'MMMM d')}`;
    setPlanName(defaultName);
    setInitialPlanName(defaultName);
  }, []);

  // Track changes to detect unsaved changes
  useEffect(() => {
    const scheduleChanged =
      JSON.stringify(schedule) !== JSON.stringify(initialSchedule);
    const nameChanged = planName !== initialPlanName;
    setHasUnsavedChanges(scheduleChanged || nameChanged);
  }, [planName, schedule, initialPlanName, initialSchedule]);

  // Handle back button and navigation prevention
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', e => {
        if (!hasUnsavedChanges || loading) {
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
    }, [navigation, hasUnsavedChanges, loading]),
  );

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

  // Function to add recipe to schedule
  const addRecipeToSchedule = (recipe: Recipe, onlyRecipe: boolean) => {
    // Keep track of recipes for display
    setRecipes({
      ...recipes,
      [recipe._id]: recipe,
    });

    const newScheduledRecipe: ScheduledRecipe = {
      recipe: recipe._id,
      only_recipe: onlyRecipe,
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
  };

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

  // Function to save the meal plan
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

      const planData: CreatePlanRequest = {
        name: planName,
        schedule: cleanSchedule,
        removed_ingredient_ids: [],
      };

      await createPlan(planData);

      // Clear unsaved changes flag
      setHasUnsavedChanges(false);

      // Navigate back to meal plans list
      navigation.goBack();
    } catch (error) {
      console.error('Error creating meal plan:', error);
      Alert.alert('Error', 'Failed to create meal plan. Please try again.');
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
    const dayRecipes = schedule[selectedDay as keyof PlanSchedule];
    return dayRecipes
      .map(item => recipes[item.recipe as string])
      .filter(Boolean);
  };

  // Get the selected day label
  const getSelectedDayLabel = (): string => {
    return DAYS.find(day => day.key === selectedDay)?.label || 'Selected Day';
  };

  return (
    <PageContainer safeArea={false}>
      <Header title="Create Meal Plan" showBack={true} />

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
            onChangeText={setPlanName}
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
          title="Create Meal Plan"
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

export default MealPlanCreateScreen;
