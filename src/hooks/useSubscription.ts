import { useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { subscriptionStatsAtom, addToastAtom } from '../store';
import { subscriptionService } from '../services/subscriptionService';
import { SubscriptionStats } from '../types/subscription';

export const useSubscription = () => {
  const [subscriptionStats, setSubscriptionStats] = useAtom(
    subscriptionStatsAtom,
  );
  const [, addToast] = useAtom(addToastAtom);
  const [loading, setLoading] = useState(false);

  const DEFAULT_STATS: SubscriptionStats = {
    status: null,
    name: null,
    expire_date: null,
    paid_date: null,
    total_price: null,
    subscription_id: null,
    product_id: null,
    allowed_category_ids: [],
  };

  const fetchSubscriptionStats = useCallback(
    async (showToast = false) => {
      setLoading(true);

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
        if (__DEV__) {
          console.error('Error fetching subscription stats:', error);
        }
        setSubscriptionStats(DEFAULT_STATS);

        if (showToast) {
          addToast({
            message: 'Failed to fetch subscription information',
            type: 'error',
            duration: 5000,
          });
        }

        return DEFAULT_STATS;
      } finally {
        setLoading(false);
      }
    },
    [setSubscriptionStats, addToast],
  );

  const isCategoryAllowed = useCallback(
    (categoryId: number) => {
      if (!subscriptionStats) return false;
      return subscriptionStats.allowed_category_ids.includes(categoryId);
    },
    [subscriptionStats],
  );

  const isSubscriptionActive = useCallback(() => {
    return subscriptionStats?.status === 'active';
  }, [subscriptionStats]);

  const formatExpiryDate = useCallback(() => {
    if (!subscriptionStats?.expire_date) return null;
    return new Date(subscriptionStats.expire_date).toLocaleDateString();
  }, [subscriptionStats]);

  const getTimeLeftInSubscription = useCallback(() => {
    if (!subscriptionStats?.expire_date) return null;

    const expireDate = new Date(subscriptionStats.expire_date);
    const now = new Date();
    const diffTime = expireDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  }, [subscriptionStats]);

  const cancelSubscription = useCallback(
    async (subscriptionId: number) => {
      setLoading(true);

      try {
        await subscriptionService.cancelSubscription(subscriptionId);

        if (subscriptionStats) {
          setSubscriptionStats({
            ...subscriptionStats,
            status: 'cancelled',
          });
        }

        addToast({
          message: 'Subscription cancelled successfully',
          type: 'success',
          duration: 3000,
        });

        return true;
      } catch (error: any) {
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
    [subscriptionStats, setSubscriptionStats, addToast],
  );

  const resumeSubscription = useCallback(
    async (subscriptionId: number) => {
      setLoading(true);

      try {
        await subscriptionService.resumeSubscription(subscriptionId);

        if (subscriptionStats) {
          setSubscriptionStats({
            ...subscriptionStats,
            status: 'active',
          });
        }

        addToast({
          message: 'Subscription resumed successfully',
          type: 'success',
          duration: 3000,
        });

        return true;
      } catch (error: any) {
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
    [subscriptionStats, setSubscriptionStats, addToast],
  );

  const getSubscriptions = useCallback(async () => {
    setLoading(true);

    try {
      const subscriptions = await subscriptionService.getSubscriptions();
      return subscriptions;
    } catch (error: any) {
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
    subscriptionStats: subscriptionStats || DEFAULT_STATS,
    allowedCategoryIds: subscriptionStats?.allowed_category_ids || [],
    loading,
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
