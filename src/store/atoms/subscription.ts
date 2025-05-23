import { atom } from 'jotai';
import { SubscriptionStats } from '../../types/subscription';

// Default subscription stats with empty allowed categories
const defaultSubscriptionStats: SubscriptionStats = {
  status: null,
  name: null,
  expire_date: null,
  paid_date: null,
  total_price: null,
  subscription_id: null,
  product_id: null,
  allowed_category_ids: [],
};

export const subscriptionStatsAtom = atom<SubscriptionStats>(
  defaultSubscriptionStats,
);
