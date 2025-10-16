import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { nutritionProfileAtom, addToastAtom } from '../store';
import { nutritionService } from '../services/nutrition';
import {
  CreateNutritionProfileRequest,
  UpdateNutritionProfileRequest,
  UpdateTargetMacrosRequest,
  AnalyzeBodyFatRequest,
  AnalyzeBodyFatResponse,
  AIAdviceResponse,
} from '../types/nutrition';

export const useNutrition = () => {
  const [nutritionProfile, setNutritionProfile] = useAtom(nutritionProfileAtom);
  const [, addToast] = useAtom(addToastAtom);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  /**
   * Fetch user's nutrition profile
   */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await nutritionService.getProfile();
      setNutritionProfile(profile);
      return profile;
    } catch (error: any) {
      // If profile doesn't exist (404), don't show error
      if (error.response?.status !== 404) {
        addToast({
          message:
            error.response?.data?.message ||
            'Failed to fetch nutrition profile',
          type: 'error',
          duration: 5000,
        });
      }
      setNutritionProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setNutritionProfile, addToast]);

  /**
   * Create nutrition profile
   */
  const createProfile = useCallback(
    async (data: CreateNutritionProfileRequest) => {
      try {
        setLoading(true);
        const profile = await nutritionService.createProfile(data);
        setNutritionProfile(profile);

        addToast({
          message: 'Nutrition profile created successfully',
          type: 'success',
          duration: 3000,
        });

        return profile;
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message ||
            'Failed to create nutrition profile',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setNutritionProfile, addToast],
  );

  /**
   * Update nutrition profile
   */
  const updateProfile = useCallback(
    async (data: UpdateNutritionProfileRequest) => {
      try {
        setLoading(true);
        const profile = await nutritionService.updateProfile(data);
        setNutritionProfile(profile);

        addToast({
          message: 'Nutrition profile updated successfully',
          type: 'success',
          duration: 3000,
        });

        return profile;
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message ||
            'Failed to update nutrition profile',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setNutritionProfile, addToast],
  );

  /**
   * Delete nutrition profile
   */
  const deleteProfile = useCallback(async () => {
    try {
      setLoading(true);
      await nutritionService.deleteProfile();
      setNutritionProfile(null);

      addToast({
        message: 'Nutrition profile deleted successfully',
        type: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      addToast({
        message:
          error.response?.data?.message || 'Failed to delete nutrition profile',
        type: 'error',
        duration: 5000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setNutritionProfile, addToast]);

  /**
   * Analyze body fat from image
   */
  const analyzeBodyFat = useCallback(
    async (
      data: AnalyzeBodyFatRequest,
    ): Promise<AnalyzeBodyFatResponse | null> => {
      try {
        setAnalyzing(true);
        const result = await nutritionService.analyzeBodyFat(data);

        addToast({
          message: 'Body fat analysis completed',
          type: 'success',
          duration: 3000,
        });

        return result;
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to analyze body fat',
          type: 'error',
          duration: 5000,
        });
        return null;
      } finally {
        setAnalyzing(false);
      }
    },
    [addToast],
  );

  /**
   * Get AI nutritional advice
   */
  const getAIAdvice =
    useCallback(async (): Promise<AIAdviceResponse | null> => {
      try {
        setLoading(true);
        const advice = await nutritionService.getAIAdvice();

        return advice;
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to get AI advice',
          type: 'error',
          duration: 5000,
        });
        return null;
      } finally {
        setLoading(false);
      }
    }, [addToast]);

  /**
   * Update target macros manually
   */
  const updateTargetMacros = useCallback(
    async (data: UpdateTargetMacrosRequest) => {
      try {
        setLoading(true);
        const profile = await nutritionService.updateTargetMacros(data);
        setNutritionProfile(profile);

        addToast({
          message: 'Target macros updated successfully',
          type: 'success',
          duration: 3000,
        });

        return profile;
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to update target macros',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setNutritionProfile, addToast],
  );

  /**
   * Helper: Calculate total calories from macros
   */
  const calculateCaloriesFromMacros = useCallback(
    (protein: number, carbs: number, fats: number): number => {
      // Protein: 4 cal/g, Carbs: 4 cal/g, Fats: 9 cal/g
      return protein * 4 + carbs * 4 + fats * 9;
    },
    [],
  );

  /**
   * Helper: Check if profile is complete
   */
  const isProfileComplete = useCallback((): boolean => {
    if (!nutritionProfile) return false;

    return !!(
      nutritionProfile.basicInfo &&
      nutritionProfile.activityGoals &&
      nutritionProfile.calculatedNutrition
    );
  }, [nutritionProfile]);

  return {
    nutritionProfile,
    loading,
    analyzing,
    fetchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    analyzeBodyFat,
    getAIAdvice,
    updateTargetMacros,
    calculateCaloriesFromMacros,
    isProfileComplete,
  };
};
