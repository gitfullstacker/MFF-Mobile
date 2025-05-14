import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/forms/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Section } from '../../components/layout/Section';
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
import { MealPlan } from '../../types/plan';

type MealPlansNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Meal Plans'>,
  StackNavigationProp<RootStackParamList>
>;

const MealPlansScreen: React.FC = () => {
  const navigation = useNavigation<MealPlansNavigationProp>();
  const { mealPlans, loading, fetchPlans, deletePlan, duplicatePlan } =
    usePlans();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredPlans, setFilteredPlans] = useState<MealPlan[]>([]);
  const [activePlans, setActivePlans] = useState<MealPlan[]>([]);
  const [pastPlans, setPastPlans] = useState<MealPlan[]>([]);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (mealPlans.length > 0) {
      filterAndSortPlans();
    }
  }, [mealPlans, searchQuery]);

  const loadPlans = async () => {
    await fetchPlans();
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlans();
    setRefreshing(false);
  }, [fetchPlans]);

  const filterAndSortPlans = () => {
    const now = new Date();

    // Filter by search query if needed
    let filtered = mealPlans;
    if (searchQuery.trim()) {
      filtered = mealPlans.filter(plan =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredPlans(filtered);

    // Sort active and past plans
    // In a real app, you would use plan date ranges
    // For this example, we'll consider plans created in the last week as active
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const active = [];
    const past = [];

    for (const plan of filtered) {
      const createdDate = parseISO(plan.created_at);
      if (isAfter(createdDate, oneWeekAgo)) {
        active.push(plan);
      } else {
        past.push(plan);
      }
    }

    // Sort by date (newest first)
    active.sort((a, b) =>
      isBefore(parseISO(a.created_at), parseISO(b.created_at)) ? 1 : -1,
    );

    past.sort((a, b) =>
      isBefore(parseISO(a.created_at), parseISO(b.created_at)) ? 1 : -1,
    );

    setActivePlans(active);
    setPastPlans(past);
  };

  const handleCreatePlan = () => {
    navigation.navigate('MealPlanStack', {
      screen: 'CreateMealPlan',
    } as any);
  };

  const handleEditPlan = (plan: MealPlan) => {
    navigation.navigate('MealPlanStack', {
      screen: 'EditMealPlan',
      params: { planId: plan._id, plan },
    } as any);
  };

  const handleViewPlan = (plan: MealPlan) => {
    navigation.navigate('MealPlanStack', {
      screen: 'MealPlanDetail',
      params: { planId: plan._id, plan },
    } as any);
  };

  const handleDeletePlan = async (planId: string) => {
    await deletePlan(planId);
  };

  const handleDuplicatePlan = async (planId: string) => {
    await duplicatePlan(planId);
  };

  const renderPlanCard = ({ item }: { item: MealPlan }) => {
    // Count total recipes in the plan
    let recipeCount = 0;
    Object.values(item.schedule).forEach(day => {
      recipeCount += day.length;
    });

    return (
      <TouchableOpacity
        style={styles.planCard}
        onPress={() => handleViewPlan(item)}
        activeOpacity={0.7}>
        <View style={styles.planContent}>
          <Text style={styles.planName}>{item.name}</Text>
          <Text style={styles.planDate}>
            Created {format(parseISO(item.created_at), 'MMM d, yyyy')}
          </Text>
          <Text style={styles.planRecipes}>{recipeCount} recipes</Text>
        </View>

        <View style={styles.planActions}>
          <TouchableOpacity
            style={styles.planActionButton}
            onPress={() => handleEditPlan(item)}>
            <Icon name="edit-2" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.planActionButton}
            onPress={() => handleDuplicatePlan(item._id)}>
            <Icon name="copy" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.planActionButton}
            onPress={() => handleDeletePlan(item._id)}>
            <Icon name="trash-2" size={20} color={colors.semantic.error} />
          </TouchableOpacity>
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

  return (
    <PageContainer safeArea={false}>
      <Header title="Meal Plans" showBack={false} />

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

      <View style={styles.createButtonContainer}>
        <Button
          title="Create Meal Plan"
          onPress={handleCreatePlan}
          icon={<Icon name="plus" size={20} color={colors.white} />}
          fullWidth
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredPlans.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={[]} // Header only
          renderItem={() => null}
          ListHeaderComponent={() => (
            <>
              {activePlans.length > 0 && (
                <Section title="Active Plans">
                  {activePlans.map(plan => (
                    <View key={plan._id} style={styles.planCardWrapper}>
                      {renderPlanCard({ item: plan })}
                    </View>
                  ))}
                </Section>
              )}

              {pastPlans.length > 0 && (
                <Section title="Past Plans">
                  {pastPlans.map(plan => (
                    <View key={plan._id} style={styles.planCardWrapper}>
                      {renderPlanCard({ item: plan })}
                    </View>
                  ))}
                </Section>
              )}
            </>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  searchInput: {
    marginBottom: 0,
  },
  createButtonContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCardWrapper: {
    marginBottom: spacing.md,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...shadows.md,
  },
  planContent: {
    flex: 1,
  },
  planName: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontWeight: fontWeights.semibold,
  },
  planDate: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  planRecipes: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  planActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planActionButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
});

export default MealPlansScreen;
