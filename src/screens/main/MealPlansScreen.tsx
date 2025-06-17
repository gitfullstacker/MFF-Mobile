import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import { format, parseISO } from 'date-fns';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Input } from '../../components/forms/Input';
import { EmptyState } from '../../components/feedback/EmptyState';
import { usePlans } from '../../hooks/usePlans';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  fontWeights,
} from '../../theme';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Plan } from '../../types/plan';
import { PlanWeekdayIndicator } from '@/components/meal-plan/PlanWeekdayIndicator';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useActivePlan } from '../../hooks/useActivePlan';

type MealPlansNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Meal Plans'>,
  StackNavigationProp<RootStackParamList>
>;

const MealPlansScreen: React.FC = () => {
  const navigation = useNavigation<MealPlansNavigationProp>();
  const { plans, loading, hasMore, fetchPlans, deletePlan, duplicatePlan } =
    usePlans();
  const {
    activePlan,
    setActivePlanById,
    loading: activePlanLoading,
  } = useActivePlan();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [planToDuplicate, setPlanToDuplicate] = useState<Plan | null>(null);
  const [showSetActiveDialog, setShowSetActiveDialog] = useState(false);
  const [planToSetActive, setPlanToSetActive] = useState<Plan | null>(null);

  useEffect(() => {
    // Initial load
    if (plans.length === 0) {
      fetchPlans({}, true);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredPlans(
        plans.filter(plan =>
          plan.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    } else {
      setFilteredPlans(plans);
    }
  }, [searchQuery, plans]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlans({}, true);
    setRefreshing(false);
  }, [fetchPlans]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPlans();
    }
  }, [loading, hasMore, fetchPlans]);

  const handleCreatePlan = () => {
    navigation.navigate('MealPlanStack', {
      screen: 'CreateMealPlan',
    } as any);
  };

  const handleEditPlan = (plan: Plan) => {
    navigation.navigate('MealPlanStack', {
      screen: 'EditMealPlan',
      params: { planId: plan._id, plan },
    } as any);
  };

  const handleViewPlan = (plan: Plan) => {
    navigation.navigate('MealPlanStack', {
      screen: 'MealPlanDetail',
      params: { planId: plan._id, plan },
    } as any);
  };

  const confirmDeletePlan = (plan: Plan) => {
    setPlanToDelete(plan);
    setShowDeleteDialog(true);
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;

    setShowDeleteDialog(false);
    try {
      await deletePlan(planToDelete._id);
      Alert.alert('Success', 'Meal plan deleted successfully');
    } catch (error) {
      console.error('Error deleting plan:', error);
      Alert.alert('Error', 'Failed to delete meal plan');
    } finally {
      setPlanToDelete(null);
    }
  };

  const confirmDuplicatePlan = (plan: Plan) => {
    setPlanToDuplicate(plan);
    setShowDuplicateDialog(true);
  };

  const handleDuplicatePlan = async () => {
    if (!planToDuplicate) return;

    setShowDuplicateDialog(false);
    try {
      await duplicatePlan(planToDuplicate._id);
      Alert.alert('Success', 'Meal plan duplicated successfully');
    } catch (error) {
      console.error('Error duplicating plan:', error);
      Alert.alert('Error', 'Failed to duplicate meal plan');
    } finally {
      setPlanToDuplicate(null);
    }
  };

  const confirmSetActivePlan = (plan: Plan) => {
    setPlanToSetActive(plan);
    setShowSetActiveDialog(true);
  };

  const handleSetActivePlan = async () => {
    if (!planToSetActive) return;

    setShowSetActiveDialog(false);
    try {
      await setActivePlanById(planToSetActive._id);
      Alert.alert('Success', 'Active meal plan updated successfully');
    } catch (error) {
      console.error('Error setting active plan:', error);
      Alert.alert('Error', 'Failed to set active meal plan');
    } finally {
      setPlanToSetActive(null);
    }
  };

  // Count total recipes in plan
  const getTotalRecipeCount = (plan: Plan): number => {
    let total = 0;
    Object.values(plan.schedule).forEach(day => {
      if (Array.isArray(day)) {
        total += day.length;
      }
    });
    return total;
  };

  const renderPlanCard = ({ item }: { item: Plan }) => {
    const isActive = activePlan?._id === item._id;

    return (
      <TouchableOpacity
        style={[styles.planCard, isActive && styles.activePlanCard]}
        onPress={() => handleViewPlan(item)}>
        <View style={styles.planCardContent}>
          {/* Header */}
          <View style={styles.planCardHeader}>
            <View style={styles.planTitleSection}>
              {isActive && (
                <View style={styles.activeBadge}>
                  <Icon name="check-circle" size={12} color={colors.white} />
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              )}
              <Text style={styles.planName} numberOfLines={2}>
                {item.name}
              </Text>

              <Text style={styles.planDate}>
                Created {format(parseISO(item.created_at), 'MMM dd, yyyy')}
              </Text>
            </View>
            <View style={styles.planActionButtons}>
              {!isActive && (
                <TouchableOpacity
                  style={styles.setActiveButton}
                  onPress={() => confirmSetActivePlan(item)}>
                  <Icon name="star" size={16} color={colors.semantic.warning} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleEditPlan(item)}>
                <Icon name="edit" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => confirmDuplicatePlan(item)}>
                <Icon name="copy" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => confirmDeletePlan(item)}>
                <Icon name="trash-2" size={20} color={colors.semantic.error} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Recipe count chip */}
          <View style={styles.chipContainer}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>
                {getTotalRecipeCount(item)} Recipes
              </Text>
            </View>
          </View>

          {/* Weekday indicators */}
          <View style={styles.weekdayIndicatorContainer}>
            <Text style={styles.sectionTitle}>Scheduled Days</Text>
            <PlanWeekdayIndicator plan={item} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (loading && !refreshing) return null;

    if (searchQuery) {
      return (
        <EmptyState
          title="No meal plans found"
          description={`We couldn't find any meal plans matching "${searchQuery}"`}
          action={{
            label: 'Clear Search',
            onPress: () => setSearchQuery(''),
          }}
        />
      );
    }

    return (
      <EmptyState
        title="No meal plans yet"
        description="Create your first meal plan to track your nutrition goals"
        action={{
          label: 'Create Meal Plan',
          onPress: handleCreatePlan,
        }}
      />
    );
  };

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Loading plans...</Text>
      </View>
    );
  };

  return (
    <PageContainer safeArea={false}>
      <Header
        title="My Meal Plans"
        showBack={false}
        rightAction={{
          icon: 'plus',
          onPress: handleCreatePlan,
        }}
      />

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search meal plans..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          rightIcon={searchQuery ? 'x' : undefined}
          onRightIconPress={() => setSearchQuery('')}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredPlans}
        renderItem={renderPlanCard}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
      />

      {/* Set Active Confirmation Dialog */}
      <ConfirmModal
        visible={showSetActiveDialog}
        title="Set Active Plan"
        message={
          planToSetActive
            ? `Do you want to set "${planToSetActive.name}" as your active meal plan? This will be used for today's meals and weekly planning.`
            : 'Do you want to set this as your active meal plan?'
        }
        onClose={() => setShowSetActiveDialog(false)}
        onConfirm={handleSetActivePlan}
        confirmText="Set as Active"
        confirmIcon="star"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        visible={showDeleteDialog}
        title="Delete Meal Plan"
        message={
          planToDelete
            ? `Are you sure you want to delete "${planToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this meal plan?'
        }
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeletePlan}
        confirmText="Delete"
        destructive={true}
      />

      {/* Duplicate Confirmation Dialog */}
      <ConfirmModal
        visible={showDuplicateDialog}
        title="Duplicate Meal Plan"
        message={
          planToDuplicate
            ? `Are you sure you want to duplicate "${planToDuplicate.name}"? A new copy will be created with all the same recipes and settings.`
            : 'Are you sure you want to duplicate this meal plan?'
        }
        onClose={() => setShowDuplicateDialog(false)}
        onConfirm={handleDuplicatePlan}
        confirmText="Duplicate"
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContent: {
    padding: spacing.sm,
    paddingTop: spacing.sm,
    flexGrow: 1,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  planCardContent: {
    padding: spacing.md,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  planTitleSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  activePlanCard: {
    borderColor: colors.semantic.success,
    backgroundColor: colors.semantic.success + '08',
  },
  planName: {
    ...typography.h6,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  activeBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: fontWeights.bold,
    marginLeft: spacing.xs / 2,
  },
  setActiveButton: {
    padding: spacing.xs,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.semantic.warning + '20',
    marginRight: spacing.xs,
  },
  planDate: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  planActionButtons: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexShrink: 0,
  },
  iconButton: {
    padding: spacing.xs,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
    marginLeft: spacing.xs,
  },
  chipContainer: {
    marginVertical: spacing.xs,
  },
  chip: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  weekdayIndicatorContainer: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...shadows.md,
  },
  modalTitle: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.sm,
  },
  modalMessage: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  modalButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  modalButtonDestructive: {
    backgroundColor: colors.semantic.error + '10',
  },
  modalButtonText: {
    ...typography.bodyRegular,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  modalButtonTextDestructive: {
    color: colors.semantic.error,
  },
});

export default MealPlansScreen;
