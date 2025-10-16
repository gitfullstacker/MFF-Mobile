import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/Feather';
import { PageContainer } from '../../components/layout/PageContainer';
import { Section } from '../../components/layout/Section';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import { Recipe, RecipeFilters } from '../../types/recipe';
import { PlanSchedule } from '../../types/plan';
import { RECIPE_CATEGORIES, SCREEN_NAMES } from '@/constants';
import { useActivePlan } from '../../hooks/useActivePlan';
import { SwipeIndicator } from '@/components/ui/SwipeIndicator';
import { SuggestedMealPlanSection } from '@/components/dashboard/SuggestedMealPlanSection';
import { useRecentRecipes } from '@/hooks/useRecentRecipes';
import { useFavorites } from '@/hooks/useFavorites';
import { useNavigationHelpers } from '@/hooks/useNavigation';
import { useRecipes } from '@/hooks/useRecipes';

const { width: screenWidth } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    navigateToMainTab,
    navigateToRecipeDetail,
    navigateToCreateMealPlan,
    navigateToMealPlanDetail,
    navigateToDownloads,
  } = useNavigationHelpers();
  const { applyFilters } = useRecipes();
  const { toggleFavorite } = useFavorites();
  const { recentRecipes, loading: recentRecipesLoading } = useRecentRecipes();
  const { activePlan, loading: activePlanLoading } = useActivePlan();
  const [isTodayPlanExpanded, setIsTodayPlanExpanded] = useState(false);
  const [todaysMeals, setTodaysMeals] = useState<Recipe[]>([]);
  const [dailyMacros, setDailyMacros] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
  });

  // Refs for scroll indicators
  const mealsScrollRef = useRef<FlatList>(null);
  const recipesScrollRef = useRef<FlatList>(null);
  const categoriesScrollRef = useRef<FlatList>(null);

  // Animated values for scroll tracking
  const mealsScrollX = useRef(new Animated.Value(0)).current;
  const recipesScrollX = useRef(new Animated.Value(0)).current;
  const categoriesScrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Calculate today's meals when active plan changes
    if (activePlan) {
      calculateTodaysMeals();
    }
  }, [activePlan]);

  const toggleTodayPlan = () => {
    setIsTodayPlanExpanded(!isTodayPlanExpanded);
  };

  const calculateTodaysMeals = () => {
    if (!activePlan) {
      setTodaysMeals([]);
      setDailyMacros({ protein: 0, carbs: 0, fat: 0, calories: 0 });
      return;
    }

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

    if (!dayKey) {
      setTodaysMeals([]);
      return;
    }

    const todaysSchedule = activePlan.schedule[dayKey];
    if (!Array.isArray(todaysSchedule)) {
      setTodaysMeals([]);
      return;
    }

    // Extract recipes from today's schedule
    const todaysRecipes: Recipe[] = [];
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCalories = 0;

    todaysSchedule.forEach(scheduledRecipe => {
      if (
        scheduledRecipe.recipe &&
        typeof scheduledRecipe.recipe === 'object'
      ) {
        const recipe = scheduledRecipe.recipe as Recipe;
        todaysRecipes.push(recipe);

        // Calculate macros
        if (recipe.nutrition) {
          totalProtein += recipe.nutrition.protein;
          totalCarbs += recipe.nutrition.carbohydrates;
          totalFat += recipe.nutrition.fat;
          totalCalories += recipe.nutrition.calories;
        }
      }
    });

    setTodaysMeals(todaysRecipes);
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
      onPress={() => navigateToRecipeDetail(item.slug)}>
      <RecipeCard
        recipe={item}
        onPress={() => navigateToRecipeDetail(item.slug)}
        onFavoriteToggle={toggleFavorite}
      />
    </TouchableOpacity>
  );

  const renderRecentRecipe = ({ item }: { item: Recipe }) => (
    <View style={styles.recentRecipeCard}>
      <RecipeCard
        recipe={item}
        onPress={() => navigateToRecipeDetail(item.slug)}
        onFavoriteToggle={toggleFavorite}
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
    <View style={styles.categoryItemContainer}>
      <TouchableOpacity
        key={item.id}
        style={styles.categoryButton}
        onPress={() => navigateToCategory(item.slug)}>
        <View style={styles.categoryIcon}>
          <Icon name={item.icon} size={18} color={colors.primary} />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    </View>
  );

  const navigateToCategory = (categorySlug: string) => {
    const categoryFilters: RecipeFilters = {
      types: categorySlug, // Set the selected category as the filter
    };
    applyFilters(categoryFilters);

    // Navigate to the recipes tab
    navigateToMainTab(SCREEN_NAMES.MAIN_TAB.RECIPES);
  };

  // Calculate item dimensions for indicators
  const mealCardWidth = screenWidth - spacing.md * 2 - spacing.sm * 2; // Approximate width of meal card
  const recipeCardWidth = screenWidth - spacing.md * 2 - spacing.sm * 2; // Approximate width of recipe card
  const categoryItemWidth = 75; // Width of category item

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
          {activePlan ? (
            <TouchableOpacity
              style={styles.planCard}
              onPress={() => navigateToMealPlanDetail(activePlan._id)}
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
                  <Text style={styles.planName}>{activePlan.name}</Text>
                  <View style={styles.planDetails}>
                    <Icon name="book-open" size={14} color={colors.white} />
                    <Text style={styles.planDetailText}>
                      {Object.values(activePlan.schedule).flat().length} recipes
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
              <View style={styles.emptyPlanActions}>
                <TouchableOpacity
                  style={styles.createPlanButton}
                  onPress={navigateToCreateMealPlan}>
                  <Text style={styles.createPlanButtonText}>Create Plan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.setPlanButton}
                  onPress={() =>
                    navigateToMainTab(SCREEN_NAMES.MAIN_TAB.MEAL_PLANS)
                  }>
                  <Text style={styles.setPlanButtonText}>Set Active Plan</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Today's Plan */}
        <TouchableOpacity
          style={styles.todayPlanHeader}
          onPress={toggleTodayPlan}
          activeOpacity={0.8}>
          <Text style={styles.todayPlanHeaderText}>Today's Plan</Text>
          <View style={styles.todayPlanHeaderRight}>
            <Text style={styles.todayPlanGuideText}>
              {isTodayPlanExpanded ? 'Tap to collapse' : 'Tap to expand'}
            </Text>
            <Icon
              name={isTodayPlanExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.text.primary}
            />
          </View>
        </TouchableOpacity>

        {isTodayPlanExpanded && (
          <View style={styles.todayPlanContent}>
            {todaysMeals ? (
              <>
                {todaysMeals.length > 0 ? (
                  <View style={styles.sectionWithIndicator}>
                    <FlatList
                      ref={mealsScrollRef}
                      data={todaysMeals}
                      renderItem={renderTodaysMeal}
                      keyExtractor={item => item._id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.mealsContainer}
                      decelerationRate="fast"
                      pagingEnabled={false}
                      onScroll={Animated.event(
                        [
                          {
                            nativeEvent: { contentOffset: { x: mealsScrollX } },
                          },
                        ],
                        { useNativeDriver: false },
                      )}
                      scrollEventThrottle={16}
                    />
                    <SwipeIndicator
                      itemCount={todaysMeals.length}
                      itemWidth={mealCardWidth}
                      scrollX={mealsScrollX}
                      style={styles.mealsIndicator}
                    />
                  </View>
                ) : (
                  <Text style={styles.noMealsText}>
                    No meals planned for today
                  </Text>
                )}
              </>
            ) : (
              <EmptyState
                title="No meal plan for this week"
                description="Create a meal plan to track your daily nutrition"
                action={{
                  label: 'Create Meal Plan',
                  onPress: navigateToCreateMealPlan,
                }}
              />
            )}
          </View>
        )}

        {/* Suggested Meal Plan Section */}
        <SuggestedMealPlanSection />

        {/* Quick Actions */}
        <Section title="Quick Actions">
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToCreateMealPlan}>
              <View style={styles.actionIconContainer}>
                <Icon name="calendar" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Create Meal Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigateToMainTab(SCREEN_NAMES.MAIN_TAB.RECIPES)}>
              <View style={styles.actionIconContainer}>
                <Icon name="book-open" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Browse Recipes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToDownloads}>
              <View style={styles.actionIconContainer}>
                <Icon name="download" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>View Downloads</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Recent Recipes Section */}
        <Section
          title="Recent Recipes"
          action={{
            label: 'View All',
            onPress: () => navigateToMainTab(SCREEN_NAMES.MAIN_TAB.RECIPES),
          }}>
          {recentRecipes.length > 0 ? (
            <View>
              <FlatList
                ref={recipesScrollRef}
                data={recentRecipes}
                renderItem={renderRecentRecipe}
                keyExtractor={item => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recipesContainer}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: recipesScrollX } } }],
                  { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
              />
              <SwipeIndicator
                itemCount={recentRecipes.length}
                itemWidth={recipeCardWidth}
                scrollX={recipesScrollX}
                style={styles.recipesIndicator}
              />
            </View>
          ) : (
            <EmptyState
              title="No Recent Recipes"
              description="Start exploring recipes to see them here"
              action={{
                label: 'Browse Recipes',
                onPress: () => navigateToMainTab(SCREEN_NAMES.MAIN_TAB.RECIPES),
              }}
            />
          )}
        </Section>

        {/* Recipe Categories */}
        <Section title="Recipe Categories">
          <View style={styles.sectionWithIndicator}>
            <FlatList
              ref={categoriesScrollRef}
              data={RECIPE_CATEGORIES}
              renderItem={renderRecipeCategory}
              keyExtractor={item => item.slug}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
              decelerationRate="fast"
              pagingEnabled={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: categoriesScrollX } } }],
                { useNativeDriver: false },
              )}
              scrollEventThrottle={16}
            />
            <SwipeIndicator
              itemCount={RECIPE_CATEGORIES.length}
              itemWidth={categoryItemWidth}
              scrollX={categoriesScrollX}
              style={styles.categoriesIndicator}
            />
          </View>
        </Section>
      </ScrollView>

      {/* Loading overlay */}
      {(activePlanLoading || recentRecipesLoading) && (
        <LoadingOverlay message="Loading dashboard..." />
      )}
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
    paddingTop:
      Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + 20,
    paddingBottom: spacing.md,
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
  emptyPlanActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  setPlanButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  setPlanButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
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

  // Section with indicator wrapper
  sectionWithIndicator: {
    position: 'relative',
  },

  // Today's Plan Collapsible Section
  todayPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  todayPlanHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  todayPlanGuideText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginRight: spacing.xs,
    fontStyle: 'italic',
  },
  todayPlanHeaderText: {
    ...typography.h5,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  todayPlanContent: {
    paddingBottom: spacing.md,
  },
  mealsContainer: {
    paddingRight: spacing.md,
  },
  mealCard: {
    marginRight: spacing.md,
    width: screenWidth - spacing.md * 2 - spacing.sm * 2,
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
    width: screenWidth - spacing.md * 2 - spacing.sm * 2,
  },

  // Categories
  categoriesContainer: {
    paddingRight: spacing.md,
  },
  categoryItemContainer: {
    marginRight: spacing.md,
  },
  categoryButton: {
    alignItems: 'center',
    width: 75,
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

  // Specific indicator positioning
  mealsIndicator: {
    marginTop: spacing.sm,
  },
  recipesIndicator: {
    marginTop: spacing.sm,
  },
  categoriesIndicator: {
    marginTop: spacing.sm,
  },
});

export default DashboardScreen;
