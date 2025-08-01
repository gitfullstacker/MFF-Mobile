import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import KeepAwake from 'react-native-keep-awake';
import { RatingImage, StarRating } from 'react-native-product-ratings';
import { useRecipes } from '../../hooks/useRecipes';
import { useAuth } from '../../hooks/useAuth';
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
import { IngredientItem, RecipeComment } from '@/types/recipe';
import { recipeService } from '../../services/recipe';
import { useRecentRecipes } from '@/hooks/useRecentRecipes';
import { useFavorites } from '@/hooks/useFavorites';
import { RecipeStackParamList } from '@/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type RecipeDetailNavigationProps = StackNavigationProp<
  RecipeStackParamList,
  'RecipeDetail'
>;

type RecipeDetailRouteProps = RouteProp<RecipeStackParamList, 'RecipeDetail'>;

interface ReviewSubmission {
  rating: number;
  content: string;
}

const RecipeDetailScreen: React.FC = () => {
  const navigation = useNavigation<RecipeDetailNavigationProps>();
  const route = useRoute<RecipeDetailRouteProps>();
  const { recipeId } = route.params;
  const { user } = useAuth();

  const { toggleFavorite } = useFavorites();
  const { addToRecentRecipes } = useRecentRecipes();
  const { fetchRecipe, selectedRecipe, loading: recipeLoading } = useRecipes();
  const [activeTab, setActiveTab] = useState<
    'ingredients' | 'instructions' | 'reviews'
  >('ingredients');
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Cook Mode State
  const [cookModeActive, setCookModeActive] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<RecipeComment[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(0); // Start at 0, will be set to 1 on first load
  const [hasMoreReviews, setHasMoreReviews] = useState(false); // Start as false

  // Review Submission State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmission, setReviewSubmission] = useState<ReviewSubmission>({
    rating: 0,
    content: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (recipeId && (!selectedRecipe || selectedRecipe.slug !== recipeId)) {
      fetchRecipe(recipeId);
    }
  }, [recipeId, selectedRecipe, fetchRecipe]);

  useEffect(() => {
    if (selectedRecipe) {
      addToRecentRecipes(selectedRecipe);
    }
  }, [selectedRecipe]);

  // Load reviews when recipe is loaded
  useEffect(() => {
    if (selectedRecipe && activeTab === 'reviews' && reviews.length === 0) {
      loadReviews(true);
    }
  }, [selectedRecipe, activeTab]);

  // Cook Mode Effect
  useEffect(() => {
    if (cookModeActive) {
      KeepAwake.activate();
    } else {
      KeepAwake.deactivate();
    }

    // Cleanup when component unmounts
    return () => {
      KeepAwake.deactivate();
    };
  }, [cookModeActive]);

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

  const loadReviews = async (reset = false) => {
    if (!selectedRecipe || reviewsLoading) return;

    setReviewsLoading(true);
    try {
      const currentPage = reset ? 1 : reviewsPage + 1;

      const response = await recipeService.getRecipeComments(
        selectedRecipe._id,
        currentPage,
        10,
      );
      const { data: reviewsData, pagination } = response;

      if (reset) {
        setReviews(reviewsData);
      } else {
        // Prevent duplicates
        const existingIds = new Set(reviews.map(r => r.id));
        const newReviews = reviewsData.filter(
          review => !existingIds.has(review.id),
        );
        setReviews(prev => [...prev, ...newReviews]);
      }

      setReviewsPage(currentPage);
      setHasMoreReviews(pagination.hasMore);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setHasMoreReviews(false);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedRecipe || !user || reviewSubmission.rating === 0) {
      Alert.alert(
        'Review Required',
        'Please provide a rating and review content.',
      );
      return;
    }

    setSubmittingReview(true);
    try {
      const newReview = await recipeService.addComment(selectedRecipe._id, {
        content: reviewSubmission.content,
        rating: reviewSubmission.rating,
      });

      // Add new review to the beginning of the list
      setReviews(prev => [newReview, ...prev]);

      // Reset form
      setReviewSubmission({ rating: 0, content: '' });
      setShowReviewForm(false);

      Alert.alert('Success', 'Your review has been submitted!');
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleFavoritePress = useCallback(async () => {
    if (!selectedRecipe || isTogglingFavorite) return;

    setIsTogglingFavorite(true);

    try {
      await toggleFavorite(selectedRecipe);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [selectedRecipe, isTogglingFavorite, toggleFavorite]);

  const handleAddToMealPlan = () => {
    setShowMealPlanModal(true);
  };

  const handleMealPlanSuccess = () => {
    // Optional: You can add any additional logic here after successful addition
    console.log('Recipe successfully added to meal plan');
  };

  const toggleCookMode = () => {
    setCookModeActive(prev => !prev);
  };

  const scrollToReviews = () => {
    setActiveTab('reviews');
  };

  // Render ingredient with adjusted amounts
  const renderIngredient = (item: IngredientItem, index: number) => {
    return (
      <View key={`${item.uid}-${index}`} style={styles.ingredientItem}>
        <View style={styles.ingredientBullet} />
        <Text style={styles.ingredientText}>
          <Text style={styles.ingredientAmount}>
            {item.amount} {item.unit}{' '}
          </Text>
          {item.name}
          {item.notes && (
            <Text style={styles.ingredientNotes}> ({item.notes})</Text>
          )}
        </Text>
      </View>
    );
  };

  // Render category tags
  const renderCategoryTags = () => {
    if (!selectedRecipe?.tags) return null;

    const allTags = [
      ...(selectedRecipe.tags.course || []),
      ...(selectedRecipe.tags.cuisine || []),
      ...(selectedRecipe.tags.keyword || []),
    ];

    if (allTags.length === 0) return null;

    return (
      <View style={styles.tagsContainer}>
        {allTags.slice(0, 6).map((tag, index) => (
          <View key={`${tag.term_id}-${index}`} style={styles.tagChip}>
            <Text style={styles.tagText}>{tag.name}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render time information cards
  const renderTimeInfo = () => {
    if (!selectedRecipe) return null;

    return (
      <View style={styles.timeInfoContainer}>
        <View style={styles.timeCard}>
          <Icon name="clock" size={20} color={colors.primary} />
          <Text style={styles.timeLabel}>Prep</Text>
          <Text style={styles.timeValue}>{selectedRecipe.prep_time || 0}m</Text>
        </View>
        <View style={styles.timeCard}>
          <Icon name="zap" size={20} color={colors.primary} />
          <Text style={styles.timeLabel}>Cook</Text>
          <Text style={styles.timeValue}>{selectedRecipe.cook_time || 0}m</Text>
        </View>
        <View style={styles.timeCard}>
          <Icon name="target" size={20} color={colors.primary} />
          <Text style={styles.timeLabel}>Total</Text>
          <Text style={styles.timeValue}>
            {selectedRecipe.total_time || 0}m
          </Text>
        </View>
      </View>
    );
  };

  // Render review form
  const renderReviewForm = () => {
    if (!showReviewForm || !user) return null;

    return (
      <View style={styles.reviewForm}>
        <Text style={styles.reviewFormTitle}>Write a Review</Text>

        <View style={styles.ratingSelector}>
          <Text style={styles.ratingSelectorLabel}>Your Rating:</Text>
          <StarRating
            count={5}
            defaultRating={reviewSubmission.rating}
            size={30}
            selectedColor={colors.semantic.warning}
            onFinishRating={(rating: number) =>
              setReviewSubmission(prev => ({ ...prev, rating }))
            }
            RatingImage={props => <RatingImage {...props} type="airbnb" />}
          />
        </View>

        <TextInput
          style={styles.reviewInput}
          placeholder="Share your thoughts about this recipe..."
          multiline
          numberOfLines={4}
          value={reviewSubmission.content}
          onChangeText={content =>
            setReviewSubmission(prev => ({ ...prev, content }))
          }
          textAlignVertical="top"
        />

        <View style={styles.reviewFormButtons}>
          <Button
            title="Cancel"
            onPress={() => setShowReviewForm(false)}
            variant="outline"
            size="small"
            style={styles.reviewFormButton}
          />
          <Button
            title="Submit Review"
            onPress={handleSubmitReview}
            variant="primary"
            size="small"
            loading={submittingReview}
            disabled={submittingReview || reviewSubmission.rating === 0}
            style={styles.reviewFormButton}
          />
        </View>
      </View>
    );
  };

  // Show loading only if we don't have a recipe and are still loading
  if (!selectedRecipe || recipeLoading) {
    return <LoadingOverlay message="Loading recipe..." />;
  }

  // Show error if no recipe is available
  if (!selectedRecipe) {
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

  return (
    <PageContainer safeArea={false} padding={false}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Cook Mode Floating Button */}
      <TouchableOpacity
        style={[
          styles.cookModeButton,
          cookModeActive && styles.cookModeButtonActive,
        ]}
        onPress={toggleCookMode}>
        <Icon
          name={cookModeActive ? 'eye-off' : 'eye'}
          size={24}
          color={cookModeActive ? colors.white : colors.primary}
        />
        <Text
          style={[
            styles.cookModeText,
            cookModeActive && styles.cookModeTextActive,
          ]}>
          {cookModeActive ? 'Exit Cook Mode' : 'Cook Mode'}
        </Text>
      </TouchableOpacity>

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
            {selectedRecipe.name}
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleFavoritePress}
              style={styles.headerButton}
              disabled={isTogglingFavorite}>
              {selectedRecipe.is_favorite ? (
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
            source={{ uri: selectedRecipe.image_url }}
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
                onPress={handleFavoritePress}
                style={styles.heroActionButton}
                disabled={isTogglingFavorite}>
                {selectedRecipe.is_favorite ? (
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
          {/* Category Tags */}
          {renderCategoryTags()}

          {/* Recipe Title & SEO Structure */}
          <View style={styles.titleSection}>
            <Text style={styles.recipeTitle} accessibilityRole="header">
              {selectedRecipe.name}
            </Text>

            {/* Rating Display */}
            <View style={styles.ratingSection}>
              <StarRating
                count={5}
                defaultRating={selectedRecipe.rating?.average || 0}
                size={20}
                selectedColor={colors.semantic.warning}
                readonly
                RatingImage={props => <RatingImage {...props} type="airbnb" />}
              />
              <Text style={styles.ratingText}>
                {selectedRecipe.rating?.average?.toFixed(1) || '0.0'} (
                {selectedRecipe.rating?.count || 0}{' '}
                <Text style={styles.reviewsLink} onPress={scrollToReviews}>
                  reviews
                </Text>
                )
              </Text>
            </View>
          </View>

          {/* Time Information Cards */}
          {renderTimeInfo()}

          {/* Description */}
          {selectedRecipe.description && (
            <Text style={styles.description}>{selectedRecipe.description}</Text>
          )}

          {/* Nutrition Info */}
          <Section title="Nutrition Information">
            <View style={styles.macroSection}>
              <MacroDisplay
                protein={selectedRecipe.nutrition.protein}
                carbs={selectedRecipe.nutrition.carbohydrates}
                fat={selectedRecipe.nutrition.fat}
                calories={selectedRecipe.nutrition.calories}
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
                Reviews ({selectedRecipe.rating?.count || 0})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'ingredients' && (
              <>
                {selectedRecipe.ingredients.map((group, groupIndex) => (
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
                {selectedRecipe.instructions.map((group, groupIndex) => (
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
                {/* Rating Summary */}
                <View style={styles.ratingSummary}>
                  <Text style={styles.ratingValue}>
                    {selectedRecipe.rating?.average?.toFixed(1) || '0.0'}
                  </Text>
                  <View style={styles.starsContainer}>
                    <StarRating
                      count={5}
                      defaultRating={selectedRecipe.rating?.average || 0}
                      size={20}
                      selectedColor={colors.semantic.warning}
                      readonly
                      RatingImage={props => (
                        <RatingImage {...props} type="airbnb" />
                      )}
                    />
                    <Text style={styles.ratingCount}>
                      ({selectedRecipe.rating?.count || 0} reviews)
                    </Text>
                  </View>
                </View>

                {/* Review Submission Button */}
                {user && !showReviewForm && (
                  <Button
                    title="Write a Review"
                    onPress={() => setShowReviewForm(true)}
                    variant="outline"
                    icon={
                      <Icon name="edit-3" size={18} color={colors.primary} />
                    }
                    style={styles.writeReviewButton}
                  />
                )}

                {/* Review Form */}
                {renderReviewForm()}

                {/* Reviews List */}
                {reviews.map((review, index) => {
                  // Handle different response structures
                  const authorName =
                    review.author_name ||
                    (typeof review.author === 'string' ? review.author : '') ||
                    'Anonymous User';

                  const reviewContent =
                    typeof review.content === 'string'
                      ? review.content
                      : review.content?.rendered?.replace(/<[^>]*>/g, '') || '';

                  const reviewRating =
                    review.meta?.wprm_comment_rating || review.rating || 0;

                  const reviewDate = review.date || review.created_at || '';

                  return (
                    <View
                      key={`review-${review.id}-${index}`}
                      style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewUser}>
                          <View style={styles.reviewAvatar}>
                            <Text style={styles.reviewAvatarText}>
                              {authorName.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.reviewUserName}>
                            {authorName}
                          </Text>
                        </View>
                        <View style={styles.reviewMeta}>
                          {reviewRating > 0 && (
                            <StarRating
                              count={5}
                              defaultRating={reviewRating}
                              size={16}
                              selectedColor={colors.semantic.warning}
                              readonly
                              RatingImage={props => (
                                <RatingImage {...props} type="airbnb" />
                              )}
                            />
                          )}
                          <Text style={styles.reviewDate}>
                            {reviewDate
                              ? new Date(reviewDate).toLocaleDateString()
                              : ''}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.reviewText}>{reviewContent}</Text>
                    </View>
                  );
                })}

                {/* Load More Reviews */}
                {hasMoreReviews && !reviewsLoading && reviews.length > 0 && (
                  <Button
                    title="Load More Reviews"
                    onPress={() => loadReviews(false)} // Explicitly pass false for pagination
                    variant="outline"
                    style={styles.loadMoreButton}
                  />
                )}

                {reviewsLoading && (
                  <View style={styles.reviewsLoader}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                )}

                {/* Show message if no reviews */}
                {reviews.length === 0 && !reviewsLoading && (
                  <View style={styles.noReviewsContainer}>
                    <Text style={styles.noReviewsText}>
                      No reviews yet. Be the first to review this recipe!
                    </Text>
                  </View>
                )}
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
        recipe={selectedRecipe}
        onSuccess={handleMealPlanSuccess}
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  // Cook Mode Button
  cookModeButton: {
    position: 'absolute',
    top: 200,
    right: spacing.md,
    zIndex: 101,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  cookModeButtonActive: {
    backgroundColor: colors.primary,
  },
  cookModeText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeights.medium,
  },
  cookModeTextActive: {
    color: colors.white,
  },

  // Existing styles...
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
    paddingTop:
      Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 20,
    paddingHorizontal: spacing.md,
    height: Platform.OS === 'ios' ? 100 : 70 + (StatusBar.currentHeight || 0),
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
      Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + 30,
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

  // Title and Rating Section
  titleSection: {
    marginBottom: spacing.md,
  },
  recipeTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeights.bold,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ratingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  reviewsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },

  // Category Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },

  // Time Information Cards
  timeInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  timeCard: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  timeLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  timeValue: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.semibold,
    marginTop: spacing.xs,
  },
  description: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 24,
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

  // Reviews Section
  reviewsContainer: {
    paddingBottom: spacing.lg,
  },
  ratingSummary: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
  },
  ratingValue: {
    ...typography.h1,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
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

  // Review Form
  writeReviewButton: {
    marginBottom: spacing.lg,
  },
  reviewForm: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  reviewFormTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  ratingSelector: {
    marginBottom: spacing.md,
  },
  ratingSelectorLabel: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  reviewInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.md,
    ...typography.bodyRegular,
    color: colors.text.primary,
    minHeight: 100,
    marginBottom: spacing.md,
  },
  reviewFormButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  reviewFormButton: {
    marginLeft: spacing.sm,
  },

  // Review Cards
  reviewCard: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  reviewMeta: {
    alignItems: 'flex-end',
  },
  reviewDate: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  reviewText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    lineHeight: 22,
  },
  loadMoreButton: {
    marginTop: spacing.md,
  },
  reviewsLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  noReviewsText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
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
