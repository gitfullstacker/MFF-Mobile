import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Button } from '../forms/Button';
import { colors, typography, spacing, fontWeights } from '../../theme';

interface MealPlanFormHeaderProps {
  selectedDayLabel: string;
  onAddRecipe: () => void;
  showAddButton?: boolean;
}

export const MealPlanFormHeader: React.FC<MealPlanFormHeaderProps> = ({
  selectedDayLabel,
  onAddRecipe,
  showAddButton = true,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleSection}>
        <Text style={styles.sectionTitle}>{selectedDayLabel} Meals</Text>
        <Text style={styles.sectionSubtitle}>
          Add recipes to plan your meals for this day
        </Text>
      </View>

      {showAddButton && (
        <Button
          title="Add Recipe"
          onPress={onAddRecipe}
          variant="primary"
          size="small"
          icon={<Icon name="plus" size={16} color={colors.white} />}
          style={styles.addButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  titleSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  addButton: {
    minWidth: 120,
  },
});
