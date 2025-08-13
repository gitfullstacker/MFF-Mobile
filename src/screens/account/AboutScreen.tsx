import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
  const { navigateToPrivacy, navigateToTerms } = useNavigationHelpers();

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
    <PageContainer>
      <Header title="About" showBack={true} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {/* App Header */}
        <View style={styles.appHeader}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Macro Friendly Food</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Your comprehensive nutrition tracking and meal planning companion.
            Achieve your health goals with smart macro tracking and delicious
            recipes.
          </Text>
        </View>

        {/* Key Features */}
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
          </View>
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
        </Section>

        {/* Company Info */}
        <Section title="Company">
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>
              J&E Financial, LLC DBA Macro Friendly Food
            </Text>
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
                <Text style={styles.contactText}>
                  189 N Hwy 89 Ste C PMB 1047, North Salt Lake, UT 84054
                </Text>
              </View>
              <View style={styles.contactItem}>
                <Icon name="phone" size={16} color={colors.text.secondary} />
                <Text style={styles.contactText}>801-200-3409</Text>
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
            © 2025 J&E Financial, LLC DBA Macro Friendly Food. All rights
            reserved.
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
    flex: 1,
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
