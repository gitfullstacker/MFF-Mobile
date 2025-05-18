import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { plansAtom, selectedPlanAtom, addToastAtom } from '../store';
import { planService } from '../services/plan';
import { Plan, CreatePlanRequest } from '../types/plan';

export const usePlans = () => {
  const [plans, setPlans] = useAtom(plansAtom);
  const [selectedPlan, setSelectedPlan] = useAtom(selectedPlanAtom);
  const [, addToast] = useAtom(addToastAtom);

  const [loading, setLoading] = useState(false);

  const fetchPlans = useCallback(
    async (page = 0, pageSize = 20) => {
      try {
        setLoading(true);
        const response = await planService.getPlans(page, pageSize);
        setPlans(response.data);

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
    [setPlans, addToast],
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
    async (data: CreatePlanRequest) => {
      try {
        setLoading(true);
        const newPlan = await planService.createPlan(data);
        setPlans([newPlan, ...plans]);

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
    [plans, setPlans, addToast],
  );

  const updatePlan = useCallback(
    async (id: string, data: Partial<Plan>) => {
      try {
        setLoading(true);
        const updatedPlan = await planService.updatePlan(id, data);

        setPlans(plans.map(plan => (plan._id === id ? updatedPlan : plan)));

        if (selectedPlan?._id === id) {
          setSelectedPlan(updatedPlan);
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
    [plans, selectedPlan, setPlans, setSelectedPlan, addToast],
  );

  const deletePlan = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await planService.deletePlan(id);

        setPlans(plans.filter(plan => plan._id !== id));

        if (selectedPlan?._id === id) {
          setSelectedPlan(null);
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
    [plans, selectedPlan, setPlans, setSelectedPlan, addToast],
  );

  const duplicatePlan = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const duplicatedPlan = await planService.duplicatePlan(id);
        setPlans([duplicatedPlan, ...plans]);

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
    [plans, setPlans, addToast],
  );

  return {
    plans,
    selectedPlan,
    loading,
    fetchPlans,
    fetchPlan,
    createPlan,
    updatePlan,
    deletePlan,
    duplicatePlan,
  };
};
