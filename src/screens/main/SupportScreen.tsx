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
import { useNavigation } from '@react-navigation/native';
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
import { StackNavigationProp } from '@react-navigation/stack';
import { AccountStackParamList } from '@/navigation/types';

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  type: 'navigation' | 'external' | 'action';
}

type SupportNavigationProp = StackNavigationProp<
  AccountStackParamList,
  'Support'
>;

const SupportScreen: React.FC = () => {
  const navigation = useNavigation<SupportNavigationProp>();

  const handleEmailSupport = () => {
    const email = 'support@macrofriendlyfood.com';
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

  const handleCallSupport = () => {
    const phoneNumber = '+1-555-SUPPORT';
    const telUrl = `tel:${phoneNumber}`;

    Linking.openURL(telUrl).catch(() => {
      Alert.alert('Phone Not Available', `Please call us at: ${phoneNumber}`, [
        { text: 'OK' },
      ]);
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
    {
      id: 'tickets',
      title: 'Support Tickets',
      description: 'View and manage your support tickets',
      icon: 'message-square',
      action: () => navigation.navigate('Tickets' as any),
      type: 'navigation',
    },
    {
      id: 'create-ticket',
      title: 'Create New Ticket',
      description: 'Submit a new support request or bug report',
      icon: 'plus-circle',
      action: () => navigation.navigate('CreateTicket' as any),
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
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Call our support team (Mon-Fri 9AM-5PM EST)',
      icon: 'phone',
      action: handleCallSupport,
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

    return (
      <TouchableOpacity
        key={option.id}
        style={styles.supportCard}
        onPress={option.action}
        activeOpacity={0.7}>
        <View style={styles.cardIcon}>
          <Icon name={option.icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{option.title}</Text>
          <Text style={styles.cardDescription}>{option.description}</Text>
        </View>
        <View style={styles.cardArrow}>
          <Icon
            name={isExternal ? 'external-link' : 'chevron-right'}
            size={20}
            color={colors.text.secondary}
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
            Choose from the options below to get the support you need
          </Text>
        </View>

        {/* Support Options */}
        <Section title="Get Support">
          {supportOptions.map(renderSupportCard)}
        </Section>

        {/* Resources */}
        <Section title="Self-Help Resources">
          {resourceOptions.map(renderSupportCard)}
        </Section>

        {/* Quick Tips */}
        <Section title="Quick Tips">
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Icon
                  name="lightbulb"
                  size={20}
                  color={colors.semantic.warning}
                />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Before contacting support</Text>
                <Text style={styles.tipDescription}>
                  Check our FAQ section - most common issues have quick
                  solutions there.
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Icon name="clock" size={20} color={colors.semantic.info} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Response time</Text>
                <Text style={styles.tipDescription}>
                  We typically respond to support tickets within 24 hours on
                  business days.
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
                <Text style={styles.tipTitle}>App issues</Text>
                <Text style={styles.tipDescription}>
                  Try restarting the app or updating to the latest version
                  first.
                </Text>
              </View>
            </View>
          </View>
        </Section>

        {/* Contact Information */}
        <Section title="Contact Information">
          <View style={styles.contactContainer}>
            <View style={styles.contactItem}>
              <Icon name="mail" size={20} color={colors.primary} />
              <Text style={styles.contactText}>
                support@macrofriendlyfood.com
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Icon name="phone" size={20} color={colors.primary} />
              <Text style={styles.contactText}>+1-555-SUPPORT</Text>
            </View>
            <View style={styles.contactItem}>
              <Icon name="clock" size={20} color={colors.primary} />
              <Text style={styles.contactText}>Mon-Fri 9AM-5PM EST</Text>
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
              <Text style={styles.emergencyTitle}>Account Issues?</Text>
              <Text style={styles.emergencyDescription}>
                If you're experiencing account security issues or billing
                problems, please contact us immediately.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
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
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
});

export default SupportScreen;
