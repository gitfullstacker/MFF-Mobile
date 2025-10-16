import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheet } from './BottomSheet';
import { Input } from '../forms/Input';
import { Button } from '../forms/Button';
import { useNutrition } from '../../hooks/useNutrition';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import {
  NutritionProfile,
  UpdateTargetMacrosRequest,
} from '../../types/nutrition';

interface UpdateMacrosModalProps {
  visible: boolean;
  onClose: () => void;
  calculatedMacros: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  targetMacros?: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  onUpdate: (profile: NutritionProfile) => void;
}

const UpdateMacrosModal: React.FC<UpdateMacrosModalProps> = ({
  visible,
  onClose,
  calculatedMacros,
  targetMacros,
  onUpdate,
}) => {
  const { updateTargetMacros, loading } = useNutrition();

  const [protein, setProtein] = useState('');
  const [carbohydrates, setCarbohydrates] = useState('');
  const [fats, setFats] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize values when modal opens
  useEffect(() => {
    if (visible) {
      setProtein(
        (targetMacros?.protein ?? calculatedMacros.protein).toString(),
      );
      setCarbohydrates(
        (
          targetMacros?.carbohydrates ?? calculatedMacros.carbohydrates
        ).toString(),
      );
      setFats((targetMacros?.fats ?? calculatedMacros.fats).toString());
      setErrors({});
    }
  }, [visible, calculatedMacros, targetMacros]);

  // Validate inputs
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const proteinNum = parseFloat(protein);
    const carbsNum = parseFloat(carbohydrates);
    const fatsNum = parseFloat(fats);

    if (isNaN(proteinNum) || proteinNum < 0) {
      newErrors.protein = 'Protein must be a positive number';
    }

    if (isNaN(carbsNum) || carbsNum < 0) {
      newErrors.carbohydrates = 'Carbohydrates must be a positive number';
    }

    if (isNaN(fatsNum) || fatsNum < 0) {
      newErrors.fats = 'Fats must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate total calories
  const calculateCalories = (): number => {
    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbohydrates) || 0;
    const f = parseFloat(fats) || 0;
    return p * 4 + c * 4 + f * 9;
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      const data: UpdateTargetMacrosRequest = {
        protein: parseFloat(protein),
        carbohydrates: parseFloat(carbohydrates),
        fats: parseFloat(fats),
      };

      const updatedProfile = await updateTargetMacros(data);
      onUpdate(updatedProfile);
      onClose();
    } catch (error) {
      if (__DEV__) {
        console.error('Error updating macros:', error);
      }
    }
  };

  // Reset to calculated values
  const handleResetToCalculated = () => {
    setProtein(calculatedMacros.protein.toString());
    setCarbohydrates(calculatedMacros.carbohydrates.toString());
    setFats(calculatedMacros.fats.toString());
    setErrors({});
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height="90%">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="edit-2" size={24} color={colors.primary} />
          <Text style={styles.title}>Update Target Macros</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calculated Macros Display */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            Calculated Daily Macros (Based on Your Profile)
          </Text>
          <Text style={styles.infoText}>
            Protein:{' '}
            <Text style={styles.bold}>{calculatedMacros.protein}g</Text> •
            Carbs:{' '}
            <Text style={styles.bold}>{calculatedMacros.carbohydrates}g</Text> •
            Fats: <Text style={styles.bold}>{calculatedMacros.fats}g</Text>
          </Text>
        </View>

        {/* Target Macros Input */}
        <Text style={styles.sectionTitle}>Your Target Macros</Text>

        <Input
          label="Protein (grams)"
          placeholder="Enter protein"
          value={protein}
          onChangeText={setProtein}
          error={errors.protein}
          keyboardType="decimal-pad"
          leftIcon="zap"
        />

        <Input
          label="Carbohydrates (grams)"
          placeholder="Enter carbohydrates"
          value={carbohydrates}
          onChangeText={setCarbohydrates}
          error={errors.carbohydrates}
          keyboardType="decimal-pad"
          leftIcon="battery"
        />

        <Input
          label="Fats (grams)"
          placeholder="Enter fats"
          value={fats}
          onChangeText={setFats}
          error={errors.fats}
          keyboardType="decimal-pad"
          leftIcon="droplet"
        />

        {/* Macro Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Calories from Macros</Text>
          <Text style={styles.summaryValue}>
            {calculateCalories().toFixed(0)} calories
          </Text>
          <Text style={styles.summaryBreakdown}>
            Protein: {(parseFloat(protein) || 0) * 4} cal • Carbs:{' '}
            {(parseFloat(carbohydrates) || 0) * 4} cal • Fats:{' '}
            {(parseFloat(fats) || 0) * 9} cal
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title="Reset to Calculated"
          onPress={handleResetToCalculated}
          variant="outline"
          fullWidth
        />
        <View style={styles.buttonRow}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.halfButton}
            disabled={loading}
          />
          <Button
            title="Save Macros"
            onPress={handleSave}
            variant="primary"
            style={styles.halfButton}
            loading={loading}
            disabled={loading}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h6,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    paddingVertical: spacing.lg,
  },
  infoBox: {
    backgroundColor: colors.semantic.info + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    ...typography.bodyRegular,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  bold: {
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  sectionTitle: {
    ...typography.bodyLarge,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  summaryLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  summaryBreakdown: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfButton: {
    flex: 1,
  },
});

export default UpdateMacrosModal;
