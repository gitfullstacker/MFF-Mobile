import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Section } from '../layout/Section';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  fontWeights,
} from '../../theme';
import { NutritionProfile } from '../../types/nutrition';

interface DailyNutritionTargetsProps {
  nutritionProfile: NutritionProfile | null;
  onNavigateToNutrition?: () => void;
}

export const DailyNutritionTargets: React.FC<DailyNutritionTargetsProps> = ({
  nutritionProfile,
  onNavigateToNutrition,
}) => {
  // Calculate target macros
  const getTargetMacros = () => {
    if (!nutritionProfile) return null;

    const targetMacros = nutritionProfile.targetMacros || {
      protein: nutritionProfile.calculatedNutrition?.macros.protein.grams || 0,
      carbohydrates:
        nutritionProfile.calculatedNutrition?.macros.carbohydrates.grams || 0,
      fats: nutritionProfile.calculatedNutrition?.macros.fats.grams || 0,
    };

    const targetCalories =
      targetMacros.protein * 4 +
      targetMacros.carbohydrates * 4 +
      targetMacros.fats * 9;

    return {
      calories: Math.round(targetCalories),
      protein: Math.round(targetMacros.protein),
      carbohydrates: Math.round(targetMacros.carbohydrates),
      fat: Math.round(targetMacros.fats),
    };
  };

  const targetMacros = getTargetMacros();

  if (!nutritionProfile || !targetMacros) {
    return (
      <Section title="Daily Nutrition Targets">
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="target" size={40} color={colors.text.light} />
          </View>
          <Text style={styles.emptyTitle}>No Nutrition Profile</Text>
          <Text style={styles.emptyDescription}>
            Set up your nutrition profile to see your daily calorie and macro
            targets
          </Text>
          {onNavigateToNutrition && (
            <TouchableOpacity
              style={styles.setupButton}
              onPress={onNavigateToNutrition}
              activeOpacity={0.7}>
              <Icon name="settings" size={16} color={colors.white} />
              <Text style={styles.setupButtonText}>Set Up Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </Section>
    );
  }

  return (
    <Section title="Daily Nutrition Targets">
      <View style={styles.container}>
        {/* Header with edit button */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon name="target" size={20} color={colors.primary} />
            <Text style={styles.headerText}>Your Daily Goals</Text>
          </View>
          {onNavigateToNutrition && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={onNavigateToNutrition}
              activeOpacity={0.7}>
              <Icon name="edit-2" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Calories Display - Prominent */}
        <View style={styles.caloriesCard}>
          <View style={styles.caloriesIconContainer}>
            <Icon name="zap" size={24} color={colors.primary} />
          </View>
          <View style={styles.caloriesContent}>
            <Text style={styles.caloriesLabel}>Daily Calories</Text>
            <Text style={styles.caloriesValue}>{targetMacros.calories}</Text>
          </View>
          <Text style={styles.caloriesUnit}>kcal</Text>
        </View>

        {/* Macros Grid */}
        <View style={styles.macrosGrid}>
          {/* Protein */}
          <View style={[styles.macroCard, styles.proteinCard]}>
            <View style={styles.macroIconContainer}>
              <Icon name="zap" size={20} color={colors.semantic.success} />
            </View>
            <Text style={styles.macroValue}>{targetMacros.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>

          {/* Carbs */}
          <View style={[styles.macroCard, styles.carbCard]}>
            <View style={styles.macroIconContainer}>
              <Icon name="battery" size={20} color={colors.semantic.info} />
            </View>
            <Text style={styles.macroValue}>{targetMacros.carbohydrates}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>

          {/* Fats */}
          <View style={[styles.macroCard, styles.fatCard]}>
            <View style={styles.macroIconContainer}>
              <Icon name="droplet" size={20} color={colors.semantic.warning} />
            </View>
            <Text style={styles.macroValue}>{targetMacros.fat}g</Text>
            <Text style={styles.macroLabel}>Fats</Text>
          </View>
        </View>

        {/* Info Footer */}
        <View style={styles.footer}>
          <Icon name="info" size={14} color={colors.text.primary} />
          <Text style={styles.footerText}>
            Based on your fitness goal:{' '}
            {nutritionProfile.activityGoals?.fitnessGoal
              ?.replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase())}
          </Text>
        </View>
      </View>
    </Section>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
  },
  editButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '10',
  },

  // Calories Card
  caloriesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.primary + '08',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    ...shadows.sm,
  },
  caloriesIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  caloriesContent: {
    flex: 1,
  },
  caloriesLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  caloriesValue: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
  },
  caloriesUnit: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium,
  },

  // Macros Grid
  macrosGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  macroCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  proteinCard: {
    backgroundColor: colors.semantic.success + '08',
    borderWidth: 1,
    borderColor: colors.semantic.success + '20',
  },
  carbCard: {
    backgroundColor: colors.semantic.info + '08',
    borderWidth: 1,
    borderColor: colors.semantic.info + '20',
  },
  fatCard: {
    backgroundColor: colors.semantic.warning + '08',
    borderWidth: 1,
    borderColor: colors.semantic.warning + '20',
  },
  macroIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  macroValue: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: 2,
  },
  macroLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  setupButtonText: {
    ...typography.bodyRegular,
    color: colors.white,
    fontWeight: fontWeights.semibold,
  },
});
