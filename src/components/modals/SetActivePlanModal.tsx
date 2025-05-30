import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { format, parseISO } from 'date-fns';
import { BottomSheet } from './BottomSheet';
import { Button } from '../forms/Button';
import { LoadingOverlay } from '../feedback/LoadingOverlay';
import { EmptyState } from '../feedback/EmptyState';
import { PlanWeekdayIndicator } from '../meal-plan/PlanWeekdayIndicator';
import { usePlans } from '../../hooks/usePlans';
import { useActivePlan } from '../../hooks/useActivePlan';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import { Plan } from '../../types/plan';

interface SetActivePlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (plan: Plan) => void;
}

export const SetActivePlanModal: React.FC<SetActivePlanModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { plans, loading: plansLoading, fetchPlans } = usePlans();
  const {
    activePlan,
    setActivePlanById,
    loading: activeLoading,
  } = useActivePlan();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (visible) {
      fetchPlans();
    }
  }, [visible, fetchPlans]);

  const handleSelectPlan = useCallback((plan: Plan) => {
    setSelectedPlan(plan);
  }, []);

  const handleSetActivePlan = useCallback(async () => {
    if (!selectedPlan) return;

    try {
      const updatedPlan = await setActivePlanById(selectedPlan._id);
      onSuccess?.(updatedPlan);
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [selectedPlan, setActivePlanById, onSuccess, onClose]);

  const getTotalRecipeCount = useCallback((plan: Plan): number => {
    let total = 0;
    Object.values(plan.schedule).forEach(day => {
      if (Array.isArray(day)) {
        total += day.length;
      }
    });
    return total;
  }, []);

  const renderPlanCard = useCallback(
    ({ item }: { item: Plan }) => {
      const isCurrentActive = activePlan?._id === item._id;
      const isSelected = selectedPlan?._id === item._id;
      const recipeCount = getTotalRecipeCount(item);

      return (
        <TouchableOpacity
          style={[
            styles.planCard,
            isSelected && styles.planCardSelected,
            isCurrentActive && styles.planCardActive,
          ]}
          onPress={() => handleSelectPlan(item)}
          activeOpacity={0.7}>
          <View style={styles.planCardHeader}>
            <View style={styles.planInfo}>
              <Text style={styles.planName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.planDate}>
                Created {format(parseISO(item.created_at), 'MMM d, yyyy')}
              </Text>
            </View>

            <View style={styles.planStatus}>
              {isCurrentActive && (
                <View style={styles.activeBadge}>
                  <Icon name="check-circle" size={16} color={colors.white} />
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              )}
              {isSelected && !isCurrentActive && (
                <View style={styles.selectedIndicator}>
                  <Icon name="check" size={20} color={colors.primary} />
                </View>
              )}
            </View>
          </View>

          {/* Recipe count and weekday indicators */}
          <View style={styles.planDetails}>
            <View style={styles.recipeCount}>
              <Icon name="book-open" size={16} color={colors.text.secondary} />
              <Text style={styles.recipeCountText}>
                {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
              </Text>
            </View>
          </View>

          {/* Weekday indicators */}
          <View style={styles.weekdaySection}>
            <Text style={styles.weekdaySectionTitle}>Scheduled days:</Text>
            <PlanWeekdayIndicator plan={item} />
          </View>
        </TouchableOpacity>
      );
    },
    [activePlan, selectedPlan, handleSelectPlan, getTotalRecipeCount],
  );

  const renderEmptyState = () => (
    <EmptyState
      title="No meal plans"
      description="Create a meal plan first before setting it as active"
    />
  );

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose} height="80%">
        <View style={styles.header}>
          <Text style={styles.title}>Set Active Meal Plan</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            Choose a meal plan to make it your active plan. This will be used
            for today's meals and weekly planning.
          </Text>
        </View>

        <View style={styles.content}>
          {plansLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading meal plans...</Text>
            </View>
          ) : plans.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={plans}
              renderItem={renderPlanCard}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>

        {/* Action buttons */}
        {!plansLoading && plans.length > 0 && (
          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Set as Active"
              onPress={handleSetActivePlan}
              variant="primary"
              style={styles.confirmButton}
              disabled={!selectedPlan || activePlan?._id === selectedPlan?._id}
              loading={activeLoading}
            />
          </View>
        )}
      </BottomSheet>

      <LoadingOverlay
        visible={activeLoading}
        message="Setting active plan..."
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
  },
  closeButton: {
    padding: spacing.xs,
  },

  description: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  descriptionText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  content: {
    flex: 1,
    paddingTop: spacing.md,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },

  listContent: {
    paddingBottom: spacing.lg,
  },

  // Plan Cards
  planCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  planCardActive: {
    backgroundColor: colors.semantic.success + '10',
    borderColor: colors.semantic.success,
  },

  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  planInfo: {
    flex: 1,
  },
  planName: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  planDate: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },

  planStatus: {
    alignItems: 'flex-end',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  activeBadgeText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: fontWeights.medium,
    marginLeft: spacing.xs,
  },
  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  planDetails: {
    marginBottom: spacing.sm,
  },
  recipeCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeCountText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },

  weekdaySection: {
    marginTop: spacing.sm,
  },
  weekdaySectionTitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  confirmButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});
