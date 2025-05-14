import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { MacroDisplay } from './MacroDisplay';
import { Recipe } from '../../types/recipe';

const { width: screenWidth } = Dimensions.get('window');

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  onFavorite?: () => void;
  variant?: 'compact' | 'full';
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onPress,
  onFavorite,
  variant = 'compact',
}) => {
  const { name, image_url, total_time, nutrition, is_favorite } = recipe;

  // Function to determine difficulty based on total time
  const getDifficulty = (): 'Easy' | 'Medium' | 'Hard' => {
    if (total_time <= 30) return 'Easy';
    if (total_time <= 60) return 'Medium';
    return 'Hard';
  };

  const difficulty = getDifficulty();

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Easy':
        return colors.semantic.success;
      case 'Medium':
        return colors.semantic.warning;
      case 'Hard':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, styles[variant]]}
      onPress={onPress}
      activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image_url }}
          style={[styles.image, styles[`${variant}Image`]]}
          resizeMode="cover"
        />

        {onFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon
              name="heart"
              size={20}
              color={is_favorite ? colors.primary : colors.white}
              style={
                is_favorite ? styles.favoriteIconFilled : styles.favoriteIcon
              }
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {name}
        </Text>

        <View style={styles.info}>
          <View style={styles.infoItem}>
            <Icon name="clock" size={14} color={colors.text.secondary} />
            <Text style={styles.infoText}>{total_time} min</Text>
          </View>

          <View style={styles.infoItem}>
            <View
              style={[
                styles.difficultyDot,
                { backgroundColor: getDifficultyColor() },
              ]}
            />
            <Text style={styles.infoText}>{difficulty}</Text>
          </View>
        </View>

        <MacroDisplay
          protein={nutrition.protein}
          carbs={nutrition.carbohydrates}
          fat={nutrition.fat}
          calories={nutrition.calories}
          variant="text"
          size="small"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
    marginBottom: spacing.md,
  },
  compact: {
    width: (screenWidth - spacing.lg * 3) / 2,
  },
  full: {
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
  },
  compactImage: {
    height: 120,
  },
  fullImage: {
    height: 200,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  favoriteIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  favoriteIconFilled: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  content: {
    padding: spacing.sm,
  },
  title: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
});
