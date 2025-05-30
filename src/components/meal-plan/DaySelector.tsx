import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
} from '../../theme';

export interface DayOption {
  key: string;
  label: string;
}

interface DaySelectorProps {
  days: DayOption[];
  selectedDay: string;
  onDaySelect: (dayKey: string) => void;
  getRecipeCountByDay: (dayKey: string) => number;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  selectedDay,
  onDaySelect,
  getRecipeCountByDay,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.daysScrollView}>
      {days.map(day => (
        <TouchableOpacity
          key={day.key}
          style={[
            styles.dayButton,
            selectedDay === day.key && styles.selectedDayButton,
          ]}
          onPress={() => onDaySelect(day.key)}>
          <Text
            style={[
              styles.dayButtonText,
              selectedDay === day.key && styles.selectedDayButtonText,
            ]}>
            {day.label.substring(0, 3)}
          </Text>
          {getRecipeCountByDay(day.key) > 0 && (
            <View style={styles.recipeBadge}>
              <Text style={styles.recipeBadgeText}>
                {getRecipeCountByDay(day.key)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  daysScrollView: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  dayButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  selectedDayButton: {
    backgroundColor: colors.primary,
  },
  dayButtonText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: fontWeights.medium,
  },
  selectedDayButtonText: {
    color: colors.white,
  },
  recipeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.semantic.info,
    borderRadius: borderRadius.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: fontWeights.bold,
  },
});
