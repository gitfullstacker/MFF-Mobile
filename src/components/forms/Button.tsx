import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.container,
    styles[variant],
    styles[`${size}Container`],
    isDisabled ? styles.disabled : null,
    fullWidth ? styles.fullWidth : null,
    style,
  ].filter(Boolean);

  const buttonTextStyles = [
    styles.buttonText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ].filter(Boolean);

  const getLoadingColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return colors.white;
      case 'outline':
      case 'text':
        return colors.primary;
      default:
        return colors.white;
    }
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          color={getLoadingColor()}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={buttonTextStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  iconContainer: ViewStyle;
  fullWidth: ViewStyle;
  // Variants
  primary: ViewStyle;
  secondary: ViewStyle;
  outline: ViewStyle;
  text: ViewStyle;
  // Sizes (containers)
  smallContainer: ViewStyle;
  mediumContainer: ViewStyle;
  largeContainer: ViewStyle;
  // States
  disabled: ViewStyle;
  // Text Base
  buttonText: TextStyle;
  // Text variants
  primaryText: TextStyle;
  secondaryText: TextStyle;
  outlineText: TextStyle;
  textText: TextStyle;
  // Text sizes
  smallText: TextStyle;
  mediumText: TextStyle;
  largeText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
  },
  // Sizes (containers)
  smallContainer: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 32,
  },
  mediumContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  largeContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  // States
  disabled: {
    opacity: 0.5,
  },
  // Text Base
  buttonText: {
    ...typography.buttonMedium,
  },
  // Text variants
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  textText: {
    color: colors.primary,
  },
  // Text sizes
  smallText: {
    ...typography.buttonSmall,
  },
  mediumText: {
    ...typography.buttonMedium,
  },
  largeText: {
    ...typography.buttonLarge,
  },
});
