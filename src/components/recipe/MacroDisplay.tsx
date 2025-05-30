import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface MacroDisplayProps {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  variant?: 'circle' | 'bar' | 'text';
  size?: 'small' | 'medium' | 'large';
  precision?: number;
}

export const MacroDisplay: React.FC<MacroDisplayProps> = ({
  protein,
  carbs,
  fat,
  calories,
  variant = 'text',
  size = 'medium',
  precision = 2,
}) => {
  switch (variant) {
    case 'circle':
      return (
        <MacroCircles
          protein={protein}
          carbs={carbs}
          fat={fat}
          calories={calories}
          size={size}
          precision={precision}
        />
      );
    case 'bar':
      return (
        <MacroBars
          protein={protein}
          carbs={carbs}
          fat={fat}
          calories={calories}
          size={size}
          precision={precision}
        />
      );
    default:
      return (
        <MacroText
          protein={protein}
          carbs={carbs}
          fat={fat}
          calories={calories}
          size={size}
          precision={precision}
        />
      );
  }
};

const MacroCircles: React.FC<MacroDisplayProps> = ({
  protein,
  carbs,
  fat,
  calories,
  size = 'medium',
  precision = 2,
}) => {
  const sizes = {
    small: { radius: 20, strokeWidth: 3 },
    medium: { radius: 30, strokeWidth: 4 },
    large: { radius: 40, strokeWidth: 5 },
  };

  const { radius, strokeWidth } = sizes[size];
  const circumference = 2 * Math.PI * radius;

  const macros = [
    { value: protein, color: colors.macros.protein, label: 'P' },
    { value: carbs, color: colors.macros.carbs, label: 'C' },
    { value: fat, color: colors.macros.fat, label: 'F' },
  ];

  const totalMacroCalories = protein * 4 + carbs * 4 + fat * 9;

  return (
    <View style={styles.circleContainer}>
      {macros.map((macro, index) => {
        const percentage =
          totalMacroCalories > 0
            ? (macro.value * (macro.label === 'F' ? 9 : 4)) / totalMacroCalories
            : 0;
        const strokeDasharray = `${
          circumference * percentage
        } ${circumference}`;

        return (
          <View key={index} style={styles.circleWrapper}>
            <Svg
              width={radius * 2}
              height={radius * 2}
              viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
              <Circle
                cx={radius}
                cy={radius}
                r={radius - strokeWidth / 2}
                fill="none"
                stroke={colors.gray[100]}
                strokeWidth={strokeWidth}
              />
              <Circle
                cx={radius}
                cy={radius}
                r={radius - strokeWidth / 2}
                fill="none"
                stroke={macro.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                transform={`rotate(-90 ${radius} ${radius})`}
              />
            </Svg>
            <View style={styles.circleLabel}>
              <Text style={[styles.circleValue, styles[`${size}Value`]]}>
                {macro.value.toFixed(precision)}g
              </Text>
              <Text style={[styles.circleMacro, styles[`${size}Macro`]]}>
                {macro.label}
              </Text>
            </View>
          </View>
        );
      })}
      <View style={styles.caloriesBox}>
        <Text style={[styles.caloriesValue, styles[`${size}Value`]]}>
          {calories}
        </Text>
        <Text style={[styles.caloriesLabel, styles[`${size}Macro`]]}>cal</Text>
      </View>
    </View>
  );
};

const MacroBars: React.FC<MacroDisplayProps> = ({
  protein,
  carbs,
  fat,
  calories,
  size = 'medium',
}) => {
  const totalCalories = protein * 4 + carbs * 4 + fat * 9;
  const proteinPercentage =
    totalCalories > 0 ? (protein * 4) / totalCalories : 0;
  const carbsPercentage = totalCalories > 0 ? (carbs * 4) / totalCalories : 0;
  const fatPercentage = totalCalories > 0 ? (fat * 9) / totalCalories : 0;

  const barHeight = size === 'small' ? 6 : size === 'medium' ? 8 : 10;

  return (
    <View style={styles.barContainer}>
      <View style={[styles.barBackground, { height: barHeight }]}>
        <View
          style={[
            styles.barSegment,
            {
              backgroundColor: colors.macros.protein,
              width: `${proteinPercentage * 100}%`,
            },
          ]}
        />
        <View
          style={[
            styles.barSegment,
            {
              backgroundColor: colors.macros.carbs,
              width: `${carbsPercentage * 100}%`,
            },
          ]}
        />
        <View
          style={[
            styles.barSegment,
            {
              backgroundColor: colors.macros.fat,
              width: `${fatPercentage * 100}%`,
            },
          ]}
        />
      </View>
      <View style={styles.barLabels}>
        <Text style={[styles.macroLabel, styles[`${size}Text`]]}>
          P: {protein}g
        </Text>
        <Text style={[styles.macroLabel, styles[`${size}Text`]]}>
          C: {carbs}g
        </Text>
        <Text style={[styles.macroLabel, styles[`${size}Text`]]}>
          F: {fat}g
        </Text>
        <Text style={[styles.macroLabel, styles[`${size}Text`]]}>
          {calories} cal
        </Text>
      </View>
    </View>
  );
};

const MacroText: React.FC<MacroDisplayProps> = ({
  protein,
  carbs,
  fat,
  calories,
  size = 'medium',
}) => {
  return (
    <Text style={[styles.macroText, styles[`${size}Text`]]}>
      P: {protein}g • C: {carbs}g • F: {fat}g • {calories} cal
    </Text>
  );
};

const styles = StyleSheet.create({
  // Circle styles
  circleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleWrapper: {
    position: 'relative',
    marginRight: spacing.md,
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
  circleValue: {
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  circleMacro: {
    color: colors.text.secondary,
  },
  caloriesBox: {
    backgroundColor: colors.macros.calories + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  caloriesValue: {
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  caloriesLabel: {
    color: colors.text.secondary,
  },
  // Bar styles
  barContainer: {
    flex: 1,
  },
  barBackground: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  barSegment: {
    height: '100%',
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  macroLabel: {
    color: colors.text.secondary,
  },
  // Text styles
  macroText: {
    color: colors.text.secondary,
  },
  // Size variations
  smallText: {
    ...typography.bodySmall,
  },
  mediumText: {
    ...typography.bodyRegular,
  },
  largeText: {
    ...typography.bodyLarge,
  },
  smallValue: {
    fontSize: typography.fontSizes.sm,
  },
  mediumValue: {
    fontSize: typography.fontSizes.md,
  },
  largeValue: {
    fontSize: typography.fontSizes.lg,
  },
  smallMacro: {
    fontSize: typography.fontSizes.xs,
  },
  mediumMacro: {
    fontSize: typography.fontSizes.sm,
  },
  largeMacro: {
    fontSize: typography.fontSizes.md,
  },
});
