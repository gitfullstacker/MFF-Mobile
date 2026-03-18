import { useEffect, useRef, useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom, authTokenAtom } from '@/store';
import { unreadCountAtom } from '@/store/atoms/notification';
import { pushNotificationService } from '@/services/pushNotificationService';
import { notificationService } from '@/services/notificationService';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@/types/navigation';

interface UsePushNotificationsOptions {
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
}

/**
 * Hook that manages the full push notification lifecycle:
 * - Requests permission and registers FCM token on login
 * - Handles foreground notifications (updates unread count)
 * - Handles background/quit notification taps (deep link navigation)
 * - Listens for token refresh and re-registers with backend
 * - Cleans up token on logout
 */
export const usePushNotifications = ({
  navigationRef,
}: UsePushNotificationsOptions) => {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [authToken] = useAtom(authTokenAtom);
  const [, setUnreadCount] = useAtom(unreadCountAtom);
  const tokenRegistered = useRef(false);

  /**
   * Handle deep link navigation from a notification tap.
   * Supports both mobile_link (custom scheme) and link (web path) formats.
   */
  const handleNotificationNavigation = useCallback(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      const data = remoteMessage.data;
      if (!data) return;

      // Mark the notification as read if we have a notification_id
      if (data.notification_id) {
        try {
          await notificationService.markAsRead(data.notification_id as string);
        } catch (error) {
          if (__DEV__) {
            console.error('Failed to mark notification as read:', error);
          }
        }
      }

      // Determine the link to navigate to
      const link = (data.mobile_link as string) || (data.link as string);
      if (!link) return;

      // If it's a deep link with custom scheme, use Linking
      if (link.startsWith('macrofriendlyfood://')) {
        try {
          await Linking.openURL(link);
        } catch (error) {
          if (__DEV__) {
            console.error('Failed to open deep link:', error);
          }
        }
        return;
      }

      // For relative paths like /recipes/abc, try to navigate using the navigation ref
      // This maps backend paths to app screens
      try {
        const nav = navigationRef.current;
        if (!nav) return;

        // Parse the path and navigate accordingly
        // Examples: /recipes/abc → RecipeDetail, /meal-plans/xyz → MealPlanDetail
        const pathParts = link.replace(/^\//, '').split('/');

        if (pathParts[0] === 'recipes' && pathParts[1]) {
          // Navigate to recipe detail
          nav.navigate('RecipeStack', {
            screen: 'RecipeDetail',
            params: { recipeId: pathParts[1] },
          });
        } else if (
          (pathParts[0] === 'meal-plans' || pathParts[0] === 'meal-plan') &&
          pathParts[1]
        ) {
          // Navigate to meal plan detail
          nav.navigate('MealPlanStack', {
            screen: 'MealPlanDetail',
            params: { planId: pathParts[1] },
          });
        } else {
          // Fallback: try opening as a deep link with the app scheme
          const deepLink = `macrofriendlyfood://${link.replace(/^\//, '')}`;
          const canOpen = await Linking.canOpenURL(deepLink);
          if (canOpen) {
            await Linking.openURL(deepLink);
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to navigate from notification:', error);
        }
      }
    },
    [navigationRef],
  );

  /**
   * Register FCM token with the backend when user is authenticated.
   */
  const registerToken = useCallback(async () => {
    if (tokenRegistered.current) return;

    try {
      const token = await pushNotificationService.getFCMToken();
      if (token) {
        const success = await pushNotificationService.registerDeviceToken(
          token,
        );
        if (success) {
          tokenRegistered.current = true;
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to register FCM token:', error);
      }
    }
  }, []);

  /**
   * Effect: Register token when user becomes authenticated
   */
  useEffect(() => {
    if (isAuthenticated && authToken) {
      registerToken();
    } else {
      // Reset flag when user logs out so token is re-registered on next login
      tokenRegistered.current = false;
    }
  }, [isAuthenticated, authToken, registerToken]);

  /**
   * Effect: Listen for token refresh events.
   * Firebase may refresh the token at any time; we need to re-register it.
   */
  useEffect(() => {
    const unsubscribe = messaging().onTokenRefresh(async newToken => {
      if (__DEV__) {
        console.log(
          '🔄 FCM token refreshed:',
          newToken?.substring(0, 20) + '...',
        );
      }

      if (isAuthenticated && authToken) {
        await pushNotificationService.registerDeviceToken(newToken);
      }
    });

    return unsubscribe;
  }, [isAuthenticated, authToken]);

  /**
   * Effect: Handle foreground notifications.
   * When a notification arrives while the app is in the foreground,
   * we update the unread count. The actual banner display is handled
   * by the native side (AppDelegate / Android channel).
   */
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (__DEV__) {
        console.log('📬 Foreground notification received:', {
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          data: remoteMessage.data,
        });
      }

      // Update unread count by fetching from backend
      try {
        const response = await notificationService.getUnreadCount();
        setUnreadCount(response.count);
      } catch (error) {
        // Fallback: just increment locally
        setUnreadCount(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, [setUnreadCount]);

  /**
   * Effect: Handle notification tap when app is in background (but not killed).
   * This fires when the user taps a notification and the app comes to foreground.
   */
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      if (__DEV__) {
        console.log('👆 Notification opened app from background:', {
          title: remoteMessage.notification?.title,
          data: remoteMessage.data,
        });
      }

      // Small delay to ensure navigation is ready
      setTimeout(() => {
        handleNotificationNavigation(remoteMessage);
      }, 500);
    });

    return unsubscribe;
  }, [handleNotificationNavigation]);

  /**
   * Effect: Check if the app was opened from a killed/quit state
   * by tapping a notification. This only fires once on app launch.
   */
  useEffect(() => {
    const checkInitialNotification = async () => {
      const remoteMessage = await messaging().getInitialNotification();

      if (remoteMessage) {
        if (__DEV__) {
          console.log('🚀 App opened from quit state via notification:', {
            title: remoteMessage.notification?.title,
            data: remoteMessage.data,
          });
        }

        // Longer delay for quit state since navigation takes time to mount
        setTimeout(() => {
          handleNotificationNavigation(remoteMessage);
        }, 1500);
      }
    };

    checkInitialNotification();
  }, [handleNotificationNavigation]);

  /**
   * Effect: Register background message handler.
   * NOTE: The actual handler must be registered outside of React components,
   * typically in index.js. This effect is here for documentation purposes.
   * The real handler is in index.js via messaging().setBackgroundMessageHandler().
   */

  return {
    registerToken,
    requestPermission: pushNotificationService.requestPermission.bind(
      pushNotificationService,
    ),
    removeDeviceToken: pushNotificationService.removeDeviceToken.bind(
      pushNotificationService,
    ),
  };
};
