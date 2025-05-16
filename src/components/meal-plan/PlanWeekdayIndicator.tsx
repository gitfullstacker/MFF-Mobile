import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Plan, DAYS_OF_WEEK, DayOfWeek } from '../../types/plan';

interface PlanWeekdayIndicatorProps {
  plan: Plan;
}

export const PlanWeekdayIndicator: React.FC<PlanWeekdayIndicatorProps> = ({
  plan,
}) => {
  // Helper function to check if a day has recipes
  const dayHasRecipes = (day: DayOfWeek): boolean => {
    return Array.isArray(plan.schedule[day]) && plan.schedule[day].length > 0;
  };

  // Count recipes for a specific day
  const countRecipes = (day: DayOfWeek): number => {
    return Array.isArray(plan.schedule[day]) ? plan.schedule[day].length : 0;
  };

  return (
    <View style={styles.container}>
      {DAYS_OF_WEEK.map(day => {
        const hasRecipes = dayHasRecipes(day.value);
        const recipeCount = countRecipes(day.value);

        return (
          <View
            key={day.value}
            style={[
              styles.dayIndicator,
              hasRecipes ? styles.dayHasRecipes : styles.dayEmpty,
            ]}>
            <Text
              style={[
                styles.dayText,
                hasRecipes ? styles.dayTextActive : styles.dayTextInactive,
              ]}>
              {day.label.charAt(0)}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHasRecipes: {
    backgroundColor: colors.primary,
  },
  dayEmpty: {
    backgroundColor: colors.gray[100],
  },
  dayText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  dayTextActive: {
    color: colors.white,
  },
  dayTextInactive: {
    color: colors.gray[400],
  },
});
