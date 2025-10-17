import { useState, useCallback } from 'react';
import { dietaryPreferenceService } from '../services/dietaryPreferenceService';
import {
  DietaryPreferenceItem,
  DietaryPreferenceStats,
  DietaryPreferenceFilters,
  AddDietaryPreferenceRequest,
} from '../types/dietaryPreference';

export const useDietaryPreferences = () => {
  const [preferences, setPreferences] = useState<DietaryPreferenceItem[]>([]);
  const [stats, setStats] = useState<DietaryPreferenceStats>({
    total: 0,
    avoid: 0,
    dislike: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch dietary preferences with optional filters
   */
  const fetchPreferences = useCallback(
    async (filters?: DietaryPreferenceFilters) => {
      try {
        setLoading(true);
        setError(null);
        const response = await dietaryPreferenceService.getDietaryPreferences(
          filters || { page: 0, pageSize: 100 },
        );
        setPreferences(response.data);

        // Also fetch stats
        const statsData = await dietaryPreferenceService.getStats();
        setStats(statsData);

        return response;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to fetch dietary preferences';
        setError(errorMessage);
        if (__DEV__) {
          console.error('Error fetching dietary preferences:', err);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Fetch statistics only
   */
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await dietaryPreferenceService.getStats();
      setStats(statsData);
      return statsData;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch statistics';
      setError(errorMessage);
      if (__DEV__) {
        console.error('Error fetching stats:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a new dietary preference
   */
  const addPreference = useCallback(
    async (data: AddDietaryPreferenceRequest) => {
      try {
        setLoading(true);
        setError(null);
        const response = await dietaryPreferenceService.addDietaryPreference(
          data,
        );

        // Refresh preferences and stats
        await fetchPreferences();

        return response;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to add dietary preference';
        setError(errorMessage);
        if (__DEV__) {
          console.error('Error adding dietary preference:', err);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPreferences],
  );

  /**
   * Remove a dietary preference
   */
  const removePreference = useCallback(
    async (preferenceId: string) => {
      try {
        setLoading(true);
        setError(null);
        await dietaryPreferenceService.removeDietaryPreference(preferenceId);

        // Update local state immediately for better UX
        setPreferences(prev => prev.filter(pref => pref.id !== preferenceId));

        // Refresh stats
        await fetchStats();
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to remove dietary preference';
        setError(errorMessage);
        if (__DEV__) {
          console.error('Error removing dietary preference:', err);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStats],
  );

  /**
   * Remove all dietary preferences
   */
  const removeAllPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await dietaryPreferenceService.removeAllPreferences();

      // Clear local state
      setPreferences([]);
      setStats({ total: 0, avoid: 0, dislike: 0 });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to remove all preferences';
      setError(errorMessage);
      if (__DEV__) {
        console.error('Error removing all preferences:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    preferences,
    stats,
    loading,
    error,
    fetchPreferences,
    fetchStats,
    addPreference,
    removePreference,
    removeAllPreferences,
  };
};
