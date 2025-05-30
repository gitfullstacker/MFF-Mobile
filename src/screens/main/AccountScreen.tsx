import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { useAuth } from '../../hooks/useAuth';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
} from '../../theme';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';

type AccountNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Account'>,
  StackNavigationProp<RootStackParamList>
>;

interface MenuItem {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  variant?: 'default' | 'danger';
}

const AccountScreen: React.FC = () => {
  const navigation = useNavigation<AccountNavigationProp>();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
      { cancelable: false },
    );
  };

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.title}
      style={styles.menuItem}
      onPress={item.onPress}>
      <View
        style={[
          styles.menuItemIcon,
          item.variant === 'danger' && styles.menuItemIconDanger,
        ]}>
        <Icon
          name={item.icon}
          size={24}
          color={
            item.variant === 'danger' ? colors.semantic.error : colors.primary
          }
        />
      </View>
      <View style={styles.menuItemContent}>
        <Text
          style={[
            styles.menuItemTitle,
            item.variant === 'danger' && styles.menuItemTitleDanger,
          ]}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      {item.showArrow && (
        <Icon name="chevron-right" size={20} color={colors.text.secondary} />
      )}
    </TouchableOpacity>
  );

  const profileMenuItems: MenuItem[] = [
    {
      icon: 'user',
      title: 'Profile',
      subtitle: 'Manage your personal information',
      onPress: () => navigation.navigate('AccountStack', { screen: 'Profile' }),
      showArrow: true,
    },
    {
      icon: 'settings',
      title: 'Preferences',
      subtitle: 'Macro targets & notifications',
      onPress: () =>
        navigation.navigate('AccountStack', { screen: 'Preferences' }),
      showArrow: true,
    },
  ];

  const subscriptionMenuItems: MenuItem[] = [
    {
      icon: 'credit-card',
      title: 'Subscription',
      subtitle: 'Manage your subscription & billing',
      onPress: () =>
        navigation.navigate('AccountStack', { screen: 'Subscription' }),
      showArrow: true,
    },
    {
      icon: 'download',
      title: 'Downloads',
      subtitle: 'Access your downloaded content',
      onPress: () =>
        navigation.navigate('AccountStack', { screen: 'Downloads' }),
      showArrow: true,
    },
  ];

  const supportMenuItems: MenuItem[] = [
    {
      icon: 'help-circle',
      title: 'Help Center',
      subtitle: 'Get help and find answers',
      onPress: () => navigation.navigate('AccountStack', { screen: 'Support' }),
      showArrow: true,
    },
    {
      icon: 'message-square',
      title: 'Support Tickets',
      subtitle: 'View and manage your tickets',
      onPress: () => navigation.navigate('AccountStack', { screen: 'Tickets' }),
      showArrow: true,
    },
  ];

  const appMenuItems: MenuItem[] = [
    {
      icon: 'info',
      title: 'About',
      subtitle: 'App version and information',
      onPress: () => navigation.navigate('AccountStack', { screen: 'About' }),
      showArrow: true,
    },
    {
      icon: 'shield',
      title: 'Privacy Policy',
      subtitle: 'How we handle your data',
      onPress: () => navigation.navigate('AccountStack', { screen: 'Privacy' }),
      showArrow: true,
    },
    {
      icon: 'file-text',
      title: 'Terms of Service',
      subtitle: 'Terms and conditions',
      onPress: () => navigation.navigate('AccountStack', { screen: 'Terms' }),
      showArrow: true,
    },
  ];

  const dangerMenuItems: MenuItem[] = [
    {
      icon: 'log-out',
      title: 'Logout',
      onPress: handleLogout,
      variant: 'danger',
    },
  ];

  return (
    <PageContainer safeArea={false}>
      <Header title="Account" showBack={false} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="user" size={40} color={colors.white} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Menu Sections */}
        <Section title="Profile">
          {profileMenuItems.map(renderMenuItem)}
        </Section>

        <Section title="Subscription">
          {subscriptionMenuItems.map(renderMenuItem)}
        </Section>

        <Section title="Support">
          {supportMenuItems.map(renderMenuItem)}
        </Section>

        <Section title="App">{appMenuItems.map(renderMenuItem)}</Section>

        <Section>{dangerMenuItems.map(renderMenuItem)}</Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    marginBottom: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemIconDanger: {
    backgroundColor: colors.semantic.error + '20',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.medium,
  },
  menuItemTitleDanger: {
    color: colors.semantic.error,
  },
  menuItemSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});

export default AccountScreen;
