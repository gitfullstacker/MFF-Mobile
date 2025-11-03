import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { useNavigationHelpers } from '@/hooks/useNavigation';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';

interface NotificationIconProps {
  style?: any;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
  style,
}) => {
  const navigation = useNavigation();
  const { navigateToMainTab } = useNavigationHelpers();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [modalVisible, setModalVisible] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<
    Notification[]
  >([]);

  // Fetch unread count on mount and set up periodic refresh
  useEffect(() => {
    fetchUnreadCount();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch recent notifications when modal opens
  useEffect(() => {
    if (modalVisible) {
      fetchRecentNotifications();
    }
  }, [modalVisible]);

  const fetchRecentNotifications = useCallback(async () => {
    try {
      const response = await fetchNotifications({
        page: 0,
        pageSize: 5,
        unreadOnly: false,
      });

      if (response?.data) {
        console.log(response.data)
        setRecentNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
    }
  }, [fetchNotifications]);

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      try {
        // Mark as read if unread
        if (!notification.is_read) {
          await markAsRead(notification._id);
        }

        // Close modal
        setModalVisible(false);

        // Handle navigation based on link
        if (notification.link) {
          // Check if it's a component link (numeric string)
          if (/^\d+$/.test(notification.link)) {
            // For component links, you might want to show a specific modal or navigate to a feature
            // For now, we'll just show an alert
            Alert.alert('Feature Notification', notification.title, [
              { text: 'OK' },
            ]);
          } else {
            // For regular links, navigate within the app
            // You can extend this to handle different link patterns
            if (notification.link.startsWith('/')) {
              // Internal app routes
              // navigation.navigate(notification.link.substring(1) as any);
            } else {
              // External links could be handled with Linking.openURL
              console.log('External link:', notification.link);
            }
          }
        }
      } catch (error) {
        console.error('Error handling notification press:', error);
      }
    },
    [markAsRead, navigation],
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllAsRead();
      // Refresh recent notifications to show updated read status
      await fetchRecentNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [markAllAsRead, fetchRecentNotifications]);

  const handleSeeAllNotifications = useCallback(() => {
    setModalVisible(false);
    // Navigate to a dedicated notifications screen if you have one
    // For now, we'll just log this
    console.log('Navigate to all notifications');
  }, []);

  const formatNotificationTime = useCallback((date: Date) => {
    try {
      const notificationDate = new Date(date);
      const now = new Date();
      const diffMs = now.getTime() - notificationDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return format(notificationDate, 'MMM d');
    } catch (error) {
      return 'Unknown';
    }
  }, []);

  const renderNotificationItem = useCallback(
    ({ item }: { item: Notification }) => (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.is_read && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}>
        <View style={styles.notificationIcon}>
          <MaterialIcon name="campaign" size={20} color={colors.primary} />
        </View>

        <View style={styles.notificationContent}>
          <Text
            style={[
              styles.notificationTitle,
              !item.is_read && styles.unreadTitle,
            ]}
            numberOfLines={2}>
            {item.title}
          </Text>

          {item.message && (
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {item.message}
            </Text>
          )}

          <Text style={styles.notificationTime}>
            {formatNotificationTime(item.created_at)}
          </Text>
        </View>

        {!item.is_read && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    ),
    [handleNotificationPress, formatNotificationTime],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon
        name="bell"
        size={48}
        color={colors.text.disabled}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyDescription}>
        You'll see notifications here when they arrive
      </Text>
    </View>
  );

  return (
    <>
      {/* Notification Icon Button */}
      <TouchableOpacity
        style={[styles.iconButton, style]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}>
        <Icon name="bell" size={24} color={colors.text.primary} />

        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount.toString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notifications Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications</Text>

            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.markAllButton}
                  onPress={handleMarkAllRead}>
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Icon name="x" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Loading State */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              {/* Notifications List */}
              {recentNotifications.length > 0 ? (
                <FlatList
                  data={recentNotifications}
                  renderItem={renderNotificationItem}
                  keyExtractor={item => item._id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContainer}
                />
              ) : (
                renderEmptyState()
              )}

              {/* See All Button */}
              {recentNotifications.length > 0 && (
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={handleSeeAllNotifications}>
                  <Text style={styles.seeAllText}>See all notifications</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    ...shadows.sm,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.semantic.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  markAllButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  markAllText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content Styles
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  listContainer: {
    paddingVertical: spacing.sm,
  },

  // Notification Item Styles
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  unreadNotification: {
    backgroundColor: colors.background.light,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
    gap: spacing.xs,
  },
  notificationTitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    lineHeight: 20,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.disabled,
    marginTop: spacing.xs,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
    marginTop: spacing.sm,
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // See All Button
  seeAllButton: {
    margin: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border.dark,
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default NotificationIcon;
