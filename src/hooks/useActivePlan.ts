import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { activePlanAtom, addToastAtom } from '../store';
import { userService } from '../services/user';

export const useActivePlan = () => {
  const [, addToast] = useAtom(addToastAtom);
  const [activePlan, setActivePlan] = useAtom(activePlanAtom);
  const [loading, setLoading] = useState(false);

  const fetchActivePlan = useCallback(async () => {
    try {
      setLoading(true);
      const plan = await userService.getActivePlan();
      setActivePlan(plan);
      return plan;
    } catch (error: any) {
      console.error('Error fetching active plan:', error);
      // Don't show error toast for missing active plan (it's optional)
      if (error.response?.status !== 404) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to fetch active plan',
          type: 'error',
          duration: 5000,
        });
      }
      setActivePlan(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [addToast, setActivePlan]);

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
    [addToast, setActivePlan],
  );

  return {
    activePlan,
    loading,
    fetchActivePlan,
    setActivePlanById,
  };
};
