import { apiClient } from './api';
import { Notification, NotificationFilters } from '../types/notification';
import { PaginatedResponse } from '../types/common';

export const notificationService = {
  async getNotifications(
    filters?: NotificationFilters,
  ): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    return apiClient.get(`/notifications?${params.toString()}`);
  },

  async getUnreadCount(): Promise<{ count: number }> {
    return apiClient.get('/notifications/unread-count');
  },

  async getNotification(id: string): Promise<Notification> {
    return apiClient.get(`/notifications/${id}`);
  },

  async markAsRead(notificationId: string): Promise<void> {
    return apiClient.post(`/notifications/${notificationId}/mark-read`);
  },

  async markAllAsRead(): Promise<{ marked: number }> {
    return apiClient.post('/notifications/mark-all-read');
  },
};
