import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import {
  plansAtom,
  selectedPlanAtom,
  suggestedPlanAtom,
  addToastAtom,
  favoriteRecipeIdsAtom,
} from '../store';
import { planService } from '../services/plan';
import {
  Plan,
  CreatePlanRequest,
  PlanFilters,
  PlanSchedule,
} from '../types/plan';

export const usePlans = () => {
  const [plans, setPlans] = useAtom(plansAtom);
  const [selectedPlan, setSelectedPlan] = useAtom(selectedPlanAtom);
  const [suggestedPlan, setSuggestedPlan] = useAtom(suggestedPlanAtom);
  const [favoriteIds] = useAtom(favoriteRecipeIdsAtom);
  const [, addToast] = useAtom(addToastAtom);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<PlanFilters>({});

  const fetchPlans = useCallback(
    async (appliedFilters?: PlanFilters, reset = false) => {
      try {
        if (loading && !reset) return;

        setLoading(true);

        const page = reset ? 0 : currentPage + 1;
        const filtersToUse = appliedFilters || filters;

        const response = await planService.getPlans({
          page,
          pageSize: 10,
          ...filtersToUse,
        });

        if (reset) {
          setPlans(response.data);
          setCurrentPage(0);
        } else {
          // Prevent duplicates when adding new data
          const existingIds = new Set(plans.map(p => p._id));
          const newPlans = response.data.filter(
            (plan: Plan) => !existingIds.has(plan._id),
          );
          setPlans(prev => [...prev, ...newPlans]);
          setCurrentPage(page);
        }

        setHasMore(response.hasMore);
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to fetch meal plans',
          type: 'error',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, currentPage, plans, setPlans, addToast, filters],
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
    async (planData: CreatePlanRequest) => {
      try {
        setLoading(true);
        const newPlan = await planService.createPlan(planData);
        setPlans(prev => [newPlan, ...prev]);

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
    [setPlans, addToast],
  );

  const updatePlan = useCallback(
    async (id: string, planData: Partial<Plan>) => {
      try {
        setLoading(true);
        const updatedPlan = await planService.updatePlan(id, planData);

        setPlans(prev =>
          prev.map(plan => (plan._id === id ? updatedPlan : plan)),
        );

        setSelectedPlan(current =>
          current?._id === id ? updatedPlan : current,
        );

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
    [setPlans, setSelectedPlan, addToast],
  );

  const deletePlan = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await planService.deletePlan(id);

        setPlans(prev => prev.filter(plan => plan._id !== id));

        setSelectedPlan(current => (current?._id === id ? null : current));

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
    [setPlans, setSelectedPlan, addToast],
  );

  const duplicatePlan = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const duplicatedPlan = await planService.duplicatePlan(id);
        setPlans(prev => [duplicatedPlan, ...prev]);

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
    [setPlans, addToast],
  );

  const fetchSuggestedMealPlan = useCallback(async () => {
    try {
      setLoading(true);
      const plan = await planService.getSuggestedMealPlan();

      // Update favorite status for recipes in the suggested plan
      if (plan && plan.schedule) {
        const updatedSchedule = { ...plan.schedule };

        Object.keys(updatedSchedule).forEach(dayKey => {
          const daySchedule = updatedSchedule[dayKey as keyof PlanSchedule];
          if (Array.isArray(daySchedule)) {
            daySchedule.forEach(scheduledRecipe => {
              if (
                typeof scheduledRecipe.recipe === 'object' &&
                scheduledRecipe.recipe
              ) {
                scheduledRecipe.recipe.is_favorite = favoriteIds.includes(
                  scheduledRecipe.recipe._id,
                );
              }
            });
          }
        });

        const updatedPlan = {
          ...plan,
          schedule: updatedSchedule,
        };

        setSuggestedPlan(updatedPlan);
        return updatedPlan;
      }

      setSuggestedPlan(plan);
      return plan;
    } catch (error: any) {
      console.error('Error fetching suggested meal plan:', error);
      addToast({
        message:
          error.response?.data?.message ||
          'Failed to fetch suggested meal plan',
        type: 'error',
        duration: 5000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setSuggestedPlan, addToast, favoriteIds]);

  const applyFilters = useCallback(
    (newFilters: PlanFilters) => {
      setFilters(newFilters);
      fetchPlans(newFilters, true);
    },
    [fetchPlans],
  );

  return {
    plans,
    selectedPlan,
    suggestedPlan,
    filters,
    loading,
    hasMore,
    fetchPlans,
    fetchPlan,
    createPlan,
    updatePlan,
    deletePlan,
    duplicatePlan,
    applyFilters,
    fetchSuggestedMealPlan,
  };
};
