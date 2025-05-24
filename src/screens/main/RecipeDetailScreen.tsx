import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
  StatusBar,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useRecipes } from '../../hooks/useRecipes';
import { PageContainer } from '../../components/layout/PageContainer';
import { Section } from '../../components/layout/Section';
import { MacroDisplay } from '../../components/recipe/MacroDisplay';
import { Button } from '../../components/forms/Button';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { MealPlanPickerModal } from '../../components/modals/MealPlanPickerModal';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { RecipeStackParamList } from '../../navigation/types';
import { IngredientItem, Recipe } from '@/types/recipe';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type RecipeDetailRouteProps = RouteProp<RecipeStackParamList, 'RecipeDetail'>;

type RecipeDetailNavigationProps = StackNavigationProp<
  RecipeStackParamList,
  'RecipeDetail'
>;

const RecipeDetailScreen: React.FC = () => {
  const navigation = useNavigation<RecipeDetailNavigationProps>();
  const route = useRoute<RecipeDetailRouteProps>();
  const { recipeId, recipe: routeRecipe } = route.params;

  const { fetchRecipe, toggleFavorite, selectedRecipe, loading } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(routeRecipe || null);
  const [activeTab, setActiveTab] = useState<
    'ingredients' | 'instructions' | 'reviews'
  >('ingredients');
  const [servingSize, setServingSize] = useState(1);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Set initial recipe and favorite state
  useEffect(() => {
    if (routeRecipe) {
      setRecipe(routeRecipe);
      setIsFavorite(routeRecipe.is_favorite);
    } else if (recipeId) {
      // Fallback: fetch recipe if not provided in params
      fetchRecipe(recipeId);
    }
  }, [routeRecipe, recipeId, fetchRecipe]);

  // Update recipe from global state if it was fetched
  useEffect(() => {
    if (selectedRecipe && !routeRecipe) {
      setRecipe(selectedRecipe);
      setIsFavorite(selectedRecipe.is_favorite);
    }
  }, [selectedRecipe, routeRecipe]);

  // Handle scroll event manually
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      scrollY.setValue(offsetY);
    },
    [scrollY],
  );

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleFavoritePress = useCallback(async () => {
    if (!recipe || isTogglingFavorite) return;

    setIsTogglingFavorite(true);
    const newFavoriteStatus = !isFavorite;

    try {
      // Update UI optimistically
      setIsFavorite(newFavoriteStatus);

      // Update the recipe object
      setRecipe(prev =>
        prev ? { ...prev, is_favorite: newFavoriteStatus } : null,
      );

      // Call the API
      await toggleFavorite(recipe._id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setIsFavorite(isFavorite);
      setRecipe(prev => (prev ? { ...prev, is_favorite: isFavorite } : null));
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [recipe, isFavorite, isTogglingFavorite, toggleFavorite]);

  const handleSharePress = useCallback(async () => {
    if (recipe) {
      try {
        await Share.share({
          message: `Check out this delicious recipe: ${recipe.name}`,
          // If you have a website, you could add a URL here
          // url: `https://your-website.com/recipes/${recipe.slug}`,
        });
      } catch (error) {
        console.error('Error sharing recipe:', error);
      }
    }
  }, [recipe]);

  const handleAddToMealPlan = () => {
    setShowMealPlanModal(true);
  };

  const handleMealPlanSuccess = () => {
    // Optional: You can add any additional logic here after successful addition
    console.log('Recipe successfully added to meal plan');
  };

  const handleIncrementServings = () => {
    setServingSize(prev => prev + 1);
  };

  const handleDecrementServings = () => {
    if (servingSize > 1) {
      setServingSize(prev => prev - 1);
    }
  };

  // Calculate scaled nutrition values based on serving size
  const getScaledNutrition = () => {
    if (!recipe) return { protein: 0, carbs: 0, fat: 0, calories: 0 };

    const factor = servingSize / (recipe.servings || 1);
    return {
      protein: Math.round(recipe.nutrition.protein * factor),
      carbs: Math.round(recipe.nutrition.carbohydrates * factor),
      fat: Math.round(recipe.nutrition.fat * factor),
      calories: Math.round(recipe.nutrition.calories * factor),
    };
  };

  // Render ingredient with adjusted amounts
  const renderIngredient = (item: IngredientItem, index: number) => {
    const factor = servingSize / (recipe?.servings || 1);
    let adjustedAmount = item.amount;

    // If amount is a number, scale it
    if (!isNaN(parseFloat(item.amount))) {
      adjustedAmount = (parseFloat(item.amount) * factor).toFixed(1);
      // Remove trailing .0
      adjustedAmount = adjustedAmount.endsWith('.0')
        ? adjustedAmount.slice(0, -2)
        : adjustedAmount;
    }

    return (
      <View key={`${item.uid}-${index}`} style={styles.ingredientItem}>
        <View style={styles.ingredientBullet} />
        <Text style={styles.ingredientText}>
          <Text style={styles.ingredientAmount}>
            {adjustedAmount} {item.unit}{' '}
          </Text>
          {item.name}
          {item.notes && (
            <Text style={styles.ingredientNotes}> ({item.notes})</Text>
          )}
        </Text>
      </View>
    );
  };

  // Show loading only if we don't have a recipe and are still loading
  if (!recipe && loading) {
    return <LoadingOverlay visible={true} message="Loading recipe..." />;
  }

  // Show error if no recipe is available
  if (!recipe) {
    return (
      <PageContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recipe not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="primary"
          />
        </View>
      </PageContainer>
    );
  }

  const nutrition = getScaledNutrition();

  return (
    <PageContainer safeArea={false} padding={false}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Animated Header */}
      <Animated.View
        style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {recipe.name}
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleSharePress}
              style={styles.headerButton}>
              <Icon name="share" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleFavoritePress}
              style={styles.headerButton}
              disabled={isTogglingFavorite}>
              {isFavorite ? (
                <MaterialIcon
                  name="favorite"
                  size={24}
                  color={colors.primary}
                />
              ) : (
                <MaterialIcon
                  name="favorite-border"
                  size={24}
                  color={colors.text.primary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}>
        {/* Hero Image */}
        <View style={styles.heroImageContainer}>
          <Image
            source={{ uri: recipe.image_url }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.heroOverlay}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButtonOverlay}>
              <Icon name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.heroActions}>
              <TouchableOpacity
                onPress={handleSharePress}
                style={styles.heroActionButton}>
                <Icon name="share" size={24} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFavoritePress}
                style={styles.heroActionButton}
                disabled={isTogglingFavorite}>
                {isFavorite ? (
                  <MaterialIcon
                    name="favorite"
                    size={24}
                    color={colors.primary}
                  />
                ) : (
                  <MaterialIcon
                    name="favorite-border"
                    size={24}
                    color={colors.white}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Recipe Title & Info */}
          <Text style={styles.recipeTitle}>{recipe.name}</Text>

          <View style={styles.recipeMetaContainer}>
            <View style={styles.recipeMeta}>
              <Icon name="clock" size={20} color={colors.primary} />
              <Text style={styles.recipeMetaText}>{recipe.total_time} min</Text>
            </View>
            <View style={styles.recipeMeta}>
              <Icon name="users" size={20} color={colors.primary} />
              <View style={styles.servingAdjuster}>
                <TouchableOpacity
                  onPress={handleDecrementServings}
                  disabled={servingSize <= 1}
                  style={[
                    styles.servingButton,
                    servingSize <= 1 && styles.servingButtonDisabled,
                  ]}>
                  <Icon
                    name="minus"
                    size={16}
                    color={
                      servingSize <= 1 ? colors.gray[300] : colors.text.primary
                    }
                  />
                </TouchableOpacity>
                <Text style={styles.recipeMetaText}>
                  {servingSize} {servingSize === 1 ? 'serving' : 'servings'}
                </Text>
                <TouchableOpacity
                  onPress={handleIncrementServings}
                  style={styles.servingButton}>
                  <Icon name="plus" size={16} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Description */}
          {recipe.description && (
            <Text style={styles.description}>{recipe.description}</Text>
          )}

          {/* Nutrition Info */}
          <Section title="Nutrition Information">
            <View style={styles.macroSection}>
              <MacroDisplay
                protein={nutrition.protein}
                carbs={nutrition.carbs}
                fat={nutrition.fat}
                calories={nutrition.calories}
                variant="circle"
                size="medium"
              />
            </View>
          </Section>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'ingredients' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('ingredients')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'ingredients' && styles.activeTabText,
                ]}>
                Ingredients
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'instructions' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('instructions')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'instructions' && styles.activeTabText,
                ]}>
                Instructions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
              onPress={() => setActiveTab('reviews')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'reviews' && styles.activeTabText,
                ]}>
                Reviews
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'ingredients' && (
              <>
                {recipe.ingredients.map((group, groupIndex) => (
                  <View
                    key={`group-${groupIndex}`}
                    style={styles.ingredientGroup}>
                    {group.group_name && group.group_name !== 'Main' && (
                      <Text style={styles.ingredientGroupTitle}>
                        {group.group_name}
                      </Text>
                    )}
                    {group.items.map((item, itemIndex) =>
                      renderIngredient(item, itemIndex),
                    )}
                  </View>
                ))}
              </>
            )}

            {activeTab === 'instructions' && (
              <>
                {recipe.instructions.map((group, groupIndex) => (
                  <View
                    key={`instructions-group-${groupIndex}`}
                    style={styles.instructionGroup}>
                    {group.group_name && group.group_name !== 'Main' && (
                      <Text style={styles.instructionGroupTitle}>
                        {group.group_name}
                      </Text>
                    )}
                    {group.steps.map((step, stepIndex) => (
                      <View
                        key={`step-${stepIndex}`}
                        style={styles.instructionStep}>
                        <View style={styles.instructionNumber}>
                          <Text style={styles.instructionNumberText}>
                            {stepIndex + 1}
                          </Text>
                        </View>
                        <Text style={styles.instructionText}>{step.text}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </>
            )}

            {activeTab === 'reviews' && (
              <View style={styles.reviewsContainer}>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingValue}>
                    {recipe.rating.average.toFixed(1)}
                  </Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Icon
                        key={`star-${star}`}
                        name="star"
                        size={20}
                        color={
                          star <= Math.round(recipe.rating.average)
                            ? colors.semantic.warning
                            : colors.gray[300]
                        }
                      />
                    ))}
                    <Text style={styles.ratingCount}>
                      ({recipe.rating.count} reviews)
                    </Text>
                  </View>
                </View>

                {/* For demo purposes, showing mock reviews */}
                <View style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUser}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>JD</Text>
                      </View>
                      <Text style={styles.reviewUserName}>John Doe</Text>
                    </View>
                    <View style={styles.reviewRating}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Icon
                          key={`review-star-${star}`}
                          name="star"
                          size={16}
                          color={
                            star <= 5
                              ? colors.semantic.warning
                              : colors.gray[300]
                          }
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewText}>
                    This recipe was amazing! The flavors were perfectly balanced
                    and it was so easy to make. I'll definitely be adding this
                    to my regular rotation.
                  </Text>
                  <Text style={styles.reviewDate}>January 15, 2025</Text>
                </View>

                <View style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUser}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>AS</Text>
                      </View>
                      <Text style={styles.reviewUserName}>Alice Smith</Text>
                    </View>
                    <View style={styles.reviewRating}>
                      {[1, 2, 3, 4].map(star => (
                        <Icon
                          key={`review-star-${star}`}
                          name="star"
                          size={16}
                          color={
                            star <= 4
                              ? colors.semantic.warning
                              : colors.gray[300]
                          }
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewText}>
                    I made this for dinner last night and it was a hit with the
                    whole family! I substituted spinach for kale and it worked
                    perfectly.
                  </Text>
                  <Text style={styles.reviewDate}>February 3, 2025</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar with CTA Button */}
      <View style={styles.bottomBar}>
        <Button
          title="Add to Meal Plan"
          onPress={handleAddToMealPlan}
          fullWidth
          icon={<Icon name="calendar" size={18} color={colors.white} />}
        />
      </View>

      {/* Meal Plan Picker Modal */}
      <MealPlanPickerModal
        visible={showMealPlanModal}
        onClose={() => setShowMealPlanModal(false)}
        recipe={recipe}
        onSuccess={handleMealPlanSuccess}
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50, // More padding for iOS
    paddingBottom: 10,
    paddingHorizontal: spacing.md,
    height: Platform.OS === 'ios' ? 100 : 56 + (StatusBar.currentHeight || 0),
  },
  headerTitle: {
    ...typography.h5,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  backButton: {
    padding: spacing.sm,
  },
  heroImageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop:
      Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + spacing.md,
  },
  backButtonOverlay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActions: {
    flexDirection: 'row',
  },
  heroActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  contentContainer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  recipeTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  recipeMetaContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  recipeMetaText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  servingAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servingButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
  },
  servingButtonDisabled: {
    borderColor: colors.border.light,
  },
  description: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  macroSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  tabContent: {
    paddingVertical: spacing.md,
  },
  ingredientGroup: {
    marginBottom: spacing.lg,
  },
  ingredientGroupTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
    marginRight: spacing.sm,
  },
  ingredientText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    flex: 1,
  },
  ingredientAmount: {
    fontWeight: typography.fontWeights.semibold,
  },
  ingredientNotes: {
    fontStyle: 'italic',
    color: colors.text.secondary,
  },
  instructionGroup: {
    marginBottom: spacing.lg,
  },
  instructionGroupTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  instructionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  instructionNumberText: {
    ...typography.bodyRegular,
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
  instructionText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    flex: 1,
    paddingTop: spacing.xs,
  },
  reviewsContainer: {
    paddingBottom: spacing.lg,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ratingValue: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.bold,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingCount: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  reviewCard: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  reviewAvatarText: {
    ...typography.bodyRegular,
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  reviewUserName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.medium,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  reviewDate: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  bottomBar: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    ...shadows.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});

export default RecipeDetailScreen;
