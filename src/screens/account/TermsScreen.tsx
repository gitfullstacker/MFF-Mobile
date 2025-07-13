import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
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
} from '../../theme';

const TermsScreen: React.FC = () => {
  const handleContactSupport = () => {
    Linking.openURL('mailto:contact@macrofriendlyfood.com');
  };

  const renderSectionContent = (content: string[]) => (
    <View style={styles.sectionContent}>
      {content.map((paragraph, index) => (
        <Text key={index} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}
    </View>
  );

  const renderListContent = (items: string[]) => (
    <View style={styles.listContainer}>
      {items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <PageContainer safeArea={false}>
      <Header title="Terms of Service" showBack={true} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.lastUpdated}>Last updated: January 1, 2025</Text>
        </View>

        {/* Introduction */}
        <Section title="Agreement to Terms">
          {renderSectionContent([
            "These Terms of Service ('Terms') govern your use of the Macro Friendly Food mobile application ('App') operated by J&E Financial, LLC DBA Macro Friendly Food ('we', 'our', or 'us').",
            'By downloading, accessing, or using our App, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the App.',
          ])}
        </Section>

        {/* Use License */}
        <Section title="Use License">
          {renderSectionContent([
            'We grant you a revocable, non-exclusive, non-transferable, limited license to download, install, and use the App solely for your personal, non-commercial purposes strictly in accordance with these Terms.',
          ])}

          <Text style={styles.subheading}>You may not:</Text>
          {renderListContent([
            'Modify or copy the materials',
            'Use the materials for any commercial purpose or for any public display',
            'Attempt to reverse engineer any software contained in the App',
            'Remove any copyright or other proprietary notations from the materials',
            "Transfer the materials to another person or 'mirror' the materials on any other server",
          ])}
        </Section>

        {/* User Accounts */}
        <Section title="User Accounts">
          {renderSectionContent([
            'When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.',
          ])}

          {renderListContent([
            'You must be at least 13 years old to use this App',
            'You are responsible for maintaining the confidentiality of your account',
            'You must notify us immediately of any unauthorized use of your account',
            'We reserve the right to terminate accounts that violate these Terms',
          ])}
        </Section>

        {/* Content */}
        <Section title="Content">
          <Text style={styles.subheading}>Your Content</Text>
          {renderSectionContent([
            "Our App may allow you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ('Content'). You are responsible for the Content that you post to the App, including its legality, reliability, and appropriateness.",
          ])}

          {renderListContent([
            'You retain any and all of your rights to any Content you submit, post or display',
            'By posting Content, you grant us a non-exclusive license to use, modify, and display such Content',
            'You represent that you own or have the necessary rights to all Content you post',
            "You will not post Content that is illegal, harmful, or violates others' rights",
          ])}

          <Text style={styles.subheading}>Our Content</Text>
          {renderSectionContent([
            'The App and its original content, features, and functionality are and will remain the exclusive property of J&E Financial, LLC DBA Macro Friendly Food and its licensors. The App is protected by copyright, trademark, and other laws.',
          ])}
        </Section>

        {/* Prohibited Uses */}
        <Section title="Prohibited Uses">
          {renderSectionContent(['You may not use our App:'])}

          {renderListContent([
            'For any unlawful purpose or to solicit others to unlawful acts',
            'To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances',
            'To infringe upon or violate our intellectual property rights or the intellectual property rights of others',
            'To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate',
            'To submit false or misleading information',
            'To upload or transmit viruses or any other type of malicious code',
            'To collect or track the personal information of others',
            'To spam, phish, pharm, pretext, spider, crawl, or scrape',
            'For any obscene or immoral purpose',
            'To interfere with or circumvent the security features of the App',
          ])}
        </Section>

        {/* Health Disclaimer */}
        <Section title="Health and Nutrition Disclaimer">
          {renderSectionContent([
            'The information provided by this App is for general informational purposes only. All information in the App is provided in good faith, however we make no representation or warranty of any kind regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information in the App.',
            'The App is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.',
            'Never disregard professional medical advice or delay in seeking it because of something you have read in this App.',
          ])}
        </Section>

        {/* Subscription Terms */}
        <Section title="Subscription and Payment">
          {renderSectionContent([
            'Some features of the App are available through paid subscriptions. By purchasing a subscription, you agree to pay all charges associated with your subscription.',
            'Subscription fees are charged on a recurring basis and will continue until you cancel your subscription. You may cancel your subscription at any time through your app store account settings.',
            'We reserve the right to change our subscription fees at any time, with notice provided to existing subscribers.',
          ])}
        </Section>

        {/* Limitation of Liability */}
        <Section title="Limitation of Liability">
          {renderSectionContent([
            'In no event shall J&E Financial, LLC DBA Macro Friendly Food, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the App.',
            'Our total liability to you for any damages arising from or related to this agreement shall not exceed the amount you have paid us in the twelve (12) months preceding the event giving rise to liability.',
          ])}
        </Section>

        {/* Termination */}
        <Section title="Termination">
          {renderSectionContent([
            'We may terminate or suspend your account and bar access to the App immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.',
            'If you wish to terminate your account, you may simply discontinue using the App or contact us to request account deletion.',
          ])}
        </Section>

        {/* Governing Law */}
        <Section title="Governing Law">
          {renderSectionContent([
            'These Terms shall be interpreted and governed by the laws of the State of Utah, United States. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions will remain in effect.',
          ])}
        </Section>

        {/* Changes to Terms */}
        <Section title="Changes to Terms">
          {renderSectionContent([
            'We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.',
            'What constitutes a material change will be determined at our sole discretion. By continuing to access or use our App after those revisions become effective, you agree to be bound by the revised terms.',
          ])}
        </Section>

        {/* Contact Information */}
        <Section title="Contact Us">
          {renderSectionContent([
            'If you have any questions about these Terms of Service, please contact us:',
          ])}

          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSupport}
            activeOpacity={0.7}>
            <Icon name="mail" size={20} color={colors.primary} />
            <Text style={styles.contactText}>
              contact@macrofriendlyfood.com
            </Text>
          </TouchableOpacity>

          {renderSectionContent([
            'J&E Financial, LLC DBA Macro Friendly Food\n189 N Hwy 89 Ste C PMB 1047\nNorth Salt Lake, UT 84054\nUnited States\nPhone: 801-200-3409',
          ])}
        </Section>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            These terms of service are effective as of January 1, 2025
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
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
  },
  lastUpdated: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  sectionContent: {
    marginTop: spacing.sm,
  },
  paragraph: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  subheading: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  listContainer: {
    marginTop: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingRight: spacing.md,
  },
  bullet: {
    ...typography.bodyRegular,
    color: colors.primary,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  listText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    lineHeight: 24,
    flex: 1,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
  },
  contactText: {
    ...typography.bodyRegular,
    color: colors.primary,
    fontWeight: fontWeights.medium,
    marginLeft: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TermsScreen;
