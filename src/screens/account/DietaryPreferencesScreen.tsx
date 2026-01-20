import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { useDietaryPreferences } from '../../hooks/useDietaryPreferences';
import { AddDietaryPreferenceModal } from '../../components/modals/AddDietaryPreferenceModal';
import { DietaryPreferenceItem } from '../../types/dietaryPreference';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';

const DietaryPreferencesScreen: React.FC = () => {
  const {
    preferences,
    stats,
    loading,
    fetchPreferences,
    addPreference,
    removePreference,
  } = useDietaryPreferences();

  const [showAddModal, setShowAddModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await fetchPreferences();
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading dietary preferences:', error);
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAddPreference = async (
    name: string,
    type: 'avoid' | 'dislike',
    reason?: string,
  ) => {
    try {
      await addPreference({ name, type, reason });
      setShowAddModal(false);
      Alert.alert(
        'Success',
        `${name} added to ${type === 'avoid' ? 'avoid' : 'dislike'} list`,
      );
    } catch (error: any) {
      if (error.response?.status === 409) {
        Alert.alert('Already Exists', `${name} is already in your preferences`);
      } else {
        Alert.alert('Error', 'Failed to add dietary preference');
      }
    }
  };

  const handleRemovePreference = (preference: DietaryPreferenceItem) => {
    Alert.alert(
      'Remove Preference',
      `Remove ${preference.name} from ${
        preference.type === 'avoid' ? 'avoid' : 'dislike'
      } list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePreference(preference.id);
              Alert.alert('Success', `${preference.name} removed successfully`);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove preference');
            }
          },
        },
      ],
    );
  };

  const avoidList = preferences.filter(pref => pref.type === 'avoid');
  const dislikeList = preferences.filter(pref => pref.type === 'dislike');

  const renderStatsCard = (
    icon: string,
    value: number,
    label: string,
    color: string,
  ) => (
    <View style={[styles.statsCard, { borderColor: color + '30' }]}>
      <View style={[styles.statsIcon, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statsValue, { color }]}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );

  const renderPreferenceItem = ({ item }: { item: DietaryPreferenceItem }) => (
    <View
      style={[
        styles.preferenceCard,
        {
          borderColor:
            item.type === 'avoid'
              ? colors.semantic.error + '30'
              : colors.semantic.warning + '30',
        },
      ]}>
      <View style={styles.preferenceContent}>
        <View style={styles.preferenceHeader}>
          <Icon
            name={item.type === 'avoid' ? 'x-circle' : 'thumbs-down'}
            size={20}
            color={
              item.type === 'avoid'
                ? colors.semantic.error
                : colors.semantic.warning
            }
          />
          <Text style={styles.preferenceName}>{item.name}</Text>
        </View>
        {item.reason && (
          <Text style={styles.preferenceReason}>{item.reason}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemovePreference(item)}>
        <Icon name="trash-2" size={18} color={colors.semantic.error} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = (type: 'avoid' | 'dislike') => (
    <View style={styles.emptyState}>
      <Icon
        name={type === 'avoid' ? 'x-circle' : 'thumbs-down'}
        size={48}
        color={colors.gray[300]}
      />
      <Text style={styles.emptyStateText}>
        No {type === 'avoid' ? 'avoided' : 'disliked'} ingredients yet
      </Text>
    </View>
  );

  if (initialLoading) {
    return (
      <PageContainer>
        <Header title="Dietary Preferences" showBack={true} />
        <LoadingOverlay message="Loading preferences..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header title="Dietary Preferences" showBack={true} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header Info */}
        <View style={styles.header}>
          <Text style={styles.title}>Manage Your Preferences</Text>
          <Text style={styles.subtitle}>
            Personalize your recipe recommendations by managing ingredients you
            want to avoid or dislike
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {renderStatsCard(
            'layers',
            stats.total,
            'Total',
            colors.semantic.info,
          )}
          {renderStatsCard(
            'x-circle',
            stats.avoid,
            'Avoid',
            colors.semantic.error,
          )}
          {renderStatsCard(
            'thumbs-down',
            stats.dislike,
            'Dislike',
            colors.semantic.warning,
          )}
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}>
          <Icon name="plus" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Add New Preference</Text>
        </TouchableOpacity>

        {/* Avoid List */}
        <Section title="Avoid">
          <View style={styles.sectionDescription}>
            <Icon
              name="info"
              size={16}
              color={colors.text.secondary}
              style={styles.infoIcon}
            />
            <Text style={styles.sectionDescriptionText}>
              Completely excluded from recipes
            </Text>
          </View>
          {avoidList.length === 0 ? (
            renderEmptyState('avoid')
          ) : (
            <FlatList
              data={avoidList}
              renderItem={renderPreferenceItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => (
                <View style={{ height: spacing.sm }} />
              )}
            />
          )}
        </Section>

        {/* Dislike List */}
        <Section title="Dislike">
          <View style={styles.sectionDescription}>
            <Icon
              name="info"
              size={16}
              color={colors.text.secondary}
              style={styles.infoIcon}
            />
            <Text style={styles.sectionDescriptionText}>
              Shown less frequently in recommendations
            </Text>
          </View>
          {dislikeList.length === 0 ? (
            renderEmptyState('dislike')
          ) : (
            <FlatList
              data={dislikeList}
              renderItem={renderPreferenceItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => (
                <View style={{ height: spacing.sm }} />
              )}
            />
          )}
        </Section>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon
            name="info"
            size={20}
            color={colors.semantic.info}
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              Ingredients marked as "avoid" will be completely excluded from
              your recipe recommendations, while "dislike" ingredients will be
              shown less frequently. This helps us personalize your meal
              planning experience.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Preference Modal */}
      <AddDietaryPreferenceModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddPreference}
      />

      {loading && <LoadingOverlay message="Processing..." />}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h5,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statsCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    ...shadows.sm,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statsValue: {
    ...typography.h3,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
  },
  statsLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  addButtonText: {
    ...typography.bodyLarge,
    color: colors.white,
    fontWeight: fontWeights.semibold,
    marginLeft: spacing.sm,
  },
  sectionDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  sectionDescriptionText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    ...shadows.sm,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  preferenceName: {
    ...typography.bodyLarge,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  preferenceReason: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.lg + spacing.sm,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.semantic.info + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.bodyLarge,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default DietaryPreferencesScreen;
