import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import { useNavigationHelpers } from '@/hooks/useNavigation';

const AboutScreen: React.FC = () => {
  const { navigateToSupport, navigateToPrivacy, navigateToTerms } =
    useNavigationHelpers();

  const handleOpenWebsite = () => {
    Linking.openURL('https://macrofriendlyfood.com');
  };

  const handleOpenLicenses = () => {
    // In a real app, you might show a modal or navigate to a licenses screen
    Linking.openURL('https://macrofriendlyfood.com/licenses');
  };

  const handleRateApp = () => {
    // Platform-specific app store URLs
    const appStoreUrl = 'https://apps.apple.com/app/macro-friendly-food';
    const playStoreUrl =
      'https://play.google.com/store/apps/details?id=com.macrofriendlyfood';

    // You could detect platform and open appropriate store
    Linking.openURL(appStoreUrl);
  };

  const handleShareApp = () => {
    const shareUrl = 'https://macrofriendlyfood.com/mobile';
    const message = `Check out Macro Friendly Food - the best app for tracking nutrition and meal planning! ${shareUrl}`;

    // Use React Native's Share API
    // Share.share({ message });
    console.log('Share:', message);
  };

  const renderInfoCard = (title: string, content: string, icon: string) => (
    <View style={styles.infoCard}>
      <View style={styles.cardIcon}>
        <Icon name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>{content}</Text>
      </View>
    </View>
  );

  const renderActionCard = (
    title: string,
    description: string,
    icon: string,
    onPress: () => void,
    isExternal = false,
  ) => (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.actionIcon}>
        <Icon name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Icon
        name={isExternal ? 'external-link' : 'chevron-right'}
        size={20}
        color={colors.text.secondary}
      />
    </TouchableOpacity>
  );

  return (
    <PageContainer safeArea={false}>
      <Header title="About" showBack={true} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.appHeader}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Macro Friendly Food</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Your ultimate companion for macro-friendly nutrition tracking and
            meal planning
          </Text>
        </View>

        {/* App Information */}
        <Section title="App Information">
          {renderInfoCard('Build Version', '1.0.0 (Build 001)', 'code')}
          {renderInfoCard('Release Date', 'January 2025', 'calendar')}
          {renderInfoCard('Platform', 'iOS & Android', 'smartphone')}
          {renderInfoCard('Size', '~50 MB', 'download')}
        </Section>

        {/* Features */}
        <Section title="Key Features">
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Icon name="search" size={20} color={colors.semantic.success} />
              <Text style={styles.featureText}>Recipe Discovery & Search</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="calendar" size={20} color={colors.semantic.success} />
              <Text style={styles.featureText}>Advanced Meal Planning</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon
                name="bar-chart-2"
                size={20}
                color={colors.semantic.success}
              />
              <Text style={styles.featureText}>Macro Tracking & Analysis</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon
                name="shopping-cart"
                size={20}
                color={colors.semantic.success}
              />
              <Text style={styles.featureText}>Smart Shopping Lists</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="heart" size={20} color={colors.semantic.success} />
              <Text style={styles.featureText}>Favorite Recipes</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="download" size={20} color={colors.semantic.success} />
              <Text style={styles.featureText}>Offline Recipe Access</Text>
            </View>
          </View>
        </Section>

        {/* Actions */}
        <Section title="Actions">
          {renderActionCard(
            'Visit Website',
            'Learn more about Macro Friendly Food',
            'globe',
            handleOpenWebsite,
            true,
          )}
          {renderActionCard(
            'Rate This App',
            'Help us improve by leaving a review',
            'star',
            handleRateApp,
            true,
          )}
          {renderActionCard(
            'Share App',
            'Tell your friends about this app',
            'share-2',
            handleShareApp,
          )}
          {renderActionCard(
            'Contact Support',
            'Get help or report issues',
            'help-circle',
            navigateToSupport,
          )}
        </Section>

        {/* Legal */}
        <Section title="Legal">
          {renderActionCard(
            'Privacy Policy',
            'How we handle your data',
            'shield',
            navigateToPrivacy,
          )}
          {renderActionCard(
            'Terms of Service',
            'Terms and conditions of use',
            'file-text',
            navigateToTerms,
          )}
          {renderActionCard(
            'Open Source Licenses',
            'Third-party software licenses',
            'code',
            handleOpenLicenses,
            true,
          )}
        </Section>

        {/* Company Info */}
        <Section title="Company">
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Macro Friendly Food Inc.</Text>
            <Text style={styles.companyDescription}>
              We're passionate about making healthy eating simple and
              accessible. Our mission is to help you achieve your nutrition
              goals through smart meal planning and macro tracking.
            </Text>

            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Icon name="mail" size={16} color={colors.text.secondary} />
                <Text style={styles.contactText}>
                  contact@macrofriendlyfood.com
                </Text>
              </View>
              <View style={styles.contactItem}>
                <Icon name="map-pin" size={16} color={colors.text.secondary} />
                <Text style={styles.contactText}>San Francisco, CA</Text>
              </View>
            </View>
          </View>
        </Section>

        {/* Credits */}
        <Section title="Credits">
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsText}>
              Icons by Feather Icons{'\n'}
              Images from Unsplash{'\n'}
              Built with React Native{'\n'}
              Powered by passion for healthy living
            </Text>
          </View>
        </Section>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for healthy living</Text>
          <Text style={styles.copyrightText}>
            © 2025 Macro Friendly Food Inc. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // App Header
  appHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  appLogo: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
    tintColor: colors.primary,
  },
  appName: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  appVersion: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  appDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Info Cards
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  cardText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },

  // Action Cards
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  actionDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },

  // Features
  featuresContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },

  // Company Info
  companyInfo: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  companyName: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.sm,
  },
  companyDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  contactInfo: {
    marginTop: spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  contactText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },

  // Credits
  creditsContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  creditsText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  footerText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  copyrightText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default AboutScreen;
