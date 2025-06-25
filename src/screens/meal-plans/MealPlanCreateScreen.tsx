import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { Input } from '../../components/forms/Input';
import { RecipePickerModal } from '../../components/modals/RecipePickerModal';
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

  useEffect(() => {
    // Set default plan name
    setPlanName(`Meal Plan - ${format(new Date(), 'MMMM d')}`);
  }, []);

  // Function to open recipe picker
  const handleAddRecipe = () => {
    setShowRecipePicker(true);
  };

  // Function to handle recipe selection from the picker
  const handleRecipeSelect = (recipe: Recipe) => {
    // Keep track of recipes for display
    setRecipes({
      ...recipes,
      [recipe._id]: recipe,
    });

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

      // Navigate back to meal plans list
      navigation.goBack();
    } catch (error) {
      console.error('Error creating meal plan:', error);
      Alert.alert('Error', 'Failed to create meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <Header
        title="Create Meal Plan"
        showBack={true}
        rightAction={{
          icon: 'check',
          onPress: handleSavePlan,
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          />
        </Section>
      </ScrollView>

      <RecipePickerModal
        visible={showRecipePicker}
        onClose={() => setShowRecipePicker(false)}
        onSelect={handleRecipeSelect}
        selectedRecipes={getCurrentDayRecipes()}
      />

      <LoadingOverlay visible={loading} message="Saving meal plan..." />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MealPlanCreateScreen;
