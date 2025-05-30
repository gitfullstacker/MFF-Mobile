import { colors, spacing, typography } from '@/theme';
import { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const { width: screenWidth } = Dimensions.get('window');

interface SwipeIndicatorProps {
  itemCount: number;
  itemWidth: number;
  scrollX: Animated.Value;
  style?: any;
}

export const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({
  itemCount,
  itemWidth,
  scrollX,
  style,
}) => {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Show indicator if there are enough items to scroll
    const containerWidth = screenWidth - spacing.sm * 2;
    const totalWidth = itemCount * itemWidth;
    setShowIndicator(totalWidth > containerWidth);
  }, [itemCount, itemWidth]);

  if (!showIndicator || itemCount <= 1) return null;

  // Calculate number of visible dots (max 5)
  const maxDots = Math.min(6, itemCount);
  const containerWidth = screenWidth - spacing.sm * 2;
  const visibleItems = Math.floor(containerWidth / itemWidth);
  const totalPages = Math.max(1, Math.ceil(itemCount / visibleItems));
  const actualDots = Math.min(maxDots, totalPages);

  return (
    <View style={[styles.swipeIndicatorContainer, style]}>
      <View style={styles.swipeIndicatorDots}>
        {Array.from({ length: actualDots }).map((_, index) => {
          const inputRange = [
            (index - 1) * containerWidth,
            index * containerWidth,
            (index + 1) * containerWidth,
          ];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.swipeIndicatorDot,
                {
                  opacity,
                  transform: [{ scale }],
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.swipeHint}>
        <Icon name="chevrons-right" size={12} color={colors.text.secondary} />
        <Text style={styles.swipeHintText}>Swipe for more</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Swipe Indicators
  swipeIndicatorContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  swipeIndicatorDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  swipeIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginHorizontal: 3,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeHintText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
});
