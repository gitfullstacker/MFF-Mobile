import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import {
  notificationsAtom,
  selectedNotificationAtom,
  unreadCountAtom,
  addToastAtom,
} from '../store';
import { notificationService } from '../services/notificationService';
import { Notification, NotificationFilters } from '../types/notification';

export const useNotifications = () => {
  const [notifications, setNotifications] = useAtom(notificationsAtom);
  const [selectedNotification, setSelectedNotification] = useAtom(
    selectedNotificationAtom,
  );
  const [unreadCount, setUnreadCount] = useAtom(unreadCountAtom);
  const [, addToast] = useAtom(addToastAtom);

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<NotificationFilters>({});

  const fetchNotifications = useCallback(
    async (appliedFilters?: NotificationFilters | null, reset = false) => {
      if (loading && !reset && !refreshing) return;

      try {
        setLoading(true);
        const currentPage = reset ? 0 : page + 1;
        const filtersToUse = appliedFilters || filters;

        const response = await notificationService.getNotifications({
          ...filtersToUse,
          page: currentPage,
          pageSize: 20,
        });

        if (reset) {
          setNotifications(response.data);
          setPage(0);
        } else {
          // Prevent duplicates
          const existingIds = new Set(notifications.map(n => n._id));
          const newNotifications = response.data.filter(
            (notification: Notification) => !existingIds.has(notification._id),
          );
          setNotifications(prev => [...prev, ...newNotifications]);
          setPage(currentPage);
        }

        setHasMore(response.hasMore);
        return response;
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to fetch notifications',
          type: 'error',
          duration: 5000,
        });
        setHasMore(false);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      notifications,
      filters,
      page,
      loading,
      refreshing,
      setNotifications,
      addToast,
    ],
  );

  const fetchNotification = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const notification = await notificationService.getNotification(id);
        setSelectedNotification(notification);
        return notification;
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message || 'Failed to fetch notification',
          type: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setSelectedNotification, addToast],
  );

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.count);
      return response.count;
    } catch (error: any) {
      if (__DEV__) {
        console.error('Error fetching unread count:', error);
      }
      return 0;
    }
  }, [setUnreadCount]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.markAsRead(notificationId);

        // Update local state
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId
              ? { ...notification, is_read: true }
              : notification,
          ),
        );

        // Update selected notification if it's the same one
        if (selectedNotification?._id === notificationId) {
          setSelectedNotification(prev =>
            prev ? { ...prev, is_read: true } : prev,
          );
        }

        // Decrease unread count
        setUnreadCount(prev => Math.max(0, prev - 1));

        return true;
      } catch (error: any) {
        addToast({
          message:
            error.response?.data?.message ||
            'Failed to mark notification as read',
          type: 'error',
          duration: 5000,
        });
        return false;
      }
    },
    [
      setNotifications,
      selectedNotification,
      setSelectedNotification,
      setUnreadCount,
      addToast,
    ],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true })),
      );

      // Update selected notification
      if (selectedNotification) {
        setSelectedNotification(prev =>
          prev ? { ...prev, is_read: true } : prev,
        );
      }

      // Reset unread count
      setUnreadCount(0);

      addToast({
        message: 'All notifications marked as read',
        type: 'success',
        duration: 3000,
      });

      return true;
    } catch (error: any) {
      addToast({
        message:
          error.response?.data?.message ||
          'Failed to mark all notifications as read',
        type: 'error',
        duration: 5000,
      });
      return false;
    }
  }, [
    setNotifications,
    selectedNotification,
    setSelectedNotification,
    setUnreadCount,
    addToast,
  ]);

  const loadMoreNotifications = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications();
    }
  }, [loading, hasMore, fetchNotifications]);

  const refreshNotifications = useCallback(
    async (appliedFilters?: NotificationFilters) => {
      setRefreshing(true);
      await fetchNotifications(appliedFilters || filters, true);
      setRefreshing(false);
    },
    [fetchNotifications, filters],
  );

  const applyFilters = useCallback(
    (newFilters: NotificationFilters) => {
      setFilters(newFilters);
      fetchNotifications(newFilters, true);
    },
    [setFilters, fetchNotifications],
  );

  return {
    notifications,
    selectedNotification,
    unreadCount,
    filters,
    loading,
    refreshing,
    hasMore,
    page,
    fetchNotifications,
    fetchNotification,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    loadMoreNotifications,
    refreshNotifications,
    applyFilters,
  };
};
