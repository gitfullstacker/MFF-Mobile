import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Linking,
  RefreshControl,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';
import { colors, shadows, spacing, typography } from '@/theme';
import { WEB_URL } from '@env';

interface NotificationIconProps {
  style?: any;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
  style,
}) => {
  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    hasMore,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    loadMoreNotifications,
    refreshNotifications,
  } = useNotifications();

  const [modalVisible, setModalVisible] = useState(false);

  // Fetch unread count on mount and set up periodic refresh
  useEffect(() => {
    fetchUnreadCount();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when modal opens
  useEffect(() => {
    if (modalVisible) {
      fetchNotifications({}, true);
    }
  }, [modalVisible]);

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      try {
        // Mark as read
        if (!notification.is_read) {
          await markAsRead(notification._id);
        }

        // Close modal
        setModalVisible(false);

        // Build the full URL
        let fullUrl = '';

        if (notification.mobile_link) {
          // Concatenate WEB_URL with mobile_link
          const mobileLinkPath = notification.mobile_link.trim();

          // Remove leading slash if present to avoid double slashes
          const cleanPath = mobileLinkPath.startsWith('/')
            ? mobileLinkPath.slice(1)
            : mobileLinkPath;

          // Ensure WEB_URL doesn't have trailing slash
          const baseUrl = WEB_URL.endsWith('/')
            ? WEB_URL.slice(0, -1)
            : WEB_URL;

          fullUrl = `${baseUrl}/${cleanPath}`;
        } else if (notification.link) {
          // Fallback to regular link if mobile_link is not available
          fullUrl = notification.link.trim();
        }

        if (fullUrl) {
          console.log('Opening URL:', fullUrl);

          // Check if URL can be opened
          const canOpen = await Linking.canOpenURL(fullUrl);

          if (canOpen) {
            await Linking.openURL(fullUrl);
          } else {
            console.error('Cannot open URL:', fullUrl);
          }
        } else {
          console.warn('No link available for notification:', notification._id);
        }
      } catch (error) {
        console.error('Error handling notification press:', error);
      }
    },
    [markAsRead, WEB_URL],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [markAllAsRead, fetchUnreadCount]);

  const handleRefresh = useCallback(async () => {
    await refreshNotifications();
    await fetchUnreadCount();
  }, [refreshNotifications, fetchUnreadCount]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadMoreNotifications();
    }
  }, [loading, hasMore, loadMoreNotifications]);

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
    ({ item }: { item: Notification }) => {
      const notificationBody = item.body || item.message;

      return (
        <TouchableOpacity
          style={[
            styles.notificationItem,
            !item.is_read && styles.unreadNotification,
          ]}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}>
          <View style={styles.notificationIcon}>
            <MaterialIcon
              name="campaign"
              size={20}
              color={!item.is_read ? colors.primary : colors.text.secondary}
            />
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

            {notificationBody ? (
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {notificationBody}
              </Text>
            ) : null}

            <Text style={styles.notificationTime}>
              {formatNotificationTime(item.created_at)}
            </Text>
          </View>

          {!item.is_read && <View style={styles.unreadIndicator} />}
        </TouchableOpacity>
      );
    },
    [handleNotificationPress, formatNotificationTime],
  );

  const renderFooter = useCallback(() => {
    if (!loading) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.footerLoaderText}>Loading more...</Text>
      </View>
    );
  }, [loading]);

  const renderEmpty = useCallback(() => {
    if (loading && notifications.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Icon name="bell-off" size={64} color={colors.text.disabled} />
        </View>
        <Text style={styles.emptyTitle}>No Notifications</Text>
        <Text style={styles.emptyDescription}>
          You're all caught up! New notifications will appear here.
        </Text>
      </View>
    );
  }, [loading, notifications.length]);

  return (
    <>
      {/* Notification Bell Icon */}
      <TouchableOpacity
        style={[styles.iconButton, style]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}>
        <Icon name="bell" size={24} color={colors.text.primary} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notifications Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications</Text>

            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.markAllButton}
                  onPress={handleMarkAllAsRead}
                  activeOpacity={0.7}>
                  <Text style={styles.markAllText}>Mark all as read</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}>
                <Icon name="x" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications List */}
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item._id}
            contentContainerStyle={
              notifications.length === 0
                ? styles.emptyContainer
                : styles.listContainer
            }
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            showsVerticalScrollIndicator={true}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={15}
            windowSize={10}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Icon Button Styles
  iconButton: {
    position: 'relative',
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 1,
    right: 1,
    backgroundColor: colors.red[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    ...shadows.sm,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },

  // Modal Container Styles
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
    paddingTop: Platform.OS === 'ios' ? spacing.xl + spacing.md : spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.light,
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
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
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content Styles
  listContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
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
    marginTop: spacing.sm,
  },

  // Notification Item Styles
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  unreadNotification: {
    backgroundColor: colors.background.light,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.light,
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
    fontWeight: '700',
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

  // Footer Loader
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  footerLoaderText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
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
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
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
});

export default NotificationIcon;
