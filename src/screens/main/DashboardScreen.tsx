import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
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
  shadows,
} from '../../theme';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Recipe } from '../../types/recipe';
import { Plan, PlanSchedule } from '../../types/plan';
import { RECIPE_CATEGORIES } from '@/constants';

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
  const { plans, loading: plansLoading, fetchPlans } = usePlans();

  const [activePlans, setActivePlans] = useState<Plan[]>([]);
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
    setActivePlans(plans);
    calculateTodaysMeals();
  }, [plans]);

  const loadDashboardData = async () => {
    await Promise.all([
      fetchRecipes({ sort: 'newest' }, true),
      fetchPlans(0, 1),
    ]);
  };

  const calculateTodaysMeals = () => {
    if (!plans) return;

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

  const renderRecipeCategory = ({
    item,
  }: {
    item: {
      id: number;
      name: string;
      slug: string;
      icon: string;
    };
  }) => (
    <View style={styles.recentRecipeCard}>
      <TouchableOpacity
        key={item.id}
        style={styles.categoryButton}
        onPress={() => navigateToCategory(item.name)}>
        <View style={styles.categoryIcon}>
          <Icon name={item.icon} size={18} color={colors.primary} />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
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

  const navigateToPlanDetail = (plan: Plan) => {
    navigation.navigate('MealPlanStack', {
      screen: 'MealPlanDetail',
      params: { planId: plan._id, plan },
    } as any);
  };

  const navigateToCategory = (category: string) => {
    // Navigation code to category
    console.log('Navigate to category', category);
  };

  return (
    <PageContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.first_name || 'there'}!
          </Text>
          <Text style={styles.welcomeSubtext}>What are you cooking today?</Text>
        </View>

        {/* Active Meal Plan Card */}
        <View style={styles.planCardContainer}>
          {activePlans[0] ? (
            <TouchableOpacity
              style={styles.planCard}
              onPress={() => navigateToPlanDetail(activePlans[0])}
              activeOpacity={0.9}>
              <Image
                source={require('../../../assets/images/plan-placeholder.jpg')}
                style={styles.planImage}
                resizeMode="cover"
              />
              <View style={styles.planOverlay} />
              <View style={styles.planContent}>
                <View>
                  <Text style={styles.planTitle}>Active Meal Plan</Text>
                  <Text style={styles.planName}>{activePlans[0].name}</Text>
                  <View style={styles.planDetails}>
                    <Icon name="book-open" size={14} color={colors.white} />
                    <Text style={styles.planDetailText}>
                      {Object.values(activePlans[0].schedule).flat().length}{' '}
                      recipes
                    </Text>
                  </View>
                </View>
                <View style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Plan</Text>
                  <Icon name="chevron-right" size={16} color={colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.planCardEmpty}>
              <Icon name="calendar" size={32} color={colors.gray[400]} />
              <Text style={styles.emptyPlanText}>No active meal plan</Text>
              <TouchableOpacity
                style={styles.createPlanButton}
                onPress={navigateToCreatePlan}>
                <Text style={styles.createPlanButtonText}>Create Plan</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Today's Plan */}
        <Section
          title="Today's Plan"
          action={
            todaysMeals
              ? { label: 'View All', onPress: navigateToMealPlans }
              : undefined
          }>
          {todaysMeals ? (
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

        {/* Recipe Categories */}
        <Section title="Recipe Categories">
          <FlatList
            data={RECIPE_CATEGORIES}
            renderItem={renderRecipeCategory}
            keyExtractor={item => item.slug}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recipesContainer}
          />
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
    paddingHorizontal: spacing.sm,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  logo: {
    height: 43,
    width: 144,
    tintColor: colors.primary,
  },

  // Welcome Section
  welcomeSection: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  welcomeText: {
    ...typography.h4,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  welcomeSubtext: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // Active Meal Plan Card
  planCardContainer: {
    marginBottom: spacing.md,
  },
  planCard: {
    height: 160,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  planImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  planOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  planContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  planTitle: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  planName: {
    ...typography.h5,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  planDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planDetailText: {
    ...typography.bodySmall,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  viewButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
    marginRight: spacing.xs,
  },
  planCardEmpty: {
    height: 160,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    ...shadows.sm,
  },
  emptyPlanText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  createPlanButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  createPlanButtonText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
  },

  // Today's Plan
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

  // Categories
  categoryButton: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 60,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  categoryName: {
    ...typography.bodySmall,
    color: colors.text.primary,
    textAlign: 'center',
  },
});

export default DashboardScreen;
