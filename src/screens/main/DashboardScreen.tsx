import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/Feather';
import { PageContainer } from '../../components/layout/PageContainer';
import { Section } from '../../components/layout/Section';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { MacroDisplay } from '../../components/recipe/MacroDisplay';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { useRecipes } from '../../hooks/useRecipes';
import { usePlans } from '../../hooks/usePlans';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
} from '../../theme';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Recipe } from '../../types/recipe';
import { PlanSchedule } from '../../types/plan';

type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  StackNavigationProp<RootStackParamList>
>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { user } = useAuth();
  const {
    recipes,
    loading: recipesLoading,
    fetchRecipes,
    toggleFavorite,
  } = useRecipes();
  const { currentWeekPlan, loading: plansLoading, fetchPlans } = usePlans();

  const [todaysMeals, setTodaysMeals] = useState<Recipe[]>([]);
  const [dailyMacros, setDailyMacros] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (currentWeekPlan) {
      calculateTodaysMeals();
    }
  }, [currentWeekPlan]);

  const loadDashboardData = async () => {
    await Promise.all([
      fetchRecipes({ sort: 'newest' }, true),
      fetchPlans(0, 1),
    ]);
  };

  const calculateTodaysMeals = () => {
    if (!currentWeekPlan) return;

    const daysMap: { [key: string]: keyof PlanSchedule } = {
      su: 'su',
      mo: 'mo',
      tu: 'tu',
      we: 'we',
      th: 'th',
      fr: 'fr',
      sa: 'sa',
    };

    const today = format(new Date(), 'EEEE').toLowerCase().slice(0, 2);
    const dayKey = daysMap[today];

    if (!dayKey) return;

    // This would need to be populated with actual recipe data
    // For now, just showing the structure
    setTodaysMeals([]);

    // Calculate daily macros based on today's meals
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCalories = 0;

    // This would calculate based on actual meal data
    setDailyMacros({
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      calories: totalCalories,
    });
  };

  const renderTodaysMeal = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() =>
        navigation.navigate('RecipeStack', {
          screen: 'RecipeDetail',
          params: { recipeId: item.slug },
        } as any)
      }>
      <RecipeCard recipe={item} onPress={() => {}} />
    </TouchableOpacity>
  );

  const renderRecentRecipe = ({ item }: { item: Recipe }) => (
    <View style={styles.recentRecipeCard}>
      <RecipeCard
        recipe={item}
        onPress={() =>
          navigation.navigate('RecipeStack', {
            screen: 'RecipeDetail',
            params: { recipeId: item.slug },
          } as any)
        }
        onFavoriteToggle={() => toggleFavorite(item._id)}
      />
    </View>
  );

  const navigateToMealPlans = () => {
    navigation.navigate('Meal Plans');
  };

  const navigateToRecipes = () => {
    navigation.navigate('Recipes');
  };

  const navigateToCreatePlan = () => {
    navigation.navigate('MealPlanStack', {
      screen: 'CreateMealPlan',
    } as any);
  };

  return (
    <PageContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.first_name || 'there'}! 👋
            </Text>
            <Text style={styles.date}>
              {format(new Date(), 'EEEE, MMMM d')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Account')}>
            <View style={styles.avatarContainer}>
              <Icon name="user" size={24} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Today's Plan */}
        <Section
          title="Today's Plan"
          action={
            currentWeekPlan
              ? { label: 'View All', onPress: navigateToMealPlans }
              : undefined
          }>
          {currentWeekPlan ? (
            <>
              {todaysMeals.length > 0 ? (
                <FlatList
                  data={todaysMeals}
                  renderItem={renderTodaysMeal}
                  keyExtractor={item => item._id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mealsContainer}
                />
              ) : (
                <Text style={styles.noMealsText}>
                  No meals planned for today
                </Text>
              )}

              <View style={styles.macroSummary}>
                <MacroDisplay
                  protein={dailyMacros.protein}
                  carbs={dailyMacros.carbs}
                  fat={dailyMacros.fat}
                  calories={dailyMacros.calories}
                  variant="circle"
                  size="medium"
                />
              </View>
            </>
          ) : (
            <EmptyState
              title="No meal plan for this week"
              description="Create a meal plan to track your daily nutrition"
              action={{
                label: 'Create Meal Plan',
                onPress: navigateToCreatePlan,
              }}
            />
          )}
        </Section>

        {/* Quick Actions */}
        <Section title="Quick Actions">
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToCreatePlan}>
              <View style={styles.actionIconContainer}>
                <Icon name="calendar" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Create Meal Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToRecipes}>
              <View style={styles.actionIconContainer}>
                <Icon name="book-open" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Browse Recipes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Downloads' as any)}>
              <View style={styles.actionIconContainer}>
                <Icon name="download" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>View Downloads</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Recent Recipes */}
        <Section
          title="Recent Recipes"
          action={{ label: 'View All', onPress: navigateToRecipes }}>
          {recipes.length > 0 ? (
            <FlatList
              data={recipes.slice(0, 6)}
              renderItem={renderRecentRecipe}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recipesContainer}
            />
          ) : (
            <EmptyState
              title="No recipes yet"
              description="Start exploring our collection of macro-friendly recipes"
              action={{
                label: 'Browse Recipes',
                onPress: navigateToRecipes,
              }}
            />
          )}
        </Section>

        {/* Weekly Progress */}
        <Section title="Weekly Progress">
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Macro Adherence</Text>
              <Text style={styles.progressPercentage}>85%</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: '85%' }]} />
            </View>

            <Text style={styles.progressText}>
              Great job! You're on track with your nutrition goals.
            </Text>
          </View>
        </Section>
      </ScrollView>

      <LoadingOverlay
        visible={recipesLoading || plansLoading}
        message="Loading dashboard..."
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  greeting: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
  },
  date: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealsContainer: {
    paddingRight: spacing.md,
  },
  mealCard: {
    marginRight: spacing.md,
  },
  noMealsText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  macroSummary: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: fontWeights.medium,
  },
  recipesContainer: {
    paddingRight: spacing.md,
  },
  recentRecipeCard: {
    marginRight: spacing.md,
  },
  progressCard: {
    backgroundColor: colors.gray[50],
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.medium,
  },
  progressPercentage: {
    ...typography.h5,
    color: colors.primary,
    fontWeight: fontWeights.bold,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
});

export default DashboardScreen;
