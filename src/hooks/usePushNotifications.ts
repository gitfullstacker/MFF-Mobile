import { useEffect, useRef, useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import {
  getMessaging,
  onTokenRefresh,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
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

export const usePushNotifications = ({
  navigationRef,
}: UsePushNotificationsOptions) => {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [authToken] = useAtom(authTokenAtom);
  const [, setUnreadCount] = useAtom(unreadCountAtom);
  const tokenRegistered = useRef(false);
  const messaging = getMessaging();

  const handleNotificationNavigation = useCallback(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      const data = remoteMessage.data;
      if (!data) return;

      if (data.notification_id) {
        try {
          await notificationService.markAsRead(data.notification_id as string);
        } catch (error) {
          if (__DEV__)
            console.error('Failed to mark notification as read:', error);
        }
      }

      const link = (data.mobile_link as string) || (data.link as string);
      if (!link) return;

      if (link.startsWith('macrofriendlyfood://')) {
        try {
          await Linking.openURL(link);
        } catch (error) {
          if (__DEV__) console.error('Failed to open deep link:', error);
        }
        return;
      }

      try {
        const nav = navigationRef.current;
        if (!nav) return;

        const pathParts = link.replace(/^\//, '').split('/');

        if (pathParts[0] === 'recipes' && pathParts[1]) {
          nav.navigate('RecipeStack', {
            screen: 'RecipeDetail',
            params: { recipeId: pathParts[1] },
          });
        } else if (
          (pathParts[0] === 'meal-plans' || pathParts[0] === 'meal-plan') &&
          pathParts[1]
        ) {
          nav.navigate('MealPlanStack', {
            screen: 'MealPlanDetail',
            params: { planId: pathParts[1] },
          });
        } else {
          const deepLink = `macrofriendlyfood://${link.replace(/^\//, '')}`;
          const canOpen = await Linking.canOpenURL(deepLink);
          if (canOpen) await Linking.openURL(deepLink);
        }
      } catch (error) {
        if (__DEV__)
          console.error('Failed to navigate from notification:', error);
      }
    },
    [navigationRef],
  );

  const registerToken = useCallback(async () => {
    if (tokenRegistered.current) return;
    try {
      const token = await pushNotificationService.getFCMToken();
      if (token) {
        const success = await pushNotificationService.registerDeviceToken(
          token,
        );
        if (success) tokenRegistered.current = true;
      }
    } catch (error) {
      if (__DEV__) console.error('❌ Failed to register FCM token:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && authToken) {
      registerToken();
    } else {
      tokenRegistered.current = false;
    }
  }, [isAuthenticated, authToken, registerToken]);

  // Token refresh
  useEffect(() => {
    const unsubscribe = onTokenRefresh(messaging, async newToken => {
      if (__DEV__)
        console.log(
          '🔄 FCM token refreshed:',
          newToken?.substring(0, 20) + '...',
        );
      if (isAuthenticated && authToken) {
        await pushNotificationService.registerDeviceToken(newToken);
      }
    });
    return unsubscribe;
  }, [isAuthenticated, authToken, messaging]);

  // Foreground notifications
  useEffect(() => {
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      if (__DEV__) {
        console.log('📬 Foreground notification received:', {
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          data: remoteMessage.data,
        });
      }
      try {
        const response = await notificationService.getUnreadCount();
        setUnreadCount(response.count);
      } catch {
        setUnreadCount(prev => prev + 1);
      }
    });
    return unsubscribe;
  }, [setUnreadCount, messaging]);

  // Background notification tap
  useEffect(() => {
    const unsubscribe = onNotificationOpenedApp(messaging, remoteMessage => {
      if (__DEV__) {
        console.log('👆 Notification opened app from background:', {
          title: remoteMessage.notification?.title,
          data: remoteMessage.data,
        });
      }
      setTimeout(() => handleNotificationNavigation(remoteMessage), 500);
    });
    return unsubscribe;
  }, [handleNotificationNavigation, messaging]);

  // Quit-state notification tap
  useEffect(() => {
    const checkInitialNotification = async () => {
      const remoteMessage = await getInitialNotification(messaging);
      if (remoteMessage) {
        if (__DEV__) {
          console.log('🚀 App opened from quit state via notification:', {
            title: remoteMessage.notification?.title,
            data: remoteMessage.data,
          });
        }
        setTimeout(() => handleNotificationNavigation(remoteMessage), 1500);
      }
    };
    checkInitialNotification();
  }, [handleNotificationNavigation, messaging]);

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
