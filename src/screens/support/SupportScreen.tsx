import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { ThriveDeskModal } from '../../components/modals/ThriveDeskModal';
import { useThriveDesk } from '../../hooks/useThriveDesk';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import { useNavigationHelpers } from '@/hooks/useNavigation';

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  type: 'modal' | 'navigation' | 'external';
  featured?: boolean;
}

const SupportScreen: React.FC = () => {
  const { navigateToTickets } = useNavigationHelpers();

  // ThriveDesk integration
  const {
    modalState,
    hideModal,
    openGeneralSupport,
    openBugReport,
    openFeatureRequest,
    openAccountSupport,
    generateWidgetUrl,
  } = useThriveDesk({
    baseUrl: 'https://your-company.thrivedesk.com',
    defaultDepartment: 'support',
  });

  const handleEmailSupport = () => {
    const email = 'contact@macrofriendlyfood.com';
    const subject = 'Support Request';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        'Email Not Available',
        `Please send your support request to: ${email}`,
        [{ text: 'OK' }],
      );
    });
  };

  const handleOpenFAQ = () => {
    const faqUrl = 'https://macrofriendlyfood.com/faq';
    Linking.openURL(faqUrl).catch(() => {
      Alert.alert('Error', 'Unable to open FAQ page. Please try again later.');
    });
  };

  const handleOpenKnowledgeBase = () => {
    const kbUrl = 'https://help.macrofriendlyfood.com';
    Linking.openURL(kbUrl).catch(() => {
      Alert.alert(
        'Error',
        'Unable to open knowledge base. Please try again later.',
      );
    });
  };

  const handleOpenCommunity = () => {
    const communityUrl = 'https://community.macrofriendlyfood.com';
    Linking.openURL(communityUrl).catch(() => {
      Alert.alert(
        'Error',
        'Unable to open community forum. Please try again later.',
      );
    });
  };

  const supportOptions: SupportOption[] = [
    // Featured live chat option
    {
      id: 'live-chat',
      title: 'Live Chat Support',
      description: 'Get instant help from our support team',
      icon: 'message-circle',
      action: openGeneralSupport,
      type: 'modal',
      featured: true,
    },
    {
      id: 'bug-report',
      title: 'Report a Bug',
      description: 'Found something not working? Let us know',
      icon: 'alert-circle',
      action: () => openBugReport(),
      type: 'modal',
    },
    {
      id: 'feature-request',
      title: 'Request Feature',
      description: 'Suggest new features or improvements',
      icon: 'star',
      action: () => openFeatureRequest(),
      type: 'modal',
    },
    {
      id: 'account-help',
      title: 'Account Support',
      description: 'Account issues',
      icon: 'user',
      action: openAccountSupport,
      type: 'modal',
    },
    {
      id: 'tickets',
      title: 'Support Tickets',
      description: 'View and manage your support tickets',
      icon: 'message-square',
      action: navigateToTickets,
      type: 'navigation',
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us an email for general inquiries',
      icon: 'mail',
      action: handleEmailSupport,
      type: 'external',
    },
  ];

  const resourceOptions: SupportOption[] = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      icon: 'help-circle',
      action: handleOpenFAQ,
      type: 'external',
    },
    {
      id: 'knowledge-base',
      title: 'Knowledge Base',
      description: 'Browse our comprehensive help articles',
      icon: 'book-open',
      action: handleOpenKnowledgeBase,
      type: 'external',
    },
    {
      id: 'community',
      title: 'Community Forum',
      description: 'Connect with other users and get tips',
      icon: 'users',
      action: handleOpenCommunity,
      type: 'external',
    },
  ];

  const renderSupportCard = (option: SupportOption) => {
    const isExternal = option.type === 'external';
    const isFeatured = option.featured;
    const isModal = option.type === 'modal';

    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.supportCard, isFeatured && styles.featuredCard]}
        onPress={option.action}
        activeOpacity={0.7}>
        {isFeatured && (
          <View style={styles.featuredBadge}>
            <Icon name="zap" size={12} color={colors.white} />
            <Text style={styles.featuredBadgeText}>INSTANT</Text>
          </View>
        )}
        <View style={[styles.cardIcon, isFeatured && styles.featuredCardIcon]}>
          <Icon
            name={option.icon}
            size={24}
            color={isFeatured ? colors.white : colors.primary}
          />
        </View>
        <View style={styles.cardContent}>
          <Text
            style={[styles.cardTitle, isFeatured && styles.featuredCardTitle]}>
            {option.title}
          </Text>
          <Text
            style={[
              styles.cardDescription,
              isFeatured && styles.featuredCardDescription,
            ]}>
            {option.description}
          </Text>
          {isModal && (
            <View style={styles.modalIndicator}>
              <Icon
                name="message-square"
                size={12}
                color={isFeatured ? colors.white : colors.primary}
              />
              <Text
                style={[
                  styles.modalIndicatorText,
                  isFeatured && { color: colors.white },
                ]}>
                Opens in-app chat
              </Text>
            </View>
          )}
        </View>
        <View style={styles.cardArrow}>
          <Icon
            name={
              isExternal
                ? 'external-link'
                : isModal
                ? 'message-circle'
                : 'chevron-right'
            }
            size={20}
            color={isFeatured ? colors.white : colors.text.secondary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <PageContainer safeArea={false}>
      <Header title="Support" showBack={true} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>How can we help you?</Text>
          <Text style={styles.headerDescription}>
            Get instant support through live chat or browse our self-help
            resources
          </Text>
        </View>

        {/* Quick Access Section */}
        <View style={styles.quickAccessSection}>
          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={openGeneralSupport}
            activeOpacity={0.9}>
            <View style={styles.quickAccessContent}>
              <View style={styles.quickAccessIcon}>
                <Icon name="message-circle" size={32} color={colors.white} />
              </View>
              <View style={styles.quickAccessText}>
                <Text style={styles.quickAccessTitle}>
                  Need Help Right Now?
                </Text>
                <Text style={styles.quickAccessSubtitle}>
                  Chat with our support team instantly
                </Text>
              </View>
              <View style={styles.quickAccessButton}>
                <Text style={styles.quickAccessButtonText}>Start Chat</Text>
                <Icon name="arrow-right" size={16} color={colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Support Options */}
        <Section title="Get Support">
          {supportOptions.map(renderSupportCard)}
        </Section>

        {/* Resources */}
        <Section title="Self-Help Resources">
          {resourceOptions.map(renderSupportCard)}
        </Section>

        {/* Support Tips */}
        <Section title="Support Tips">
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Icon name="zap" size={20} color={colors.semantic.info} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Live Chat Benefits</Text>
                <Text style={styles.tipDescription}>
                  Get instant responses, screen sharing support, and real-time
                  problem solving.
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Icon name="clock" size={20} color={colors.semantic.warning} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Response Times</Text>
                <Text style={styles.tipDescription}>
                  Live Chat: Instant • Email: 4-6 hours • Tickets: 24-48 hours
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Icon
                  name="smartphone"
                  size={20}
                  color={colors.semantic.success}
                />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Before Contacting Support</Text>
                <Text style={styles.tipDescription}>
                  Try restarting the app, check your internet connection, and
                  browse our FAQ.
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Icon name="info" size={20} color={colors.primary} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Better Support Experience</Text>
                <Text style={styles.tipDescription}>
                  Be specific about your issue, include screenshots when
                  helpful, and mention your device type.
                </Text>
              </View>
            </View>
          </View>
        </Section>

        {/* Contact Information */}
        <Section title="Contact Information">
          <View style={styles.contactContainer}>
            <View style={styles.contactItem}>
              <Icon name="message-circle" size={20} color={colors.primary} />
              <Text style={styles.contactText}>Live Chat: Available 24/7</Text>
            </View>
            <View style={styles.contactItem}>
              <Icon name="mail" size={20} color={colors.primary} />
              <Text style={styles.contactText}>
                contact@macrofriendlyfood.com
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Icon name="clock" size={20} color={colors.primary} />
              <Text style={styles.contactText}>
                Email Support: Mon-Fri 9AM-5PM EST
              </Text>
            </View>
          </View>
        </Section>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <View style={styles.emergencyCard}>
            <Icon
              name="alert-triangle"
              size={24}
              color={colors.semantic.error}
            />
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>Urgent Account Issues?</Text>
              <Text style={styles.emergencyDescription}>
                For security issues, or account lockouts, start a live chat for
                immediate assistance.
              </Text>
              <TouchableOpacity
                style={styles.emergencyButton}
                onPress={openAccountSupport}>
                <Text style={styles.emergencyButtonText}>Get Urgent Help</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ThriveDesk Modal */}
      <ThriveDeskModal
        visible={modalState.visible}
        onClose={hideModal}
        title={modalState.title}
        department={modalState.department}
        subject={modalState.subject}
        prefilledMessage={modalState.prefilledMessage}
        thriveDeskUrl={generateWidgetUrl()}
        showMinimize={true}
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header Section
  headerSection: {
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  headerDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Quick Access Section
  quickAccessSection: {
    padding: spacing.md,
  },
  quickAccessCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  quickAccessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  quickAccessIcon: {
    marginRight: spacing.md,
  },
  quickAccessText: {
    flex: 1,
  },
  quickAccessTitle: {
    ...typography.h6,
    color: colors.white,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
  },
  quickAccessSubtitle: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.9,
  },
  quickAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  quickAccessButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
    marginRight: spacing.xs,
  },

  // Support Cards
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
    position: 'relative',
  },
  featuredCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.warning,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  featuredBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: fontWeights.bold,
    fontSize: 10,
    marginLeft: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featuredCardIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  featuredCardTitle: {
    color: colors.white,
  },
  cardDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  featuredCardDescription: {
    color: colors.white,
    opacity: 0.9,
  },
  modalIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  modalIndicatorText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontStyle: 'italic',
  },
  cardArrow: {
    padding: spacing.xs,
  },

  // Tips Section
  tipsContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  tipDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  // Contact Information
  contactContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  contactText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },

  // Emergency Section
  emergencySection: {
    paddingBottom: spacing.xl,
    marginTop: spacing.md,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.error + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.semantic.error + '30',
  },
  emergencyContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  emergencyTitle: {
    ...typography.bodyLarge,
    color: colors.semantic.error,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  emergencyDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  emergencyButton: {
    backgroundColor: colors.semantic.error,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  emergencyButtonText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: fontWeights.semibold,
  },
});

export default SupportScreen;
