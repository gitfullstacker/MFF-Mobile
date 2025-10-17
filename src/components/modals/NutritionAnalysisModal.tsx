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
import { BottomSheet } from './BottomSheet';
import { colors, spacing } from '@/theme';

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
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nutrition Analysis - {dayLabel}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
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

            {/* Macros by Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Macros by Category</Text>
              {Object.keys(macrosByCategory).length === 0 ? (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    No recipes scheduled for this day yet.
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
                              {macros.count > 1 ? 's' : ''}
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
        <TouchableOpacity style={styles.closeFooterButton} onPress={onClose}>
          <Text style={styles.closeFooterButtonText}>Close</Text>
        </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    color: '#1976D2',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  caloriesCard: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  proteinCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  carbsCard: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0',
  },
  fatCard: {
    backgroundColor: '#FFF9C4',
    borderColor: '#FBC02D',
  },
  totalCard: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  macroValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  percentageText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 24,
  },
  categoryContainer: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  categoryBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryMacrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryMacroItem: {
    width: '48%',
  },
  categoryMacroLabel: {
    fontSize: 12,
    color: '#666',
  },
  categoryMacroValue: {
    fontWeight: 'bold',
    color: '#000',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  closeFooterButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeFooterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
