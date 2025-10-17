import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNutrition } from '../../hooks/useNutrition';
import { Recipe } from '../../types/recipe';
import { colors, spacing } from '../../theme';
import NutritionAnalysisModal from '../modals/NutritionAnalysisModal';
import { Button } from '../forms/Button';

interface CategoryMacros {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  count: number;
}

interface NutritionAnalysisProps {
  recipes: Recipe[];
  dayLabel: string;
}

export const NutritionAnalysis: React.FC<NutritionAnalysisProps> = ({
  recipes,
  dayLabel,
}) => {
  const [showModal, setShowModal] = useState(false);
  const { nutritionProfile, fetchProfile } = useNutrition();

  // Fetch nutrition profile when component mounts
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Calculate macros by category
  const macrosByCategory = useMemo((): Record<string, CategoryMacros> => {
    const macros: Record<string, CategoryMacros> = {};

    recipes.forEach(recipe => {
      if (!recipe.nutrition || !recipe.tags?.course) return;

      // Get the first course tag as the category
      const courseTag = recipe.tags.course[0];
      if (!courseTag) return;

      const category = courseTag.slug;

      if (!macros[category]) {
        macros[category] = {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          count: 0,
        };
      }

      macros[category].calories += recipe.nutrition.calories;
      macros[category].protein += recipe.nutrition.protein;
      macros[category].carbohydrates += recipe.nutrition.carbohydrates;
      macros[category].fat += recipe.nutrition.fat;
      macros[category].count += 1;
    });

    return macros;
  }, [recipes]);

  // Calculate total macros
  const totalMacros = useMemo(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    recipes.forEach(recipe => {
      if (recipe.nutrition) {
        totalCalories += recipe.nutrition.calories;
        totalProtein += recipe.nutrition.protein;
        totalCarbs += recipe.nutrition.carbohydrates;
        totalFat += recipe.nutrition.fat;
      }
    });

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbohydrates: totalCarbs,
      fat: totalFat,
    };
  }, [recipes]);

  // Don't show button if no nutrition profile
  if (!nutritionProfile) {
    return null;
  }

  return (
    <>
      <Button
        title="Nutrition"
        onPress={() => setShowModal(true)}
        variant="secondary"
        size="small"
        icon={<Icon name="pie-chart" size={16} color={colors.white} />}
        style={styles.button}
      />

      <NutritionAnalysisModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        dayLabel={dayLabel}
        nutritionProfile={nutritionProfile}
        macrosByCategory={macrosByCategory}
        totalMacros={totalMacros}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    marginBottom: spacing.lg,
  },
});
