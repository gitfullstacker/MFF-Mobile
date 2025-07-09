import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { Recipe } from '../../types/recipe';
import { useSubscription } from '../../hooks/useSubscription';
import { RatingImage, StarRating } from 'react-native-product-ratings';

const { width: screenWidth } = Dimensions.get('window');

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  isAdded?: boolean;
  showSelectionIcon?: boolean;
  onAddClick?: (recipe: Recipe) => void;
  onRemoveClick?: (recipe: Recipe) => void;
  onFavoriteToggle?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onPress,
  isAdded = false,
  showSelectionIcon = false,
  onAddClick,
  onRemoveClick,
  onFavoriteToggle,
}) => {
  const {
    name,
    thumb_image_url,
    total_time,
    nutrition,
    is_favorite,
    slug,
    _id,
    rating,
  } = recipe;
  const [isSaving, setIsSaving] = useState(false);
  const { allowedCategoryIds, loading: subscriptionLoading } =
    useSubscription();

  // Check if recipe is accessible based on subscription
  const isRecipeAccessible = useCallback(() => {
    if (subscriptionLoading) return true;
    if (!recipe.tags?.course) return true;

    const recipeCategoryIds = recipe.tags.course
      .map(tag => tag.term_id)
      .filter(id => id !== undefined) as number[];

    return recipeCategoryIds.some(id => allowedCategoryIds.includes(id));
  }, [recipe, allowedCategoryIds, subscriptionLoading]);

  const isValidRecipe = isRecipeAccessible();

  // Format time in human-readable format
  const formatTime = (minutes: number) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  // Handle favorite toggle
  const handleFavoriteClick = async (e: any) => {
    e.stopPropagation();
    e.preventDefault();

    if (isSaving) return; // Prevent double taps

    setIsSaving(true);

    try {
      // Notify parent component if needed
      if (onFavoriteToggle) {
        onFavoriteToggle(recipe);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle selection actions
  const handleSelectionAction = (e: any) => {
    e.stopPropagation();
    e.preventDefault();

    if (isAdded) {
      if (onRemoveClick) {
        onRemoveClick(recipe);
      }
    } else {
      if (onAddClick) {
        onAddClick(recipe);
      }
    }
  };

  const handleUpgradePress = async () => {
    const contactUrl = 'https://macrofriendlyfood.com/contact/';

    try {
      const supported = await Linking.canOpenURL(contactUrl);

      if (supported) {
        await Linking.openURL(contactUrl);
      } else {
        Alert.alert(
          'Unable to open link',
          'Cannot open the contact page. Please visit macrofriendlyfood.com/contact/ in your browser.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.error('Error opening contact URL:', error);
      Alert.alert(
        'Error',
        'Unable to open the contact page. Please try again.',
        [{ text: 'OK' }],
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Left Side - Recipe Details */}
      <View style={styles.detailsSection}>
        <View style={styles.titleSection}>
          {/* Recipe Title */}
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!isValidRecipe}>
            <Text style={styles.title} numberOfLines={2}>
              {name}
            </Text>
          </TouchableOpacity>

          {/* Recipe Rating */}
          <View style={styles.ratingContainer}>
            <StarRating
              count={5}
              defaultRating={rating?.average || 0}
              size={20}
              selectedColor="#F8B84E"
              readonly
              RatingImage={props => <RatingImage {...props} type="airbnb" />}
            />
          </View>
        </View>

        {/* Nutrition Information */}
        <View style={styles.nutritionContainer}>
          <Text style={styles.nutritionItem}>
            Calories: {nutrition?.calories || 0}kcal
          </Text>
          <Text style={styles.nutritionItem}>
            Carbohydrates: {nutrition?.carbohydrates?.toFixed(2) || 0}g
          </Text>
          <Text style={styles.nutritionItem}>
            Protein: {nutrition?.protein?.toFixed(2) || 0}g
          </Text>
          <Text style={styles.nutritionItem}>
            Fat: {nutrition?.fat?.toFixed(2) || 0}g
          </Text>
          <Text style={styles.nutritionItem}>
            {formatTime(total_time || 0)}
          </Text>
        </View>
      </View>

      {/* Right Side - Recipe Image */}
      <View style={styles.imageSection}>
        {isValidRecipe ? (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={onPress}
            activeOpacity={0.9}>
            {/* Selection Icon (if enabled) */}
            {showSelectionIcon && (
              <TouchableOpacity
                style={styles.selectionButton}
                onPress={handleSelectionAction}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {isAdded ? (
                  <MaterialIcon
                    name="remove-circle"
                    size={30}
                    color={colors.primary}
                  />
                ) : (
                  <Icon name="plus" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}

            {/* Favorite Button */}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleFavoriteClick}
              disabled={isSaving}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : is_favorite ? (
                <MaterialIcon
                  name="favorite"
                  size={18}
                  color={colors.primary}
                />
              ) : (
                <MaterialIcon
                  name="favorite-border"
                  size={18}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>

            {/* Recipe Image */}
            <Image
              source={{ uri: thumb_image_url || undefined }}
              defaultSource={require('../../../assets/images/recipe-placeholder.jpg')}
              style={styles.recipeImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          // Locked Recipe Overlay
          <View style={styles.lockedOverlay}>
            <MaterialIcon name="lock-outline" size={24} color={colors.white} />
            <Text style={styles.lockedText}>
              <Text style={styles.lockedTextBold}>Upgrade</Text> to access
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgradePress}>
              <Text style={styles.upgradeButtonText}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#dedede',
    height: 200,
    maxHeight: 200,
    overflow: 'hidden',
    ...shadows.sm,
  },
  detailsSection: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
    padding: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  titleSection: {
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyRegular,
    color: '#333',
    fontWeight: '600',
    lineHeight: 18,
    height: 36,
    marginBottom: 4,
  },
  ratingContainer: {
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  nutritionContainer: {
    marginTop: spacing.xs,
  },
  nutritionItem: {
    ...typography.bodySmall,
    color: '#666',
    lineHeight: 20,
  },
  imageSection: {
    width: 130,
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    borderTopRightRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: borderRadius.full,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  selectionButton: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: borderRadius.full,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  // Locked recipe styles
  lockedOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  lockedText: {
    ...typography.bodySmall,
    color: colors.white,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  lockedTextBold: {
    fontWeight: 'bold',
  },
  upgradeButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  upgradeButtonText: {
    ...typography.bodySmall,
    color: '#4caf50',
    fontWeight: 'bold',
  },
});
