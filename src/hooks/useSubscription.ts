import { useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { subscriptionStatsAtom, addToastAtom } from '../store';
import { subscriptionService } from '../services/subscription';
import { SubscriptionStats } from '../types/subscription';

export const useSubscription = () => {
  const [subscriptionStats, setSubscriptionStats] = useAtom(
    subscriptionStatsAtom,
  );
  const [, addToast] = useAtom(addToastAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default empty subscription stats with empty allowed categories
  const defaultStats: SubscriptionStats = {
    status: null,
    name: null,
    expire_date: null,
    paid_date: null,
    total_price: null,
    subscription_id: null,
    product_id: null,
    allowed_category_ids: [],
  };

  // Fetch subscription stats
  const fetchSubscriptionStats = useCallback(
    async (showToast = false) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const stats = await subscriptionService.getSubscriptionStats();
        setSubscriptionStats(stats);

        if (showToast) {
          addToast({
            message: 'Subscription information updated',
            type: 'success',
            duration: 3000,
          });
        }

        return stats;
      } catch (error: any) {
        console.error('Error fetching subscription stats:', error);
        setError(
          error.response?.data?.message ||
            'Failed to fetch subscription information',
        );

        setSubscriptionStats(defaultStats);

        if (showToast) {
          addToast({
            message: 'Failed to fetch subscription information',
            type: 'error',
            duration: 5000,
          });
        }

        return defaultStats;
      } finally {
        setLoading(false);
      }
    },
    [setSubscriptionStats, addToast],
  );

  // Check if a specific category ID is allowed by the subscription
  const isCategoryAllowed = useCallback(
    (categoryId: number) => {
      if (!subscriptionStats) return false;
      return subscriptionStats.allowed_category_ids.includes(categoryId);
    },
    [subscriptionStats],
  );

  // Check if subscription is active
  const isSubscriptionActive = useCallback(() => {
    if (!subscriptionStats) return false;
    return subscriptionStats.status === 'active';
  }, [subscriptionStats]);

  // Format expiry date
  const formatExpiryDate = useCallback(() => {
    if (!subscriptionStats?.expire_date) return 'No expiration date';

    try {
      const expireDate = new Date(subscriptionStats.expire_date);
      return expireDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  }, [subscriptionStats]);

  // Get time left in subscription
  const getTimeLeftInSubscription = useCallback(() => {
    if (!subscriptionStats?.expire_date) return null;

    try {
      const expireDate = new Date(subscriptionStats.expire_date);
      const now = new Date();
      const diffTime = expireDate.getTime() - now.getTime();

      // If expired
      if (diffTime <= 0) return 'Expired';

      // Calculate days left
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 30) {
        const diffMonths = Math.floor(diffDays / 30);
        return `${diffMonths} month${diffMonths > 1 ? 's' : ''} left`;
      }

      return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
    } catch (error) {
      return null;
    }
  }, [subscriptionStats]);

  // Cancel subscription
  const cancelSubscription = useCallback(
    async (subscriptionId: number) => {
      setLoading(true);
      setError(null);

      try {
        await subscriptionService.cancelSubscription(subscriptionId);
        // Refresh subscription stats after cancellation
        await fetchSubscriptionStats();

        addToast({
          message: 'Subscription cancelled successfully',
          type: 'success',
          duration: 3000,
        });

        return true;
      } catch (error: any) {
        console.error('Error cancelling subscription:', error);
        setError(
          error.response?.data?.message || 'Failed to cancel subscription',
        );

        addToast({
          message:
            error.response?.data?.message || 'Failed to cancel subscription',
          type: 'error',
          duration: 5000,
        });

        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchSubscriptionStats, addToast],
  );

  // Resume subscription
  const resumeSubscription = useCallback(
    async (subscriptionId: number) => {
      setLoading(true);
      setError(null);

      try {
        await subscriptionService.resumeSubscription(subscriptionId);
        // Refresh subscription stats after resuming
        await fetchSubscriptionStats();

        addToast({
          message: 'Subscription resumed successfully',
          type: 'success',
          duration: 3000,
        });

        return true;
      } catch (error: any) {
        console.error('Error resuming subscription:', error);
        setError(
          error.response?.data?.message || 'Failed to resume subscription',
        );

        addToast({
          message:
            error.response?.data?.message || 'Failed to resume subscription',
          type: 'error',
          duration: 5000,
        });

        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchSubscriptionStats, addToast],
  );

  // Get all subscriptions
  const getSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const subscriptions = await subscriptionService.getSubscriptions();
      return subscriptions;
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      setError(
        error.response?.data?.message || 'Failed to fetch subscriptions',
      );

      addToast({
        message:
          error.response?.data?.message || 'Failed to fetch subscriptions',
        type: 'error',
        duration: 5000,
      });

      return [];
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  return {
    subscriptionStats: subscriptionStats || defaultStats,
    allowedCategoryIds: subscriptionStats?.allowed_category_ids || [],
    loading,
    error,
    isSubscriptionActive,
    isCategoryAllowed,
    formatExpiryDate,
    getTimeLeftInSubscription,
    fetchSubscriptionStats,
    cancelSubscription,
    resumeSubscription,
    getSubscriptions,
  };
};
