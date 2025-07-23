import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AccountStackParamList } from '../types/navigation';
import { SCREEN_NAMES, NAVIGATION_OPTIONS } from '../constants/navigation';
import AccountScreen from '../screens/account/AccountScreen';
import ProfileScreen from '../screens/account/ProfileScreen';
import PreferencesScreen from '../screens/account/PreferencesScreen';
import DownloadsScreen from '../screens/account/DownloadsScreen';
import TicketListScreen from '../screens/support/TicketListScreen';
import TicketCreateScreen from '../screens/support/TicketCreateScreen';
import AboutScreen from '../screens/account/AboutScreen';
import PrivacyScreen from '@/screens/account/PrivacyScreen';
import TermsScreen from '@/screens/account/TermsScreen';
import TicketDetailScreen from '@/screens/support/TicketDetailScreen';

const Stack = createStackNavigator<AccountStackParamList>();

export const AccountNavigator = () => {
  return (
    <Stack.Navigator screenOptions={NAVIGATION_OPTIONS.DEFAULT_SCREEN_OPTIONS}>
      <Stack.Screen name={SCREEN_NAMES.ACCOUNT.MAIN} component={AccountScreen} />
      <Stack.Screen name={SCREEN_NAMES.ACCOUNT.PROFILE} component={ProfileScreen} />
      <Stack.Screen name={SCREEN_NAMES.ACCOUNT.PREFERENCES} component={PreferencesScreen} />
      <Stack.Screen name={SCREEN_NAMES.ACCOUNT.DOWNLOADS} component={DownloadsScreen} />
      <Stack.Screen name={SCREEN_NAMES.ACCOUNT.TICKETS} component={TicketListScreen} />
      <Stack.Screen name={SCREEN_NAMES.ACCOUNT.CREATE_TICKET} component={TicketCreateScreen} />
      <Stack.Screen name={SCREEN_NAMES.ACCOUNT.TICKET_DETAIL} component={TicketDetailScreen} />
      <Stack.Screen name={SCREEN_NAMES.ACCOUNT.ABOUT} component={AboutScreen} />
      <Stack.Screen name={SCREEN_NAMES.ACCOUNT.PRIVACY} component={PrivacyScreen} />
      <Stack.Screen name={SCREEN_NAMES.ACCOUNT.TERMS} component={TermsScreen} />
    </Stack.Navigator>
  );
};