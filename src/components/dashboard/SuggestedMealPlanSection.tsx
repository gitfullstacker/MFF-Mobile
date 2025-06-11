import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { RecipeCard } from '../recipe/RecipeCard';
import { SwipeIndicator } from '../ui/SwipeIndicator';
import { Button } from '../forms/Button';
import { DaySelector } from '../meal-plan/DaySelector';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { Recipe } from '../../types/recipe';
import { Plan, PlanSchedule, DayOfWeek } from '../../types/plan';

const { width: screenWidth } = Dimensions.get('window');

interface SuggestedMealPlanSectionProps {
  suggestedPlan?: Plan;
  onSavePlan?: (plan: Plan) => void;
  onToggleExpanded?: (expanded: boolean) => void;
  userPreferences?: {
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
    calorieTarget: number;
  };
}

// Mock data for demonstration
const mockSuggestedPlan: Plan = {
  _id: 'suggested-plan-1',
  user_id: 0,
  slug: 'suggested-healthy-week',
  name: 'Healthy Weekly Plan',
  schedule: {
    su: [
      {
        recipe: {
          _id: 'recipe1',
          name: 'Mediterranean Quinoa Bowl',
          total_time: 25,
          nutrition: {
            calories: 420,
            protein: 18.5,
            carbohydrates: 48.2,
            fat: 16.8,
          },
          rating: { average: 4.7 },
          image_url: 'https://picsum.photos/300/200?random=1',
        } as Recipe,
        only_recipe: false,
      },
      {
        recipe: {
          _id: 'recipe2',
          name: 'Grilled Salmon with Vegetables',
          total_time: 30,
          nutrition: {
            calories: 380,
            protein: 32.4,
            carbohydrates: 12.5,
            fat: 22.1,
          },
          rating: { average: 4.8 },
          image_url: 'https://picsum.photos/300/200?random=2',
        } as Recipe,
        only_recipe: false,
      },
    ],
    mo: [
      {
        recipe: {
          _id: 'recipe3',
          name: 'Chicken Stir Fry',
          total_time: 20,
          nutrition: {
            calories: 350,
            protein: 28.6,
            carbohydrates: 24.3,
            fat: 15.7,
          },
          rating: { average: 4.5 },
          image_url: 'https://picsum.photos/300/200?random=3',
        } as Recipe,
        only_recipe: false,
      },
      {
        recipe: {
          _id: 'recipe4',
          name: 'Lentil Soup',
          total_time: 40,
          nutrition: {
            calories: 280,
            protein: 16.2,
            carbohydrates: 42.1,
            fat: 6.8,
          },
          rating: { average: 4.6 },
          image_url: 'https://picsum.photos/300/200?random=4',
        } as Recipe,
        only_recipe: false,
      },
    ],
    tu: [
      {
        recipe: {
          _id: 'recipe5',
          name: 'Turkey and Avocado Wrap',
          total_time: 15,
          nutrition: {
            calories: 390,
            protein: 24.8,
            carbohydrates: 35.2,
            fat: 18.4,
          },
          rating: { average: 4.4 },
          image_url: 'https://picsum.photos/300/200?random=5',
        } as Recipe,
        only_recipe: false,
      },
    ],
    we: [
      {
        recipe: {
          _id: 'recipe6',
          name: 'Vegetarian Buddha Bowl',
          total_time: 35,
          nutrition: {
            calories: 410,
            protein: 19.3,
            carbohydrates: 52.7,
            fat: 14.9,
          },
          rating: { average: 4.9 },
          image_url: 'https://picsum.photos/300/200?random=6',
        } as Recipe,
        only_recipe: false,
      },
      {
        recipe: {
          _id: 'recipe7',
          name: 'Baked Cod with Sweet Potato',
          total_time: 45,
          nutrition: {
            calories: 320,
            protein: 26.1,
            carbohydrates: 28.4,
            fat: 11.2,
          },
          rating: { average: 4.7 },
          image_url: 'https://picsum.photos/300/200?random=7',
        } as Recipe,
        only_recipe: false,
      },
    ],
    th: [
      {
        recipe: {
          _id: 'recipe8',
          name: 'Beef and Broccoli Stir Fry',
          total_time: 25,
          nutrition: {
            calories: 360,
            protein: 31.5,
            carbohydrates: 18.6,
            fat: 19.3,
          },
          rating: { average: 4.6 },
          image_url: 'https://picsum.photos/300/200?random=8',
        } as Recipe,
        only_recipe: false,
      },
    ],
    fr: [
      {
        recipe: {
          _id: 'recipe9',
          name: 'Shrimp Pasta Primavera',
          total_time: 30,
          nutrition: {
            calories: 440,
            protein: 27.8,
            carbohydrates: 45.3,
            fat: 17.6,
          },
          rating: { average: 4.8 },
          image_url: 'https://picsum.photos/300/200?random=9',
        } as Recipe,
        only_recipe: false,
      },
      {
        recipe: {
          _id: 'recipe10',
          name: 'Greek Salad with Chickpeas',
          total_time: 15,
          nutrition: {
            calories: 290,
            protein: 12.4,
            carbohydrates: 32.1,
            fat: 14.7,
          },
          rating: { average: 4.5 },
          image_url: 'https://picsum.photos/300/200?random=10',
        } as Recipe,
        only_recipe: false,
      },
    ],
    sa: [
      {
        recipe: {
          _id: 'recipe11',
          name: 'BBQ Chicken with Quinoa Salad',
          total_time: 40,
          nutrition: {
            calories: 485,
            protein: 35.2,
            carbohydrates: 38.9,
            fat: 21.4,
          },
          rating: { average: 4.9 },
          image_url: 'https://picsum.photos/300/200?random=11',
        } as Recipe,
        only_recipe: false,
      },
    ],
  },
  removed_ingredient_ids: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DAYS = [
  { key: 'su', label: 'Sunday' },
  { key: 'mo', label: 'Monday' },
  { key: 'tu', label: 'Tuesday' },
  { key: 'we', label: 'Wednesday' },
  { key: 'th', label: 'Thursday' },
  { key: 'fr', label: 'Friday' },
  { key: 'sa', label: 'Saturday' },
];

const mealCardWidth = screenWidth * 0.75;

export const SuggestedMealPlanSection: React.FC<
  SuggestedMealPlanSectionProps
> = ({
  suggestedPlan = mockSuggestedPlan,
  onSavePlan,
  onToggleExpanded,
  userPreferences = {
    proteinTarget: 150,
    carbsTarget: 200,
    fatTarget: 80,
    calorieTarget: 2000,
  },
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('su');
  const [isSaving, setIsSaving] = useState(false);

  // Refs for scroll tracking
  const recipesScrollRef = useRef<FlatList>(null);
  const recipesScrollX = useRef(new Animated.Value(0)).current;

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggleExpanded?.(newExpanded);
  };

  const handleSavePlan = async () => {
    if (!suggestedPlan || isSaving) return;

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSavePlan?.(suggestedPlan);
    } catch (error) {
      console.error('Error saving plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get recipe count by day
  const getRecipeCountByDay = (dayKey: string) => {
    const daySchedule = suggestedPlan.schedule[dayKey as keyof PlanSchedule];
    return Array.isArray(daySchedule) ? daySchedule.length : 0;
  };

  // Get selected day recipes
  const getSelectedDayRecipes = (): Recipe[] => {
    const daySchedule =
      suggestedPlan.schedule[selectedDay as keyof PlanSchedule];
    if (!Array.isArray(daySchedule)) return [];

    return daySchedule
      .map(item => (typeof item.recipe === 'string' ? null : item.recipe))
      .filter((recipe): recipe is Recipe => recipe !== null);
  };

  const selectedDayRecipes = getSelectedDayRecipes();

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <View style={styles.recipeCardContainer}>
      <RecipeCard
        recipe={item}
        onPress={() => {
          // Handle recipe detail navigation
          console.log('Navigate to recipe:', item._id);
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.8}>
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

      {/* Content */}
      {isExpanded && (
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
              days={DAYS}
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
