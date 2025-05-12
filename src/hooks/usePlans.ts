import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import {
  mealPlansAtom,
  selectedMealPlanAtom,
  currentWeekPlanAtom,
  addToastAtom,
} from '../store';
import { planService } from '../services/plan';
import { MealPlan, CreateMealPlanRequest } from '../types/plan';

export const usePlans = () => {
  const [mealPlans, setMealPlans] = useAtom(mealPlansAtom);
  const [selectedPlan, setSelectedPlan] = useAtom(selectedMealPlanAtom);
  const [currentWeekPlan, setCurrentWeekPlan] = useAtom(currentWeekPlanAtom);
  const [, addToast] = useAtom(addToastAtom);

  const [loading, setLoading] = useState(false);

  const fetchPlans = useCallback(
    async (page = 0, pageSize = 20) => {
      try {
        setLoading(true);
        const response = await planService.getPlans(page, pageSize);
        setMealPlans(response.data);

        // Set current week plan if available
        const currentPlan = response.data.find(plan => {
          // Logic to determine if plan is for current week
          return true; // Placeholder
        });
        if (currentPlan) {
          setCurrentWeekPlan(currentPlan);
        }

        return response;
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to fetch meal plans',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setMealPlans, setCurrentWeekPlan, addToast],
  );

  const fetchPlan = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const plan = await planService.getPlan(id);
        setSelectedPlan(plan);
        return plan;
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to fetch meal plan',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setSelectedPlan, addToast],
  );

  const createPlan = useCallback(
    async (data: CreateMealPlanRequest) => {
      try {
        setLoading(true);
        const newPlan = await planService.createPlan(data);
        setMealPlans([newPlan, ...mealPlans]);

        addToast({
          message: 'Meal plan created successfully!',
          type: 'success',
          duration: 3000,
        });

        return newPlan;
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to create meal plan',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mealPlans, setMealPlans, addToast],
  );

  const updatePlan = useCallback(
    async (id: string, data: Partial<MealPlan>) => {
      try {
        setLoading(true);
        const updatedPlan = await planService.updatePlan(id, data);

        setMealPlans(
          mealPlans.map(plan => (plan._id === id ? updatedPlan : plan)),
        );

        if (selectedPlan?._id === id) {
          setSelectedPlan(updatedPlan);
        }

        if (currentWeekPlan?._id === id) {
          setCurrentWeekPlan(updatedPlan);
        }

        addToast({
          message: 'Meal plan updated successfully!',
          type: 'success',
          duration: 3000,
        });

        return updatedPlan;
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to update meal plan',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [
      mealPlans,
      selectedPlan,
      currentWeekPlan,
      setMealPlans,
      setSelectedPlan,
      setCurrentWeekPlan,
      addToast,
    ],
  );

  const deletePlan = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await planService.deletePlan(id);

        setMealPlans(mealPlans.filter(plan => plan._id !== id));

        if (selectedPlan?._id === id) {
          setSelectedPlan(null);
        }

        if (currentWeekPlan?._id === id) {
          setCurrentWeekPlan(null);
        }

        addToast({
          message: 'Meal plan deleted successfully!',
          type: 'success',
          duration: 3000,
        });
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to delete meal plan',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [
      mealPlans,
      selectedPlan,
      currentWeekPlan,
      setMealPlans,
      setSelectedPlan,
      setCurrentWeekPlan,
      addToast,
    ],
  );

  const duplicatePlan = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const duplicatedPlan = await planService.duplicatePlan(id);
        setMealPlans([duplicatedPlan, ...mealPlans]);

        addToast({
          message: 'Meal plan duplicated successfully!',
          type: 'success',
          duration: 3000,
        });

        return duplicatedPlan;
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to duplicate meal plan',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mealPlans, setMealPlans, addToast],
  );

  return {
    mealPlans,
    selectedPlan,
    currentWeekPlan,
    loading,
    fetchPlans,
    fetchPlan,
    createPlan,
    updatePlan,
    deletePlan,
    duplicatePlan,
  };
};
