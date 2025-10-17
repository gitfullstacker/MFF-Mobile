import { NutritionProfile } from '@/types/nutrition';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheet } from './BottomSheet';
import { Button } from '../forms/Button';
import { colors, spacing, typography, borderRadius } from '@/theme';

interface CategoryMacros {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  count: number;
}

interface NutritionAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  dayLabel: string;
  nutritionProfile: NutritionProfile | null;
  macrosByCategory: Record<string, CategoryMacros>;
  totalMacros: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}

export default function NutritionAnalysisModal({
  visible,
  onClose,
  dayLabel,
  nutritionProfile,
  macrosByCategory,
  totalMacros,
}: NutritionAnalysisModalProps) {
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
      calories: targetCalories,
      protein: targetMacros.protein,
      carbohydrates: targetMacros.carbohydrates,
      fat: targetMacros.fats,
    };
  };

  const formatCategoryName = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const targetMacros = getTargetMacros();

  return (
    <BottomSheet visible={visible} onClose={onClose} height="90%">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nutrition Analysis - {dayLabel}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        {!nutritionProfile ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Set up your nutrition profile to see nutrition targets and
              analysis.
            </Text>
          </View>
        ) : (
          <>
            {/* Daily Target Macros */}
            {targetMacros && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Daily Target Macros</Text>
                <View style={styles.macroGrid}>
                  <View style={[styles.macroCard, styles.caloriesCard]}>
                    <Text style={styles.macroValue}>
                      {Math.round(targetMacros.calories)}
                    </Text>
                    <Text style={styles.macroLabel}>Calories</Text>
                  </View>
                  <View style={[styles.macroCard, styles.proteinCard]}>
                    <Text style={styles.macroValue}>
                      {Math.round(targetMacros.protein)}g
                    </Text>
                    <Text style={styles.macroLabel}>Protein</Text>
                  </View>
                  <View style={[styles.macroCard, styles.carbsCard]}>
                    <Text style={styles.macroValue}>
                      {Math.round(targetMacros.carbohydrates)}g
                    </Text>
                    <Text style={styles.macroLabel}>Carbs</Text>
                  </View>
                  <View style={[styles.macroCard, styles.fatCard]}>
                    <Text style={styles.macroValue}>
                      {Math.round(targetMacros.fat)}g
                    </Text>
                    <Text style={styles.macroLabel}>Fat</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.divider} />

            {/* Total Macros for Selected Day */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Total for {dayLabel}</Text>
              <View style={styles.macroGrid}>
                <View style={[styles.macroCard, styles.totalCard]}>
                  <Text style={styles.macroValue}>
                    {Math.round(totalMacros.calories)}
                  </Text>
                  <Text style={styles.macroLabel}>Calories</Text>
                  {targetMacros && (
                    <Text style={styles.percentageText}>
                      {Math.round(
                        (totalMacros.calories / targetMacros.calories) * 100,
                      )}
                      % of target
                    </Text>
                  )}
                </View>
                <View style={[styles.macroCard, styles.totalCard]}>
                  <Text style={styles.macroValue}>
                    {Math.round(totalMacros.protein)}g
                  </Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                  {targetMacros && (
                    <Text style={styles.percentageText}>
                      {Math.round(
                        (totalMacros.protein / targetMacros.protein) * 100,
                      )}
                      % of target
                    </Text>
                  )}
                </View>
                <View style={[styles.macroCard, styles.totalCard]}>
                  <Text style={styles.macroValue}>
                    {Math.round(totalMacros.carbohydrates)}g
                  </Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  {targetMacros && (
                    <Text style={styles.percentageText}>
                      {Math.round(
                        (totalMacros.carbohydrates /
                          targetMacros.carbohydrates) *
                          100,
                      )}
                      % of target
                    </Text>
                  )}
                </View>
                <View style={[styles.macroCard, styles.totalCard]}>
                  <Text style={styles.macroValue}>
                    {Math.round(totalMacros.fat)}g
                  </Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                  {targetMacros && (
                    <Text style={styles.percentageText}>
                      {Math.round((totalMacros.fat / targetMacros.fat) * 100)}%
                      of target
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Breakdown by Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Breakdown by Category</Text>
              {Object.keys(macrosByCategory).length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No recipes with nutrition information for this day
                  </Text>
                </View>
              ) : (
                <View style={styles.categoryContainer}>
                  {Object.entries(macrosByCategory).map(
                    ([category, macros]) => (
                      <View key={category} style={styles.categoryCard}>
                        <View style={styles.categoryHeader}>
                          <Text style={styles.categoryName}>
                            {formatCategoryName(category)}
                          </Text>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>
                              {macros.count} recipe
                              {macros.count !== 1 ? 's' : ''}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.categoryMacrosGrid}>
                          <View style={styles.categoryMacroItem}>
                            <Text style={styles.categoryMacroLabel}>
                              Calories:{' '}
                              <Text style={styles.categoryMacroValue}>
                                {Math.round(macros.calories)}
                              </Text>
                            </Text>
                          </View>
                          <View style={styles.categoryMacroItem}>
                            <Text style={styles.categoryMacroLabel}>
                              Protein:{' '}
                              <Text style={styles.categoryMacroValue}>
                                {Math.round(macros.protein)}g
                              </Text>
                            </Text>
                          </View>
                          <View style={styles.categoryMacroItem}>
                            <Text style={styles.categoryMacroLabel}>
                              Carbs:{' '}
                              <Text style={styles.categoryMacroValue}>
                                {Math.round(macros.carbohydrates)}g
                              </Text>
                            </Text>
                          </View>
                          <View style={styles.categoryMacroItem}>
                            <Text style={styles.categoryMacroLabel}>
                              Fat:{' '}
                              <Text style={styles.categoryMacroValue}>
                                {Math.round(macros.fat)}g
                              </Text>
                            </Text>
                          </View>
                        </View>
                      </View>
                    ),
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button title="Close" onPress={onClose} variant="primary" fullWidth />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.semibold,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.lg,
  },
  infoBox: {
    backgroundColor: colors.blue[50],
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.blue[500],
  },
  infoText: {
    ...typography.bodyRegular,
    color: colors.blue[700],
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.md,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  macroCard: {
    width: '48%',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  caloriesCard: {
    backgroundColor: colors.orange[50],
    borderColor: colors.orange[600],
  },
  proteinCard: {
    backgroundColor: colors.blue[50],
    borderColor: colors.blue[500],
  },
  carbsCard: {
    backgroundColor: colors.purple[50],
    borderColor: colors.purple[600],
  },
  fatCard: {
    backgroundColor: colors.orange[100],
    borderColor: colors.orange[700],
  },
  totalCard: {
    backgroundColor: colors.gray[50],
    borderColor: colors.border.dark,
    borderWidth: 1,
  },
  macroValue: {
    ...typography.h2,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  macroLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  percentageText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.lg,
  },
  categoryContainer: {
    gap: spacing.md,
  },
  categoryCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryName: {
    ...typography.h6,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  categoryBadge: {
    backgroundColor: colors.blue[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  categoryMacrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryMacroItem: {
    width: '48%',
  },
  categoryMacroLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  categoryMacroValue: {
    ...typography.bodySmall,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  emptyState: {
    backgroundColor: colors.gray[50],
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  emptyStateText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
