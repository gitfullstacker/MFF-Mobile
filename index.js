import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

/**
 * Register background/quit message handler.
 * This MUST be called outside of any React component and before AppRegistry.
 * It handles data-only messages received when the app is in the background or killed.
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (__DEV__) {
    console.log('📬 Background message received:', {
      title: remoteMessage.notification?.title,
      data: remoteMessage.data,
    });
  }
  // No need to show a notification here - FCM/APNs handles that automatically
  // for messages that include a "notification" payload.
  // This handler is mainly for data-only messages or custom background processing.
});

AppRegistry.registerComponent(appName, () => App);
