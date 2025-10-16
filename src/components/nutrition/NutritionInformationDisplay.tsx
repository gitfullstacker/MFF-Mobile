import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Section } from '../layout/Section';
import { Button } from '../forms/Button';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import { NutritionProfile } from '../../types/nutrition';
import { useNutrition } from '../../hooks/useNutrition';
import AIAdviceModal from '../modals/AIAdviceModal';
import UpdateMacrosModal from '../modals/UpdateMacrosModal';

interface NutritionInformationDisplayProps {
  nutritionProfile: NutritionProfile;
  onProfileUpdate?: (profile: NutritionProfile) => void;
}

const ACTIVITY_LEVEL_LABELS: Record<string, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
  extremely_active: 'Extremely Active',
};

const FITNESS_GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Lose Weight',
  maintain_weight: 'Maintain Weight',
  gain_weight: 'Gain Weight',
  build_muscle: 'Build Muscle',
  cut: 'Cut (Lose Fat)',
  bulk: 'Bulk (Gain Mass)',
};

const NutritionInformationDisplay: React.FC<
  NutritionInformationDisplayProps
> = ({ nutritionProfile, onProfileUpdate }) => {
  const [showUpdateMacrosModal, setShowUpdateMacrosModal] = useState(false);
  const [showAIAdviceModal, setShowAIAdviceModal] = useState(false);
  const [aiAdvice, setAIAdvice] = useState<string>('');
  const [aiRecommendations, setAIRecommendations] = useState<string[]>([]);
  const { getAIAdvice, loading } = useNutrition();

  const { basicInfo, activityGoals, calculatedNutrition, targetMacros } =
    nutritionProfile;

  // Display macros (prioritize targetMacros if available)
  const displayMacros = targetMacros || {
    protein: calculatedNutrition?.macros.protein.grams || 0,
    carbohydrates: calculatedNutrition?.macros.carbohydrates.grams || 0,
    fats: calculatedNutrition?.macros.fats.grams || 0,
  };

  const isUsingCustomMacros = !!(
    targetMacros &&
    (targetMacros.protein !== calculatedNutrition?.macros.protein.grams ||
      targetMacros.carbohydrates !==
        calculatedNutrition?.macros.carbohydrates.grams ||
      targetMacros.fats !== calculatedNutrition?.macros.fats.grams)
  );

  // Handle AI Advice
  const handleGetAIAdvice = async () => {
    setShowAIAdviceModal(true);
    setAIAdvice('');
    setAIRecommendations([]);

    const result = await getAIAdvice();
    if (result) {
      setAIAdvice(result.advice || '');
      setAIRecommendations(result.recommendations || []);
    }
  };

  if (!calculatedNutrition) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.divider} />

      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Your Nutrition Information</Text>
      </View>

      {/* Calorie Information */}
      <Section title="Calorie Information">
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Basal Metabolic Rate (BMR)</Text>
            <Text style={styles.infoValue}>
              {calculatedNutrition.basalMetabolicRate} cal/day
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Total Daily Energy Expenditure (TDEE)
            </Text>
            <Text style={styles.infoValue}>
              {calculatedNutrition.totalDailyEnergyExpenditure} cal/day
            </Text>
          </View>

          <View style={[styles.infoRow, styles.highlightRow]}>
            <Text style={[styles.infoLabel, styles.highlightLabel]}>
              Recommended Daily Calories
            </Text>
            <View style={styles.calorieChip}>
              <Text style={styles.calorieChipText}>
                {calculatedNutrition.recommendedCalories}
              </Text>
              <Text style={styles.calorieChipUnit}>cal/day</Text>
            </View>
          </View>
        </View>
      </Section>

      {/* Macro Distribution */}
      <Section title="Macro Distribution">
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Protein ({calculatedNutrition.macros.protein.percentage}%)
            </Text>
            <Text style={styles.infoValue}>
              {calculatedNutrition.macros.protein.grams}g/day
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Carbohydrates (
              {calculatedNutrition.macros.carbohydrates.percentage}
              %)
            </Text>
            <Text style={styles.infoValue}>
              {calculatedNutrition.macros.carbohydrates.grams}g/day
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Fats ({calculatedNutrition.macros.fats.percentage}%)
            </Text>
            <Text style={styles.infoValue}>
              {calculatedNutrition.macros.fats.grams}g/day
            </Text>
          </View>
        </View>
      </Section>

      {/* Body Fat Information */}
      {basicInfo.bodyFatPercentage && (
        <Section title="Body Composition">
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Body Fat Percentage</Text>
              <Text style={styles.infoValue}>
                {basicInfo.bodyFatPercentage}%
              </Text>
            </View>

            {calculatedNutrition.bodyFatCategory && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>
                  {calculatedNutrition.bodyFatCategory}
                </Text>
              </View>
            )}
          </View>
        </Section>
      )}

      {/* Daily Macro Breakdown */}
      <Section title="Daily Macro Breakdown">
        <View style={styles.macroHeader}>
          {isUsingCustomMacros && (
            <View style={styles.customChip}>
              <Text style={styles.customChipText}>Custom</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowUpdateMacrosModal(true)}
            activeOpacity={0.7}>
            <Icon name="edit-2" size={16} color={colors.primary} />
            <Text style={styles.editButtonText}>Update Macros</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.macroGrid}>
          <View style={[styles.macroCard, styles.proteinCard]}>
            <Text style={styles.macroValue}>{displayMacros.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>

          <View style={[styles.macroCard, styles.carbCard]}>
            <Text style={styles.macroValue}>
              {displayMacros.carbohydrates}g
            </Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>

          <View style={[styles.macroCard, styles.fatCard]}>
            <Text style={styles.macroValue}>{displayMacros.fats}g</Text>
            <Text style={styles.macroLabel}>Fats</Text>
          </View>
        </View>
      </Section>

      {/* Profile Summary */}
      <View style={styles.summaryContainer}>
        <Icon name="check-circle" size={20} color={colors.semantic.success} />
        <View style={styles.summaryContent}>
          <Text style={styles.summaryTitle}>Your Profile Summary</Text>
          <Text style={styles.summaryText}>
            Based on your {basicInfo.gender === 'male' ? 'male' : 'female'}{' '}
            profile (Age: {basicInfo.age}, Height: {basicInfo.height}", Weight:{' '}
            {basicInfo.weight} lbs) with{' '}
            {ACTIVITY_LEVEL_LABELS[activityGoals.activityLevel].toLowerCase()}{' '}
            activity level and goal to{' '}
            {FITNESS_GOAL_LABELS[activityGoals.fitnessGoal].toLowerCase()}, you
            should aim for {calculatedNutrition.recommendedCalories} calories
            per day across {activityGoals.mealsPerDay} meals
            {basicInfo.bodyFatPercentage &&
              ` with a current body fat of ${basicInfo.bodyFatPercentage}% (${calculatedNutrition.bodyFatCategory})`}
            .
          </Text>
        </View>
      </View>

      {/* AI Advice Button */}
      <View style={styles.aiAdviceSection}>
        <Button
          title="Get AI Nutritional Advice"
          onPress={handleGetAIAdvice}
          variant="outline"
          fullWidth
          icon={<Icon name="cpu" size={16} color={colors.primary} />}
          loading={loading}
          disabled={loading}
        />
      </View>

      {/* AI Advice Modal */}
      <AIAdviceModal
        visible={showAIAdviceModal}
        onClose={() => setShowAIAdviceModal(false)}
        loading={loading}
        advice={aiAdvice}
        recommendations={aiRecommendations}
      />

      {/* Update Macros Modal */}
      {calculatedNutrition && (
        <UpdateMacrosModal
          visible={showUpdateMacrosModal}
          onClose={() => setShowUpdateMacrosModal(false)}
          calculatedMacros={{
            protein: calculatedNutrition.macros.protein.grams,
            carbohydrates: calculatedNutrition.macros.carbohydrates.grams,
            fats: calculatedNutrition.macros.fats.grams,
          }}
          targetMacros={targetMacros}
          onUpdate={updatedProfile => {
            setShowUpdateMacrosModal(false);
            if (onProfileUpdate) {
              onProfileUpdate(updatedProfile);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h5,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
  },
  highlightRow: {
    borderBottomWidth: 0,
    paddingTop: spacing.md,
  },
  highlightLabel: {
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
  },
  calorieChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  calorieChipText: {
    ...typography.h6,
    color: colors.white,
    fontWeight: fontWeights.bold,
  },
  calorieChipUnit: {
    ...typography.bodySmall,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  customChip: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  customChipText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  editButtonText: {
    ...typography.bodyRegular,
    color: colors.primary,
    fontWeight: fontWeights.medium,
    marginLeft: spacing.xs,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  macroCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  proteinCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  carbCard: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0',
  },
  fatCard: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  macroValue: {
    ...typography.h4,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
  },
  macroLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: colors.semantic.success + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    margin: spacing.md,
    marginTop: spacing.lg,
  },
  summaryContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  summaryTitle: {
    ...typography.bodyRegular,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  summaryText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  aiAdviceSection: {
    padding: spacing.md,
  },
});

export default NutritionInformationDisplay;
