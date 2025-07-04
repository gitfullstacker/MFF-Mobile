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

const PrivacyScreen: React.FC = () => {
  const handleContactSupport = () => {
    Linking.openURL('mailto:privacy@macrofriendlyfood.com');
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
      <Header title="Privacy Policy" showBack={true} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: January 1, 2025</Text>
        </View>

        {/* Introduction */}
        <Section title="Introduction">
          {renderSectionContent([
            'At Macro Friendly Food, we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, store, and protect your information when you use our mobile application.',
            'By using our app, you agree to the collection and use of information in accordance with this policy.',
          ])}
        </Section>

        {/* Information We Collect */}
        <Section title="Information We Collect">
          <Text style={styles.subheading}>Personal Information</Text>
          {renderListContent([
            'Account information (name, email address, profile picture)',
            'Dietary preferences and restrictions',
            'Health and nutrition goals',
            'User-generated content (reviews, comments, meal plans)',
          ])}

          <Text style={styles.subheading}>Usage Data</Text>
          {renderListContent([
            'App usage statistics and analytics',
            'Device information (type, operating system, unique identifiers)',
            'Log data (IP address, browser type, access times)',
            'Crash reports and performance data',
          ])}

          <Text style={styles.subheading}>Location Data</Text>
          {renderSectionContent([
            'We may collect location data to provide location-based features such as finding nearby grocery stores or restaurants. This data is only collected with your explicit consent and can be disabled in your device settings.',
          ])}
        </Section>

        {/* How We Use Your Information */}
        <Section title="How We Use Your Information">
          {renderListContent([
            'Provide and maintain our app services',
            'Personalize your nutrition recommendations',
            'Send you important updates and notifications',
            'Improve our app functionality and user experience',
            'Provide customer support and respond to inquiries',
            'Comply with legal obligations and protect our rights',
          ])}
        </Section>

        {/* Information Sharing */}
        <Section title="Information Sharing">
          {renderSectionContent([
            'We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:',
          ])}

          {renderListContent([
            'With your explicit consent',
            'To comply with legal obligations or court orders',
            'To protect our rights, property, or safety',
            'With trusted service providers who assist in app operations (under strict confidentiality agreements)',
            'In connection with a business transfer or acquisition',
          ])}
        </Section>

        {/* Data Security */}
        <Section title="Data Security">
          {renderSectionContent([
            'We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.',
            'Your data is encrypted in transit and at rest using industry-standard encryption protocols. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.',
          ])}
        </Section>

        {/* Data Retention */}
        <Section title="Data Retention">
          {renderSectionContent([
            'We retain your personal data only for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law.',
            'You can request deletion of your account and associated data at any time through the app settings or by contacting our support team.',
          ])}
        </Section>

        {/* Third-Party Services */}
        <Section title="Third-Party Services">
          {renderSectionContent([
            'Our app may integrate with third-party services for analytics, crash reporting, and other functionality. These services have their own privacy policies:',
          ])}

          {renderListContent([
            'Google Analytics - https://policies.google.com/privacy',
            'Firebase - https://firebase.google.com/support/privacy',
            'Crashlytics - https://firebase.google.com/support/privacy',
          ])}
        </Section>

        {/* Children's Privacy */}
        <Section title="Children's Privacy">
          {renderSectionContent([
            'Our app is not intended for children under 13 years of age. We do not knowingly collect personal data from children under 13. If you become aware that a child has provided us with personal data, please contact us immediately.',
          ])}
        </Section>

        {/* Your Rights */}
        <Section title="Your Rights">
          {renderSectionContent([
            'Depending on your location, you may have the following rights regarding your personal data:',
          ])}

          {renderListContent([
            'Access: Request access to your personal data',
            'Correction: Request correction of inaccurate data',
            'Deletion: Request deletion of your personal data',
            'Portability: Request a copy of your data in a portable format',
            'Objection: Object to processing of your data',
            'Restriction: Request restriction of data processing',
          ])}

          {renderSectionContent([
            'To exercise these rights, please contact us using the information provided below.',
          ])}
        </Section>

        {/* Changes to Privacy Policy */}
        <Section title="Changes to This Privacy Policy">
          {renderSectionContent([
            "We may update this privacy policy from time to time. We will notify you of any material changes by posting the new privacy policy in the app and updating the 'Last updated' date.",
            'Your continued use of the app after changes become effective constitutes acceptance of the revised policy.',
          ])}
        </Section>

        {/* Contact Information */}
        <Section title="Contact Us">
          {renderSectionContent([
            'If you have any questions about this privacy policy or our data practices, please contact us:',
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
            'Macro Friendly Food Inc.\n123 Health Street\nSan Francisco, CA 94107\nUnited States',
          ])}
        </Section>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This privacy policy is effective as of January 1, 2025
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

export default PrivacyScreen;
