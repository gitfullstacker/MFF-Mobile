import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { plansAtom, selectedPlanAtom, addToastAtom } from '../store';
import { planService } from '../services/plan';
import { Plan, CreatePlanRequest, PlanFilters } from '../types/plan';

export const usePlans = () => {
  const [plans, setPlans] = useAtom(plansAtom);
  const [selectedPlan, setSelectedPlan] = useAtom(selectedPlanAtom);
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
        const pageSize = 20;
        const filtersToUse = appliedFilters || filters;

        const response = await planService.getPlans({
          page,
          pageSize,
          search: filtersToUse.search,
        });

        const { data, hasMore: responseHasMore } = response;

        if (reset) {
          setPlans(data);
          setCurrentPage(0);
        } else {
          // Prevent duplicates when adding new data
          const existingIds = new Set(plans.map(p => p._id));
          const newPlans = data.filter(plan => !existingIds.has(plan._id));
          setPlans(prev => [...prev, ...newPlans]);
          setCurrentPage(page);
        }

        // Update hasMore from backend response
        setHasMore(responseHasMore);

        return response;
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to fetch meal plans',
          type: 'error',
          duration: 5000,
        });
        setHasMore(false);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setPlans, addToast, loading, plans, currentPage, filters],
  );

  const applyFilters = useCallback(
    (newFilters: PlanFilters) => {
      setFilters(newFilters);
      fetchPlans(newFilters, true);
    },
    [setFilters, fetchPlans],
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
    async (id: string, data: Partial<Plan>) => {
      try {
        setLoading(true);
        const updatedPlan = await planService.updatePlan(id, data);

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
      const suggestedPlan = await planService.getSuggestedMealPlan();
      return suggestedPlan;
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
  }, [addToast]);

  return {
    plans,
    selectedPlan,
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
