import { useCallback, useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { addToastAtom } from '../store';
import { userService } from '../services/user';
import { Plan } from '../types/plan';

export const useActivePlan = () => {
  const [, addToast] = useAtom(addToastAtom);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchActivePlan = useCallback(async () => {
    try {
      setLoading(true);
      const plan = await userService.getActivePlan();
      setActivePlan(plan);
      return plan;
    } catch (error: any) {
      console.error('Error fetching active plan:', error);
      addToast({
        message: error.response?.data?.message || 'Failed to fetch active plan',
        type: 'error',
        duration: 5000,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const setActivePlanById = useCallback(
    async (planId: string) => {
      try {
        setLoading(true);
        const plan = await userService.setActivePlan(planId);
        setActivePlan(plan);

        addToast({
          message: `"${plan.name}" is now your active meal plan!`,
          type: 'success',
          duration: 3000,
        });

        return plan;
      } catch (error: any) {
        console.error('Error setting active plan:', error);
        addToast({
          message: error.response?.data?.message || 'Failed to set active plan',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  const clearActivePlan = useCallback(() => {
    setActivePlan(null);
  }, []);

  return {
    activePlan,
    loading,
    fetchActivePlan,
    setActivePlanById,
    clearActivePlan,
  };
};
