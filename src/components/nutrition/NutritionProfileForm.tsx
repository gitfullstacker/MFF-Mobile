import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/Feather';
import { Section } from '../layout/Section';
import { Input } from '../forms/Input';
import { Picker } from '../forms/Picker';
import { Button } from '../forms/Button';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
} from '../../theme';
import {
  NutritionProfile,
  CreateNutritionProfileRequest,
  ActivityLevel,
  FitnessGoal,
} from '../../types/nutrition';

// Validation schema
const nutritionProfileSchema = yup.object({
  age: yup
    .number()
    .min(13, 'Age must be at least 13')
    .max(120, 'Age must be less than 120')
    .required('Age is required'),
  gender: yup
    .string()
    .oneOf(['male', 'female'], 'Please select a gender')
    .required('Gender is required'),
  height: yup
    .number()
    .min(36, 'Height must be at least 36 inches')
    .max(96, 'Height must be less than 96 inches')
    .required('Height is required'),
  weight: yup
    .number()
    .min(50, 'Weight must be at least 50 lbs')
    .max(1000, 'Weight must be less than 1000 lbs')
    .required('Weight is required'),
  bodyFatPercentage: yup
    .number()
    .min(3, 'Body fat must be at least 3%')
    .max(50, 'Body fat must be less than 50%')
    .optional()
    .transform((value, originalValue) =>
      originalValue === '' ||
      originalValue === null ||
      originalValue === undefined
        ? undefined
        : value,
    ),
  activityLevel: yup
    .string()
    .oneOf([
      'sedentary',
      'lightly_active',
      'moderately_active',
      'very_active',
      'extremely_active',
    ])
    .required('Activity level is required'),
  fitnessGoal: yup
    .string()
    .oneOf([
      'lose_weight',
      'maintain_weight',
      'gain_weight',
      'build_muscle',
      'cut',
      'bulk',
    ])
    .required('Fitness goal is required'),
  mealsPerDay: yup
    .number()
    .min(2, 'Meals per day must be at least 2')
    .max(8, 'Meals per day must be less than 8')
    .required('Meals per day is required'),
});

type FormData = {
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  bodyFatPercentage?: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  mealsPerDay: number;
};

interface NutritionProfileFormProps {
  nutritionProfile?: NutritionProfile | null;
  onSubmit: (data: CreateNutritionProfileRequest) => Promise<void>;
  onShowBodyFatModal: () => void;
  onDeleteProfile?: () => void;
  estimatedBodyFat?: number;
}

const ACTIVITY_LEVELS = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Little or no exercise',
  },
  {
    value: 'lightly_active',
    label: 'Lightly Active',
    description: 'Exercise 1-3 days/week',
  },
  {
    value: 'moderately_active',
    label: 'Moderately Active',
    description: 'Exercise 3-5 days/week',
  },
  {
    value: 'very_active',
    label: 'Very Active',
    description: 'Exercise 6-7 days/week',
  },
  {
    value: 'extremely_active',
    label: 'Extremely Active',
    description: 'Very intense exercise daily',
  },
];

const FITNESS_GOALS = [
  { value: 'lose_weight', label: 'Lose Weight' },
  { value: 'maintain_weight', label: 'Maintain Weight' },
  { value: 'gain_weight', label: 'Gain Weight' },
  { value: 'build_muscle', label: 'Build Muscle' },
  { value: 'cut', label: 'Cut (Lose Fat)' },
  { value: 'bulk', label: 'Bulk (Gain Mass)' },
];

const MEALS_OPTIONS = [
  { value: '2', label: '2 meals' },
  { value: '3', label: '3 meals' },
  { value: '4', label: '4 meals' },
  { value: '5', label: '5 meals' },
  { value: '6', label: '6 meals' },
  { value: '7', label: '7 meals' },
  { value: '8', label: '8 meals' },
];

const NutritionProfileForm: React.FC<NutritionProfileFormProps> = ({
  nutritionProfile,
  onSubmit,
  onShowBodyFatModal,
  onDeleteProfile,
  estimatedBodyFat,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(nutritionProfileSchema as any),
    defaultValues: {},
  });

  // Load existing profile data
  useEffect(() => {
    if (nutritionProfile) {
      reset({
        age: nutritionProfile.basicInfo.age,
        gender: nutritionProfile.basicInfo.gender,
        height: nutritionProfile.basicInfo.height,
        weight: nutritionProfile.basicInfo.weight,
        bodyFatPercentage: nutritionProfile.basicInfo.bodyFatPercentage,
        activityLevel: nutritionProfile.activityGoals
          .activityLevel as ActivityLevel,
        fitnessGoal: nutritionProfile.activityGoals.fitnessGoal as FitnessGoal,
        mealsPerDay: nutritionProfile.activityGoals.mealsPerDay,
      });
    }
  }, [nutritionProfile, reset]);

  useEffect(() => {
    setValue('bodyFatPercentage', estimatedBodyFat);
  }, [estimatedBodyFat]);

  const handleFormSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      const submitData: CreateNutritionProfileRequest = {
        basicInfo: {
          age: data.age,
          gender: data.gender,
          height: data.height,
          weight: data.weight,
          bodyFatPercentage: data.bodyFatPercentage,
        },
        activityGoals: {
          activityLevel: data.activityLevel,
          fitnessGoal: data.fitnessGoal,
          mealsPerDay: data.mealsPerDay,
        },
      };

      await onSubmit(submitData);
    } catch (error) {
      if (__DEV__) {
        console.error('Error submitting form:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition Profile</Text>
        <Text style={styles.subtitle}>
          Set up your profile to get personalized calorie and macro
          recommendations
        </Text>
      </View>

      {/* Basic Information */}
      <Section title="Basic Information">
        <Controller
          control={control}
          name="age"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Age (years)"
              placeholder="Enter your age"
              value={value?.toString()}
              onChangeText={text => onChange(parseFloat(text) || 0)}
              onBlur={onBlur}
              error={errors.age?.message}
              keyboardType="numeric"
              leftIcon="user"
            />
          )}
        />

        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <Picker
              label="Gender"
              selectedValue={value}
              onValueChange={onChange}
              items={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
              ]}
              error={errors.gender?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="height"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Height (inches)"
              placeholder="Enter your height"
              value={value?.toString()}
              onChangeText={text => onChange(parseFloat(text) || 0)}
              onBlur={onBlur}
              error={errors.height?.message}
              keyboardType="decimal-pad"
              leftIcon="maximize-2"
            />
          )}
        />

        <Controller
          control={control}
          name="weight"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Weight (lbs)"
              placeholder="Enter your weight"
              value={value?.toString()}
              onChangeText={text => onChange(parseFloat(text) || 0)}
              onBlur={onBlur}
              error={errors.weight?.message}
              keyboardType="decimal-pad"
              leftIcon="activity"
            />
          )}
        />
      </Section>

      {/* Body Composition (Optional) */}
      <Section title="Body Composition (Optional)">
        <Controller
          control={control}
          name="bodyFatPercentage"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Input
                label="Body Fat Percentage (%)"
                placeholder="Enter body fat percentage"
                value={value?.toString() || ''}
                onChangeText={text =>
                  onChange(text ? parseFloat(text) : undefined)
                }
                onBlur={onBlur}
                error={errors.bodyFatPercentage?.message}
                keyboardType="decimal-pad"
                leftIcon="percent"
              />
              {estimatedBodyFat !== undefined && value === estimatedBodyFat && (
                <View style={styles.estimatedBadge}>
                  <Icon name="cpu" size={14} color={colors.semantic.info} />
                  <Text style={styles.estimatedText}>AI Estimated Value</Text>
                </View>
              )}
            </View>
          )}
        />

        <TouchableOpacity
          style={styles.aiButton}
          onPress={onShowBodyFatModal}
          activeOpacity={0.7}>
          <Icon name="camera" size={20} color={colors.primary} />
          <Text style={styles.aiButtonText}>AI Body Fat Estimation</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Icon name="info" size={16} color={colors.semantic.info} />
          <Text style={styles.infoText}>
            Body fat percentage helps provide more accurate calculations. Use AI
            estimation or enter manually if known.
          </Text>
        </View>
      </Section>

      {/* Activity & Goals */}
      <Section title="Activity & Goals">
        <Controller
          control={control}
          name="activityLevel"
          render={({ field: { onChange, value } }) => (
            <Picker
              label="Activity Level"
              selectedValue={value}
              onValueChange={onChange}
              items={ACTIVITY_LEVELS.map(level => ({
                label: level.label,
                value: level.value,
              }))}
              error={errors.activityLevel?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="fitnessGoal"
          render={({ field: { onChange, value } }) => (
            <Picker
              label="Fitness Goal"
              selectedValue={value}
              onValueChange={onChange}
              items={FITNESS_GOALS}
              error={errors.fitnessGoal?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="mealsPerDay"
          render={({ field: { onChange, value } }) => (
            <Picker
              label="Meals Per Day"
              selectedValue={value ? value.toString() : ''}
              onValueChange={val => onChange(parseInt(val))}
              items={MEALS_OPTIONS}
              error={errors.mealsPerDay?.message}
            />
          )}
        />
      </Section>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={nutritionProfile ? 'Update Profile' : 'Save Profile'}
          onPress={handleSubmit(handleFormSubmit)}
          variant="primary"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
          icon={<Icon name="save" size={16} color={colors.white} />}
        />

        {nutritionProfile && onDeleteProfile && (
          <Button
            title="Delete Profile"
            onPress={onDeleteProfile}
            variant="outline"
            fullWidth
            icon={<Icon name="trash-2" size={16} color={colors.primary} />}
            style={styles.deleteButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h5,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    borderStyle: 'dashed',
    marginTop: spacing.sm,
  },
  aiButtonText: {
    ...typography.bodyRegular,
    color: colors.primary,
    fontWeight: fontWeights.medium,
    marginLeft: spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.semantic.info + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  buttonContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  deleteButton: {
    borderColor: colors.semantic.error,
  },
  estimatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.info + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  estimatedText: {
    ...typography.bodySmall,
    color: colors.semantic.info,
    marginLeft: spacing.xs,
    fontWeight: fontWeights.medium,
  },
});

export default NutritionProfileForm;
