import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const Section: React.FC<SectionProps> = ({
  title,
  children,
  action,
  style,
  contentStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {(title || action) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {action && (
            <TouchableOpacity onPress={action.onPress}>
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h5,
    color: colors.text.primary,
  },
  actionText: {
    ...typography.bodyRegular,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  content: {},
});
