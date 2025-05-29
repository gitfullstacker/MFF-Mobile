import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { format, parseISO } from 'date-fns';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { Button } from '../../components/forms/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { useSubscription } from '../../hooks/useSubscription';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import { Subscription } from '../../types/subscription';

const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    subscriptionStats,
    loading,
    isSubscriptionActive,
    formatExpiryDate,
    getTimeLeftInSubscription,
    fetchSubscriptionStats,
    cancelSubscription,
    resumeSubscription,
    getSubscriptions,
  } = useSubscription();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      await fetchSubscriptionStats();
      const subs = await getSubscriptions();
      setSubscriptions(subs);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSubscriptions();
    setRefreshing(false);
  }, []);

  const handleCancelSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowCancelModal(true);
  };

  const handleResumeSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowResumeModal(true);
  };

  const confirmCancelSubscription = async () => {
    if (!selectedSubscription) return;

    setOperationLoading(true);
    setShowCancelModal(false);

    try {
      await cancelSubscription(selectedSubscription.subscription_id);
      await loadSubscriptions(); // Refresh data
      Alert.alert(
        'Subscription Cancelled',
        'Your subscription has been cancelled and will remain active until the end of your billing period.',
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
    } finally {
      setOperationLoading(false);
      setSelectedSubscription(null);
    }
  };

  const confirmResumeSubscription = async () => {
    if (!selectedSubscription) return;

    setOperationLoading(true);
    setShowResumeModal(false);

    try {
      await resumeSubscription(selectedSubscription.subscription_id);
      await loadSubscriptions(); // Refresh data
      Alert.alert(
        'Subscription Resumed',
        'Your subscription has been reactivated and will continue as scheduled.',
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to resume subscription. Please try again.');
    } finally {
      setOperationLoading(false);
      setSelectedSubscription(null);
    }
  };

  const handleManagePayment = () => {
    Alert.alert(
      'Manage Payment Methods',
      'You will be redirected to our secure payment portal to manage your payment methods.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // Replace with your actual payment portal URL
            Linking.openURL('https://your-website.com/account/payment-methods');
          },
        },
      ],
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return colors.semantic.success;
      case 'pending-cancel':
        return colors.semantic.warning;
      case 'cancelled':
      case 'expired':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'pending-cancel':
        return 'Pending Cancellation';
      case 'cancelled':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  };

  const renderSubscriptionCard = ({ item }: { item: Subscription }) => {
    const isActive = item.status === 'active';
    const isPendingCancel = item.status === 'pending-cancel';
    const canCancel = isActive && !isPendingCancel;
    const canResume = isPendingCancel;

    return (
      <View style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionName}>
              {item.line_items?.[0]?.name || 'Subscription'}
            </Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + '20' },
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.subscriptionPrice}>
            {formatCurrency(item.total)}/{item.billing_interval}
          </Text>
        </View>

        <View style={styles.subscriptionDetails}>
          {item.next_payment_date && (
            <View style={styles.detailRow}>
              <Icon name="calendar" size={16} color={colors.text.secondary} />
              <Text style={styles.detailText}>
                Next payment:{' '}
                {format(parseISO(item.next_payment_date), 'MMM d, yyyy')}
              </Text>
            </View>
          )}

          {item.start_date && (
            <View style={styles.detailRow}>
              <Icon
                name="play-circle"
                size={16}
                color={colors.text.secondary}
              />
              <Text style={styles.detailText}>
                Started: {format(parseISO(item.start_date), 'MMM d, yyyy')}
              </Text>
            </View>
          )}

          {item.cancelled_date && (
            <View style={styles.detailRow}>
              <Icon name="x-circle" size={16} color={colors.semantic.error} />
              <Text style={styles.detailText}>
                Cancelled:{' '}
                {format(parseISO(item.cancelled_date), 'MMM d, yyyy')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.subscriptionActions}>
          {canCancel && (
            <Button
              title="Cancel"
              onPress={() => handleCancelSubscription(item)}
              variant="outline"
              size="small"
              textStyle={{ color: colors.semantic.error }}
              style={[
                styles.actionButton,
                { borderColor: colors.semantic.error },
              ]}
            />
          )}

          {canResume && (
            <Button
              title="Resume"
              onPress={() => handleResumeSubscription(item)}
              variant="primary"
              size="small"
              style={styles.actionButton}
            />
          )}
        </View>
      </View>
    );
  };

  const renderCurrentSubscription = () => {
    if (!subscriptionStats || !subscriptionStats.status) return null;

    const timeLeft = getTimeLeftInSubscription();
    const isActive = isSubscriptionActive();

    return (
      <Section title="Current Subscription">
        <View style={styles.currentSubscriptionCard}>
          <View style={styles.currentSubscriptionHeader}>
            <View style={styles.currentSubscriptionInfo}>
              <Text style={styles.currentSubscriptionName}>
                {subscriptionStats.name || 'Premium Plan'}
              </Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        getStatusColor(subscriptionStats.status) + '20',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(subscriptionStats.status) },
                    ]}>
                    {getStatusText(subscriptionStats.status)}
                  </Text>
                </View>
              </View>
            </View>
            {subscriptionStats.total_price && (
              <Text style={styles.currentSubscriptionPrice}>
                {formatCurrency(subscriptionStats.total_price)}
              </Text>
            )}
          </View>

          <View style={styles.currentSubscriptionDetails}>
            {subscriptionStats.expire_date && (
              <View style={styles.detailRow}>
                <Icon name="calendar" size={16} color={colors.text.secondary} />
                <Text style={styles.detailText}>
                  Expires: {formatExpiryDate()}
                </Text>
              </View>
            )}

            {timeLeft && (
              <View style={styles.detailRow}>
                <Icon name="clock" size={16} color={colors.text.secondary} />
                <Text style={styles.detailText}>{timeLeft}</Text>
              </View>
            )}

            {subscriptionStats.paid_date && (
              <View style={styles.detailRow}>
                <Icon
                  name="credit-card"
                  size={16}
                  color={colors.text.secondary}
                />
                <Text style={styles.detailText}>
                  Last payment:{' '}
                  {format(parseISO(subscriptionStats.paid_date), 'MMM d, yyyy')}
                </Text>
              </View>
            )}
          </View>

          {isActive && (
            <View style={styles.featuresList}>
              <Text style={styles.featuresTitle}>Plan Features:</Text>
              <View style={styles.featureItem}>
                <Icon name="check" size={16} color={colors.semantic.success} />
                <Text style={styles.featureText}>Unlimited recipe access</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="check" size={16} color={colors.semantic.success} />
                <Text style={styles.featureText}>Advanced meal planning</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="check" size={16} color={colors.semantic.success} />
                <Text style={styles.featureText}>Priority support</Text>
              </View>
            </View>
          )}
        </View>
      </Section>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      title="No active subscriptions"
      description="You don't have any active subscriptions. Upgrade to premium for unlimited access to all features."
      action={{
        label: 'View Plans',
        onPress: () => {
          // Navigate to plans or open website
          Linking.openURL('https://your-website.com/pricing');
        },
      }}
    />
  );

  return (
    <PageContainer safeArea={false}>
      <Header title="Subscription" showBack={true} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }>
        {/* Current Subscription */}
        {renderCurrentSubscription()}

        {/* Payment Management */}
        <Section title="Payment & Billing">
          <TouchableOpacity
            style={styles.managementCard}
            onPress={handleManagePayment}>
            <View style={styles.managementIcon}>
              <Icon name="credit-card" size={24} color={colors.primary} />
            </View>
            <View style={styles.managementInfo}>
              <Text style={styles.managementTitle}>Manage Payment Methods</Text>
              <Text style={styles.managementDescription}>
                Add, remove, or update your payment methods
              </Text>
            </View>
            <Icon
              name="chevron-right"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </Section>

        {/* Subscription History */}
        <Section
          title="Subscription History"
          action={{
            label: 'Refresh',
            onPress: handleRefresh,
          }}>
          {subscriptions.length > 0 ? (
            <FlatList
              data={subscriptions}
              renderItem={renderSubscriptionCard}
              keyExtractor={item => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            renderEmptyState()
          )}
        </Section>
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelSubscription}
        title="Cancel Subscription"
        message={
          selectedSubscription
            ? `Are you sure you want to cancel your subscription? You will continue to have access until ${
                selectedSubscription.next_payment_date
                  ? format(
                      parseISO(selectedSubscription.next_payment_date),
                      'MMM d, yyyy',
                    )
                  : 'the end of your billing period'
              }.`
            : 'Are you sure you want to cancel your subscription?'
        }
        confirmText="Cancel Subscription"
        destructive={true}
        isLoading={operationLoading}
      />

      {/* Resume Confirmation Modal */}
      <ConfirmModal
        visible={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onConfirm={confirmResumeSubscription}
        title="Resume Subscription"
        message="Are you sure you want to resume your subscription? Billing will continue as scheduled."
        confirmText="Resume Subscription"
        isLoading={operationLoading}
      />

      <LoadingOverlay visible={loading} message="Loading subscription..." />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Current Subscription Card
  currentSubscriptionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    ...shadows.sm,
  },
  currentSubscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  currentSubscriptionInfo: {
    flex: 1,
  },
  currentSubscriptionName: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
  },
  currentSubscriptionPrice: {
    ...typography.h6,
    color: colors.primary,
    fontWeight: fontWeights.bold,
  },
  currentSubscriptionDetails: {
    marginBottom: spacing.md,
  },

  // Feature List
  featuresList: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  featuresTitle: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  featureText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },

  // Management Card
  managementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  managementIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  managementInfo: {
    flex: 1,
  },
  managementTitle: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  managementDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },

  // Subscription Cards
  subscriptionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  subscriptionPrice: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
  },
  subscriptionDetails: {
    marginBottom: spacing.md,
  },
  subscriptionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: spacing.sm,
  },

  // Status Badge
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.bodySmall,
    fontWeight: fontWeights.medium,
  },

  // Detail Rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
});

export default SubscriptionScreen;
