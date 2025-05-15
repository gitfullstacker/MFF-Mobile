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
import { format } from 'date-fns';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/forms/Button';
import { RecipePickerModal } from '../../components/modals/RecipePickerModal';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { usePlans } from '../../hooks/usePlans';
import { useRecipes } from '../../hooks/useRecipes';
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
  MealSchedule,
  ScheduledRecipe,
  CreateMealPlanRequest,
} from '../../types/plan';
import { RecipeCard } from '@/components/recipe/RecipeCard';

type CreateMealPlanNavigationProp = StackNavigationProp<
  MealPlanStackParamList,
  'CreateMealPlan'
>;

type CreateMealPlanRouteProp = RouteProp<
  MealPlanStackParamList,
  'CreateMealPlan'
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

const CreateMealPlanScreen: React.FC = () => {
  const navigation = useNavigation<CreateMealPlanNavigationProp>();
  const route = useRoute<CreateMealPlanRouteProp>();
  const { createPlan } = usePlans();
  const { fetchRecipes } = useRecipes();

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

    // Close the picker
    setShowRecipePicker(false);
  };

  // Function to remove a recipe from the schedule
  const handleRemoveRecipe = (dayKey: string, recipeId: string) => {
    const updatedSchedule = { ...schedule };
    const daySchedule = [...updatedSchedule[dayKey as keyof MealSchedule]];

    const newDaySchedule = daySchedule.filter(item => item.recipe !== recipeId);

    updatedSchedule[dayKey as keyof MealSchedule] = newDaySchedule;
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

      const planData: CreateMealPlanRequest = {
        name: planName,
        schedule,
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
    return schedule[dayKey as keyof MealSchedule].length;
  };

  // Render scheduled recipes for the selected day
  const renderScheduledRecipes = () => {
    const dayRecipes = schedule[selectedDay as keyof MealSchedule];

    if (dayRecipes.length === 0) {
      return (
        <View style={styles.emptyDayContainer}>
          <Text style={styles.emptyDayText}>
            No recipes scheduled for{' '}
            {DAYS.find(day => day.key === selectedDay)?.label}. Add recipes
            using the button below.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={dayRecipes.map(item => recipes[item.recipe]).filter(Boolean)}
        renderItem={({ item, index }) => (
          <View style={styles.recipeCardContainer}>
            <RecipeCard recipe={item} onPress={() => {}} />
          </View>
        )}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
      />
    );
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
          <View style={styles.mealsContainer}>{renderScheduledRecipes()}</View>

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
          <Button title="Save Meal Plan" onPress={handleSavePlan} fullWidth />
        </View>
      </ScrollView>

      <RecipePickerModal
        visible={showRecipePicker}
        onClose={() => setShowRecipePicker(false)}
        onSelect={handleRecipeSelect}
        selectedRecipes={schedule[selectedDay as keyof MealSchedule]
          .map(item => recipes[item.recipe])
          .filter(Boolean)}
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

export default CreateMealPlanScreen;
