import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface MacroDisplayWithGoalsProps {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  goals?: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
  showTitle?: boolean;
  title?: string;
}

export const MacroDisplayWithGoals: React.FC<MacroDisplayWithGoalsProps> = ({
  protein,
  carbs,
  fat,
  calories,
  goals,
  showTitle = true,
  title = "Today's Macros",
}) => {
  const radius = 40;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;

  const macros = [
    {
      value: protein,
      goal: goals?.protein || 0,
      color: colors.macros.protein,
      label: 'Protein',
      unit: 'g',
    },
    {
      value: carbs,
      goal: goals?.carbs || 0,
      color: colors.macros.carbs,
      label: 'Carbs',
      unit: 'g',
    },
    {
      value: fat,
      goal: goals?.fat || 0,
      color: colors.macros.fat,
      label: 'Fat',
      unit: 'g',
    },
  ];

  const calorieProgress = goals?.calories
    ? (calories / goals.calories) * 100
    : 0;

  const renderProgressCircle = (value: number, goal: number, color: string) => {
    const progress = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
    const strokeDasharray = `${
      (circumference * progress) / 100
    } ${circumference}`;

    return (
      <Svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        {/* Background circle */}
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          fill="none"
          stroke={colors.gray[200]}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>From today's planned recipes</Text>
        </View>
      )}

      <View style={styles.macroContainer}>
        {/* Macro circles */}
        <View style={styles.macroCircles}>
          {macros.map((macro, index) => (
            <View key={index} style={styles.macroWrapper}>
              <View style={styles.circleContainer}>
                {goals ? (
                  renderProgressCircle(macro.value, macro.goal, macro.color)
                ) : (
                  <View
                    style={[
                      styles.staticCircle,
                      { backgroundColor: macro.color + '20' },
                    ]}>
                    <View
                      style={[
                        styles.staticInnerCircle,
                        { backgroundColor: macro.color },
                      ]}
                    />
                  </View>
                )}
                <View style={styles.circleLabel}>
                  <Text style={styles.macroValue}>
                    {macro.value.toFixed(0)}
                  </Text>
                  {goals && <Text style={styles.macroGoal}>/{macro.goal}</Text>}
                  <Text style={styles.macroUnit}>{macro.unit}</Text>
                </View>
              </View>
              <Text style={styles.macroLabel}>{macro.label}</Text>
              {goals && (
                <Text style={styles.progressText}>
                  {macro.goal > 0
                    ? Math.round((macro.value / macro.goal) * 100)
                    : 0}
                  %
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Calories section */}
        <View style={styles.caloriesSection}>
          <View style={styles.caloriesBox}>
            <Text style={styles.caloriesValue}>{calories}</Text>
            {goals && (
              <Text style={styles.caloriesGoal}>/{goals.calories}</Text>
            )}
            <Text style={styles.caloriesLabel}>calories</Text>
            {goals && (
              <View style={styles.caloriesProgress}>
                <View
                  style={[
                    styles.caloriesProgressBar,
                    { width: `${Math.min(calorieProgress, 100)}%` },
                  ]}
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {goals && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Goals are set in Preferences</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    margin: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  macroContainer: {
    alignItems: 'center',
  },
  macroCircles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.lg,
  },
  macroWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  circleContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  circleLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  staticCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staticInnerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroValue: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.bold,
  },
  macroGoal: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  macroUnit: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  macroLabel: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.xs,
  },
  progressText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  caloriesSection: {
    alignItems: 'center',
  },
  caloriesBox: {
    backgroundColor: colors.macros.calories + '15',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minWidth: 120,
  },
  caloriesValue: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.bold,
  },
  caloriesGoal: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  caloriesLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  caloriesProgress: {
    width: 80,
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  caloriesProgressBar: {
    height: '100%',
    backgroundColor: colors.macros.calories,
    borderRadius: 2,
  },
  footer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});
