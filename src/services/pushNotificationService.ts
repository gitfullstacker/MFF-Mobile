import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';

const FCM_TOKEN_KEY = 'fcm_device_token';

export const pushNotificationService = {
  /**
   * Request notification permission from the user.
   * On Android 13+ (API 33), this triggers the POST_NOTIFICATIONS permission dialog.
   * On iOS, this triggers the standard notification permission dialog.
   * Returns true if permission was granted.
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

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
      const authStatus = await messaging().hasPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
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
   * Returns null if permission is denied or token retrieval fails.
   */
  async getFCMToken(): Promise<string | null> {
    try {
      // Check/request permission
      const hasPermission = await this.hasPermission();
      if (!hasPermission) {
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

      // On iOS, ensure APNs token is available before getting FCM token
      if (Platform.OS === 'ios') {
        const apnsToken = await messaging().getAPNSToken();
        if (!apnsToken) {
          if (__DEV__) {
            console.log('⏳ Waiting for APNs token...');
          }
          // APNs token might not be ready yet; FCM will retry internally
        }
      }

      const token = await messaging().getToken();

      if (__DEV__) {
        console.log('🔑 FCM Token:', token?.substring(0, 20) + '...');
      }

      // Store token locally
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

  /**
   * Get the locally stored FCM token (without requesting a new one).
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(FCM_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Register the FCM device token with the backend.
   * Should be called after login and whenever the token refreshes.
   */
  async registerDeviceToken(token: string): Promise<boolean> {
    try {
      const platform = Platform.OS as 'ios' | 'android';

      await apiClient.post('/auth/device-token', {
        token,
        platform,
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

  /**
   * Remove the FCM device token from the backend.
   * Should be called on logout.
   */
  async removeDeviceToken(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) {
        if (__DEV__) {
          console.log('ℹ️ No stored token to remove');
        }
        return true;
      }

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
      // Still remove locally even if backend call fails
      await AsyncStorage.removeItem(FCM_TOKEN_KEY).catch(() => {});
      return false;
    }
  },

  /**
   * Delete the FCM token from Firebase and local storage.
   * This is useful if you want to force a new token to be generated.
   */
  async deleteToken(): Promise<void> {
    try {
      await messaging().deleteToken();
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
