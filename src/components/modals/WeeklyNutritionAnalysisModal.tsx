import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { BottomSheet } from './BottomSheet';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import { Plan } from '@/types/plan';
import { NutritionProfile } from '@/types/nutrition';
import { ScheduledRecipe, PlanSchedule } from '@/types/plan';
import { Recipe } from '@/types/recipe';

interface WeeklyNutritionAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  plan: Plan;
  nutritionProfile: NutritionProfile | null;
}

interface DayMacros {
  day: string;
  dayLabel: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  recipeCount: number;
}

interface WeeklySummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  daysWithRecipes: number;
}

const DAYS_OF_WEEK = [
  { value: 'su', label: 'Sunday' },
  { value: 'mo', label: 'Monday' },
  { value: 'tu', label: 'Tuesday' },
  { value: 'we', label: 'Wednesday' },
  { value: 'th', label: 'Thursday' },
  { value: 'fr', label: 'Friday' },
  { value: 'sa', label: 'Saturday' },
];

export const WeeklyNutritionAnalysisModal: React.FC<
  WeeklyNutritionAnalysisModalProps
> = ({ visible, onClose, plan, nutritionProfile }) => {
  // Helper to extract recipe object
  const getRecipeObject = (item: ScheduledRecipe): Recipe | null => {
    if (typeof item.recipe === 'string') {
      return null;
    } else if (item.recipe && typeof item.recipe === 'object') {
      return item.recipe as Recipe;
    }
    return null;
  };

  // Calculate macros for each day
  const calculateDayMacros = (): DayMacros[] => {
    return DAYS_OF_WEEK.map(day => {
      const daySchedule = plan.schedule[day.value as keyof PlanSchedule];
      let calories = 0;
      let protein = 0;
      let carbohydrates = 0;
      let fat = 0;

      if (Array.isArray(daySchedule)) {
        daySchedule.forEach((item: ScheduledRecipe) => {
          const recipe = getRecipeObject(item);
          if (!recipe || !recipe.nutrition) return;

          calories += recipe.nutrition.calories || 0;
          protein += recipe.nutrition.protein || 0;
          carbohydrates += recipe.nutrition.carbohydrates || 0;
          fat += recipe.nutrition.fat || 0;
        });
      }

      return {
        day: day.value,
        dayLabel: day.label,
        calories,
        protein,
        carbohydrates,
        fat,
        recipeCount: Array.isArray(daySchedule) ? daySchedule.length : 0,
      };
    });
  };

  // Calculate weekly summary
  const calculateWeeklySummary = (dayMacros: DayMacros[]): WeeklySummary => {
    const daysWithRecipes = dayMacros.filter(d => d.recipeCount > 0).length;

    const totals = dayMacros.reduce(
      (acc, day) => ({
        totalCalories: acc.totalCalories + day.calories,
        totalProtein: acc.totalProtein + day.protein,
        totalCarbs: acc.totalCarbs + day.carbohydrates,
        totalFat: acc.totalFat + day.fat,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
    );

    return {
      ...totals,
      avgCalories:
        daysWithRecipes > 0 ? totals.totalCalories / daysWithRecipes : 0,
      avgProtein:
        daysWithRecipes > 0 ? totals.totalProtein / daysWithRecipes : 0,
      avgCarbs: daysWithRecipes > 0 ? totals.totalCarbs / daysWithRecipes : 0,
      avgFat: daysWithRecipes > 0 ? totals.totalFat / daysWithRecipes : 0,
      daysWithRecipes,
    };
  };

  // Get target macros
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

  // Get comparison indicator
  const getComparisonIndicator = (actual: number, target: number) => {
    if (target === 0)
      return { icon: null, color: colors.text.secondary, text: 'N/A' };

    const percentage = (actual / target) * 100;

    if (percentage >= 95 && percentage <= 105) {
      return {
        icon: 'minus',
        color: colors.semantic.success,
        text: 'On target',
      };
    } else if (percentage > 105) {
      return {
        icon: 'trending-up',
        color: colors.semantic.warning,
        text: `${Math.round(percentage - 100)}% over`,
      };
    } else {
      return {
        icon: 'trending-down',
        color: colors.semantic.info,
        text: `${Math.round(100 - percentage)}% under`,
      };
    }
  };

  const dayMacros = calculateDayMacros();
  const weeklySummary = calculateWeeklySummary(dayMacros);
  const targetMacros = getTargetMacros();

  return (
    <BottomSheet visible={visible} onClose={onClose} height="90%">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Nutrition Analysis</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Info Alert */}
        {!nutritionProfile ? (
          <View style={[styles.alert, styles.infoAlert]}>
            <Icon name="info" size={20} color={colors.semantic.info} />
            <Text style={styles.alertText}>
              Set up your nutrition profile in Account Settings to see
              personalized nutrition targets and analysis for your meal plan.
            </Text>
          </View>
        ) : (
          <View style={[styles.alert, styles.successAlert]}>
            <Icon
              name="check-circle"
              size={20}
              color={colors.semantic.success}
            />
            <Text style={styles.alertText}>
              Your weekly nutrition analysis is based on your personalized
              nutrition targets.
            </Text>
          </View>
        )}

        {/* Weekly Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Summary</Text>

          <View style={styles.summaryGrid}>
            {/* Calories Card */}
            <View style={[styles.summaryCard, styles.caloriesCard]}>
              <Text style={styles.cardLabel}>Avg Daily Calories</Text>
              <Text style={styles.cardValue}>
                {Math.round(weeklySummary.avgCalories)}
              </Text>
              {targetMacros && (
                <>
                  <Text style={styles.cardTarget}>
                    Target: {Math.round(targetMacros.calories)} cal/day
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        styles.caloriesProgress,
                        {
                          width: `${Math.min(
                            (weeklySummary.avgCalories /
                              targetMacros.calories) *
                              100,
                            100,
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.comparisonContainer}>
                    {getComparisonIndicator(
                      weeklySummary.avgCalories,
                      targetMacros.calories,
                    ).icon && (
                      <Icon
                        name={
                          getComparisonIndicator(
                            weeklySummary.avgCalories,
                            targetMacros.calories,
                          ).icon!
                        }
                        size={14}
                        color={
                          getComparisonIndicator(
                            weeklySummary.avgCalories,
                            targetMacros.calories,
                          ).color
                        }
                      />
                    )}
                    <Text
                      style={[
                        styles.comparisonText,
                        {
                          color: getComparisonIndicator(
                            weeklySummary.avgCalories,
                            targetMacros.calories,
                          ).color,
                        },
                      ]}>
                      {
                        getComparisonIndicator(
                          weeklySummary.avgCalories,
                          targetMacros.calories,
                        ).text
                      }
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Protein Card */}
            <View style={[styles.summaryCard, styles.proteinCard]}>
              <Text style={styles.cardLabel}>Avg Daily Protein</Text>
              <Text style={styles.cardValue}>
                {Math.round(weeklySummary.avgProtein)}g
              </Text>
              {targetMacros && (
                <>
                  <Text style={styles.cardTarget}>
                    Target: {Math.round(targetMacros.protein)}g/day
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        styles.proteinProgress,
                        {
                          width: `${Math.min(
                            (weeklySummary.avgProtein / targetMacros.protein) *
                              100,
                            100,
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.comparisonContainer}>
                    {getComparisonIndicator(
                      weeklySummary.avgProtein,
                      targetMacros.protein,
                    ).icon && (
                      <Icon
                        name={
                          getComparisonIndicator(
                            weeklySummary.avgProtein,
                            targetMacros.protein,
                          ).icon!
                        }
                        size={14}
                        color={
                          getComparisonIndicator(
                            weeklySummary.avgProtein,
                            targetMacros.protein,
                          ).color
                        }
                      />
                    )}
                    <Text
                      style={[
                        styles.comparisonText,
                        {
                          color: getComparisonIndicator(
                            weeklySummary.avgProtein,
                            targetMacros.protein,
                          ).color,
                        },
                      ]}>
                      {
                        getComparisonIndicator(
                          weeklySummary.avgProtein,
                          targetMacros.protein,
                        ).text
                      }
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Carbs Card */}
            <View style={[styles.summaryCard, styles.carbsCard]}>
              <Text style={styles.cardLabel}>Avg Daily Carbs</Text>
              <Text style={styles.cardValue}>
                {Math.round(weeklySummary.avgCarbs)}g
              </Text>
              {targetMacros && (
                <>
                  <Text style={styles.cardTarget}>
                    Target: {Math.round(targetMacros.carbohydrates)}g/day
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        styles.carbsProgress,
                        {
                          width: `${Math.min(
                            (weeklySummary.avgCarbs /
                              targetMacros.carbohydrates) *
                              100,
                            100,
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.comparisonContainer}>
                    {getComparisonIndicator(
                      weeklySummary.avgCarbs,
                      targetMacros.carbohydrates,
                    ).icon && (
                      <Icon
                        name={
                          getComparisonIndicator(
                            weeklySummary.avgCarbs,
                            targetMacros.carbohydrates,
                          ).icon!
                        }
                        size={14}
                        color={
                          getComparisonIndicator(
                            weeklySummary.avgCarbs,
                            targetMacros.carbohydrates,
                          ).color
                        }
                      />
                    )}
                    <Text
                      style={[
                        styles.comparisonText,
                        {
                          color: getComparisonIndicator(
                            weeklySummary.avgCarbs,
                            targetMacros.carbohydrates,
                          ).color,
                        },
                      ]}>
                      {
                        getComparisonIndicator(
                          weeklySummary.avgCarbs,
                          targetMacros.carbohydrates,
                        ).text
                      }
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Fat Card */}
            <View style={[styles.summaryCard, styles.fatCard]}>
              <Text style={styles.cardLabel}>Avg Daily Fat</Text>
              <Text style={styles.cardValue}>
                {Math.round(weeklySummary.avgFat)}g
              </Text>
              {targetMacros && (
                <>
                  <Text style={styles.cardTarget}>
                    Target: {Math.round(targetMacros.fat)}g/day
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        styles.fatProgress,
                        {
                          width: `${Math.min(
                            (weeklySummary.avgFat / targetMacros.fat) * 100,
                            100,
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.comparisonContainer}>
                    {getComparisonIndicator(
                      weeklySummary.avgFat,
                      targetMacros.fat,
                    ).icon && (
                      <Icon
                        name={
                          getComparisonIndicator(
                            weeklySummary.avgFat,
                            targetMacros.fat,
                          ).icon!
                        }
                        size={14}
                        color={
                          getComparisonIndicator(
                            weeklySummary.avgFat,
                            targetMacros.fat,
                          ).color
                        }
                      />
                    )}
                    <Text
                      style={[
                        styles.comparisonText,
                        {
                          color: getComparisonIndicator(
                            weeklySummary.avgFat,
                            targetMacros.fat,
                          ).color,
                        },
                      ]}>
                      {
                        getComparisonIndicator(
                          weeklySummary.avgFat,
                          targetMacros.fat,
                        ).text
                      }
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Daily Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Breakdown</Text>
          {dayMacros.map(day => (
            <View
              key={day.day}
              style={[
                styles.dayCard,
                day.recipeCount === 0 && styles.dayCardEmpty,
              ]}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayLabel}>{day.dayLabel}</Text>
                <View
                  style={[
                    styles.badge,
                    day.recipeCount > 0
                      ? styles.badgeFilled
                      : styles.badgeEmpty,
                  ]}>
                  <Text
                    style={[
                      styles.badgeText,
                      day.recipeCount > 0
                        ? styles.badgeTextFilled
                        : styles.badgeTextEmpty,
                    ]}>
                    {day.recipeCount}{' '}
                    {day.recipeCount === 1 ? 'recipe' : 'recipes'}
                  </Text>
                </View>
              </View>

              {day.recipeCount === 0 ? (
                <Text style={styles.emptyText}>No recipes scheduled</Text>
              ) : (
                <>
                  <View style={styles.dayCalories}>
                    <Text style={styles.dayCaloriesLabel}>Calories</Text>
                    <Text style={styles.dayCaloriesValue}>
                      {Math.round(day.calories)}
                    </Text>
                    {targetMacros && (
                      <Text style={styles.dayCaloriesTarget}>
                        {Math.round(
                          (day.calories / targetMacros.calories) * 100,
                        )}
                        % of target
                      </Text>
                    )}
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.dayMacrosGrid}>
                    <View style={styles.dayMacroItem}>
                      <Text style={styles.dayMacroLabel}>Protein</Text>
                      <Text style={styles.dayMacroValue}>
                        {Math.round(day.protein)}g
                      </Text>
                    </View>
                    <View style={styles.dayMacroItem}>
                      <Text style={styles.dayMacroLabel}>Carbs</Text>
                      <Text style={styles.dayMacroValue}>
                        {Math.round(day.carbohydrates)}g
                      </Text>
                    </View>
                    <View style={styles.dayMacroItem}>
                      <Text style={styles.dayMacroLabel}>Fat</Text>
                      <Text style={styles.dayMacroValue}>
                        {Math.round(day.fat)}g
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>

        {/* Weekly Totals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Totals</Text>
          <View style={styles.totalsGrid}>
            <View style={[styles.totalCard, styles.totalCaloriesCard]}>
              <Text style={styles.totalLabel}>Total Calories</Text>
              <Text style={[styles.totalValue, styles.totalCaloriesValue]}>
                {Math.round(weeklySummary.totalCalories).toLocaleString()}
              </Text>
              {targetMacros && (
                <Text style={styles.totalSubtext}>
                  {weeklySummary.daysWithRecipes} days planned
                </Text>
              )}
            </View>

            <View style={[styles.totalCard, styles.totalProteinCard]}>
              <Text style={styles.totalLabel}>Total Protein</Text>
              <Text style={[styles.totalValue, styles.totalProteinValue]}>
                {Math.round(weeklySummary.totalProtein)}g
              </Text>
              {targetMacros && (
                <Text style={styles.totalSubtext}>
                  Avg: {Math.round(weeklySummary.avgProtein)}g/day
                </Text>
              )}
            </View>

            <View style={[styles.totalCard, styles.totalCarbsCard]}>
              <Text style={styles.totalLabel}>Total Carbs</Text>
              <Text style={[styles.totalValue, styles.totalCarbsValue]}>
                {Math.round(weeklySummary.totalCarbs)}g
              </Text>
              {targetMacros && (
                <Text style={styles.totalSubtext}>
                  Avg: {Math.round(weeklySummary.avgCarbs)}g/day
                </Text>
              )}
            </View>

            <View style={[styles.totalCard, styles.totalFatCard]}>
              <Text style={styles.totalLabel}>Total Fat</Text>
              <Text style={[styles.totalValue, styles.totalFatValue]}>
                {Math.round(weeklySummary.totalFat)}g
              </Text>
              {targetMacros && (
                <Text style={styles.totalSubtext}>
                  Avg: {Math.round(weeklySummary.avgFat)}g/day
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

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
    fontWeight: fontWeights.bold,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  infoAlert: {
    backgroundColor: colors.blue[200],
  },
  successAlert: {
    backgroundColor: colors.green[200],
  },
  alertText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h6,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    gap: spacing.md,
  },
  summaryCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  caloriesCard: {
    backgroundColor: '#FFF3E0',
  },
  proteinCard: {
    backgroundColor: '#E3F2FD',
  },
  carbsCard: {
    backgroundColor: '#F3E5F5',
  },
  fatCard: {
    backgroundColor: '#FFF9C4',
  },
  cardLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  cardValue: {
    ...typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardTarget: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  caloriesProgress: {
    backgroundColor: '#FF9800',
  },
  proteinProgress: {
    backgroundColor: '#2196F3',
  },
  carbsProgress: {
    backgroundColor: '#9C27B0',
  },
  fatProgress: {
    backgroundColor: '#FBC02D',
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  comparisonText: {
    ...typography.caption,
    fontWeight: fontWeights.semibold,
  },
  dayCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.dark,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  dayCardEmpty: {
    backgroundColor: colors.gray[50],
    borderStyle: 'dashed',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayLabel: {
    ...typography.h5,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  badgeFilled: {
    backgroundColor: colors.primary,
  },
  badgeEmpty: {
    backgroundColor: colors.gray[300],
  },
  badgeText: {
    ...typography.caption,
    fontWeight: fontWeights.semibold,
  },
  badgeTextFilled: {
    color: colors.white,
  },
  badgeTextEmpty: {
    color: colors.text.secondary,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  dayCalories: {
    marginBottom: spacing.sm,
  },
  dayCaloriesLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  dayCaloriesValue: {
    ...typography.h6,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  dayCaloriesTarget: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  dayMacrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayMacroItem: {
    flex: 1,
  },
  dayMacroLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  dayMacroValue: {
    ...typography.bodyRegular,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
  },
  totalsGrid: {
    gap: spacing.sm,
  },
  totalCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  totalCaloriesCard: {
    backgroundColor: '#FFF3E0',
  },
  totalProteinCard: {
    backgroundColor: '#E3F2FD',
  },
  totalCarbsCard: {
    backgroundColor: '#F3E5F5',
  },
  totalFatCard: {
    backgroundColor: '#FFF9C4',
  },
  totalLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  totalValue: {
    ...typography.h5,
    fontWeight: fontWeights.bold,
  },
  totalCaloriesValue: {
    color: '#E65100',
  },
  totalProteinValue: {
    color: '#1976D2',
  },
  totalCarbsValue: {
    color: '#7B1FA2',
  },
  totalFatValue: {
    color: '#F57F17',
  },
  totalSubtext: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs / 2,
  },
});
