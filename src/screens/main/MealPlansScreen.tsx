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
import { Button } from '../../components/forms/Button';
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

type MealPlansNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Meal Plans'>,
  StackNavigationProp<RootStackParamList>
>;

const MealPlansScreen: React.FC = () => {
  const navigation = useNavigation<MealPlansNavigationProp>();
  const { plans, loading, fetchPlans, deletePlan, duplicatePlan } = usePlans();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPlans, setTotalPlans] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [planToDuplicate, setPlanToDuplicate] = useState<Plan | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (plans.length > 0) {
      filterPlans();
    }
  }, [plans, searchQuery]);

  const loadPlans = async () => {
    setRefreshing(true);
    try {
      const response = await fetchPlans(page, pageSize);
      setTotalPlans(response?.total || 0);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterPlans = () => {
    if (!searchQuery.trim()) {
      setFilteredPlans(plans);
      return;
    }

    const filtered = plans.filter(plan =>
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredPlans(filtered);
  };

  const handleRefresh = useCallback(async () => {
    setPage(0);
    loadPlans();
  }, []);

  const handleLoadMore = () => {
    if (!loading && plans.length < totalPlans) {
      setPage(prevPage => prevPage + 1);
      loadPlans();
    }
  };

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
      params: { planId: plan._id },
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
      // Plan will be removed from state in the hook
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
      loadPlans(); // Refresh to show the new plan
    } catch (error) {
      console.error('Error duplicating plan:', error);
      Alert.alert('Error', 'Failed to duplicate meal plan');
    } finally {
      setPlanToDuplicate(null);
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
    return (
      <TouchableOpacity
        style={styles.planCard}
        onPress={() => handleViewPlan(item)}
        activeOpacity={0.7}>
        <View style={styles.planCardContent}>
          <View style={styles.planCardHeader}>
            <View style={styles.planTitleSection}>
              <Text style={styles.planName}>{item.name}</Text>
              <Text style={styles.planDate}>
                Created {format(parseISO(item.created_at), 'MMM d, yyyy')}
              </Text>
            </View>
            <View style={styles.planActionButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleEditPlan(item)}>
                <Icon name="edit-2" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => confirmDuplicatePlan(item)}>
                <Icon name="copy" size={20} color={colors.primary} />
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
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
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
  },
  planName: {
    ...typography.h6,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: 2,
  },
  planDate: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  planActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    padding: spacing.xs,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
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
