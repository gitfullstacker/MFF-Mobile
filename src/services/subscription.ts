import { apiClient } from './api';
import { Subscription, SubscriptionStats } from '../types/subscription';

export const subscriptionService = {
  async getSubscriptions(): Promise<Subscription[]> {
    return apiClient.get('/subscriptions');
  },

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    return apiClient.get('/subscriptions/stats');
  },

  async cancelSubscription(id: number): Promise<void> {
    return apiClient.post(`/subscriptions/${id}/cancel`);
  },

  async resumeSubscription(id: number): Promise<void> {
    return apiClient.post(`/subscriptions/${id}/resume`);
  },
};
