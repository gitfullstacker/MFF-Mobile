import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  if (__DEV__) {
    console.log('📬 Background message received:', {
      title: remoteMessage.notification?.title,
      data: remoteMessage.data,
    });
  }
});

AppRegistry.registerComponent(appName, () => App);
