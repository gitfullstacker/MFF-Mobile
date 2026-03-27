import {
  getMessaging,
  getToken,
  deleteToken,
  getAPNSToken,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  AuthorizationStatus,
  requestPermission,
  hasPermission,
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';

const FCM_TOKEN_KEY = 'fcm_device_token';

const messaging = () => getMessaging();

export const pushNotificationService = {
  /**
   * Request notification permission from the user.
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await requestPermission(messaging());
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (__DEV__) {
        console.log(
          `🔔 Notification permission ${enabled ? 'granted' : 'denied'}:`,
          authStatus,
        );
      }

      return enabled;
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error requesting notification permission:', error);
      }
      return false;
    }
  },

  /**
   * Check if notification permission is already granted.
   */
  async hasPermission(): Promise<boolean> {
    try {
      const authStatus = await hasPermission(messaging());
      return (
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error checking notification permission:', error);
      }
      return false;
    }
  },

  /**
   * Get the FCM device token. Requests permission first if not already granted.
   */
  async getFCMToken(): Promise<string | null> {
    try {
      const permissionGranted = await this.hasPermission();
      if (!permissionGranted) {
        const granted = await this.requestPermission();
        if (!granted) {
          if (__DEV__) {
            console.log(
              '🔔 Notification permission not granted, skipping FCM token',
            );
          }
          return null;
        }
      }

      // iOS: must register for remote messages before calling getToken()
      if (Platform.OS === 'ios') {
        const isRegistered = isDeviceRegisteredForRemoteMessages(messaging());
        if (!isRegistered) {
          await registerDeviceForRemoteMessages(messaging());
          if (__DEV__) {
            console.log('✅ Registered device for remote messages (iOS)');
          }
        }

        const apnsToken = await getAPNSToken(messaging());
        if (!apnsToken && __DEV__) {
          console.log(
            '⚠️ APNs token not yet available, getToken may retry internally',
          );
        }
      }

      const token = await getToken(messaging());

      if (__DEV__) {
        console.log('🔑 FCM Token:', token?.substring(0, 20) + '...');
      }

      if (token) {
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      }

      return token;
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error getting FCM token:', error);
      }
      return null;
    }
  },

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(FCM_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async registerDeviceToken(token: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/device-token', {
        token,
        platform: Platform.OS as 'ios' | 'android',
      });
      if (__DEV__) {
        console.log('✅ Device token registered with backend');
      }
      return true;
    } catch (error: any) {
      if (__DEV__) {
        console.error(
          '❌ Failed to register device token:',
          error?.response?.data || error.message,
        );
      }
      return false;
    }
  },

  async removeDeviceToken(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) return true;

      await apiClient.delete(`/auth/device-token/${token}`);
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
      if (__DEV__) {
        console.log('✅ Device token removed from backend');
      }
      return true;
    } catch (error: any) {
      if (__DEV__) {
        console.error(
          '❌ Failed to remove device token:',
          error?.response?.data || error.message,
        );
      }
      await AsyncStorage.removeItem(FCM_TOKEN_KEY).catch(() => {});
      return false;
    }
  },

  async deleteToken(): Promise<void> {
    try {
      await deleteToken(messaging());
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
      if (__DEV__) {
        console.log('✅ FCM token deleted');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error deleting FCM token:', error);
      }
    }
  },
};
