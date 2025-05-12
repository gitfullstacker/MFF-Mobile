import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, shadows } from '../../theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  leftAction?: {
    icon: string;
    onPress: () => void;
  };
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  rightAction,
  leftAction,
  transparent = false,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, transparent && styles.transparent]}>
      <View style={styles.leftContainer}>
        {showBack && navigation.canGoBack() ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : leftAction ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={leftAction.onPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon
              name={leftAction.icon}
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {rightAction ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={rightAction.onPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon
              name={rightAction.icon}
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  transparent: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 3,
    alignItems: 'center',
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    textAlign: 'center',
  },
  iconButton: {
    padding: spacing.xs,
  },
  placeholder: {
    width: 24,
    height: 24,
  },
});
