import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { AccountStackParamList } from './types';
import AccountScreen from '../screens/account/AccountScreen';
import ProfileScreen from '../screens/account/ProfileScreen';
import PreferencesScreen from '../screens/account/PreferencesScreen';
import SubscriptionScreen from '../screens/account/SubscriptionScreen';
import DownloadsScreen from '../screens/account/DownloadsScreen';
import SupportScreen from '../screens/support/SupportScreen';
import TicketListScreen from '../screens/support/TicketListScreen';
import TicketCreateScreen from '../screens/support/TicketCreateScreen';
import AboutScreen from '../screens/account/AboutScreen';
import { PageContainer } from '../components/layout/PageContainer';
import { Header } from '../components/navigation/Header';
import { colors, typography, spacing } from '../theme';

// Temporary placeholder component for screens not yet created
const PlaceholderScreen: React.FC<{ title: string }> = ({ title }) => {
  return (
    <PageContainer safeArea={false}>
      <Header title={title} showBack={true} />
      <View style={styles.container}>
        <Text style={styles.text}>This screen is coming soon!</Text>
      </View>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  text: {
    ...typography.h5,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

// Placeholder screens for features not yet implemented
const TicketDetailScreen = () => <PlaceholderScreen title="Ticket Details" />;
const PrivacyScreen = () => <PlaceholderScreen title="Privacy Policy" />;
const TermsScreen = () => <PlaceholderScreen title="Terms of Service" />;

const Stack = createStackNavigator<AccountStackParamList>();

export const AccountNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="AccountMain" component={AccountScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Downloads" component={DownloadsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Tickets" component={TicketListScreen} />
      <Stack.Screen name="CreateTicket" component={TicketCreateScreen} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
    </Stack.Navigator>
  );
};
