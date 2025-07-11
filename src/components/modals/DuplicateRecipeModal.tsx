import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheet } from './BottomSheet';
import { Button } from '../forms/Button';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Recipe } from '../../types/recipe';

interface DuplicateRecipeModalProps {
  visible: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  existingDays: string[];
  onAction: (action: 'cancel' | 'with-ingredients' | 'only-recipe') => void;
}

export const DuplicateRecipeModal: React.FC<DuplicateRecipeModalProps> = ({
  visible,
  onClose,
  recipe,
  existingDays,
  onAction,
}) => {
  if (!recipe) return null;

  const handleAction = (
    action: 'cancel' | 'with-ingredients' | 'only-recipe',
  ) => {
    onAction(action);
    if (action !== 'cancel') {
      onClose();
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height={600}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Icon
              name="alert-triangle"
              size={24}
              color={colors.semantic.warning}
            />
          </View>
          <Text style={styles.title}>Recipe Already Added</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.description}>
          <Text style={styles.recipeName}>"{recipe.name}"</Text> is already
          scheduled for{' '}
          <Text style={styles.daysList}>{existingDays.join(', ')}</Text>.
        </Text>

        <Text style={styles.subDescription}>
          Would you like to add it again?
        </Text>

        {/* Options explanation */}
        <View style={styles.optionsContainer}>
          <View style={styles.optionItem}>
            <Icon name="shopping-cart" size={20} color={colors.primary} />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>With Ingredients</Text>
              <Text style={styles.optionSubtitle}>
                Include ingredients in shopping list
              </Text>
            </View>
          </View>

          <View style={styles.optionItem}>
            <Icon name="book-open" size={20} color={colors.text.secondary} />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Only Recipe</Text>
              <Text style={styles.optionSubtitle}>
                Recipe only, no ingredients added
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={() => handleAction('cancel')}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="With Ingredients"
            onPress={() => handleAction('with-ingredients')}
            style={styles.actionButton}
          />
          <Button
            title="Only Recipe"
            onPress={() => handleAction('only-recipe')}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </View>
    </BottomSheet>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.semantic.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.bold,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    paddingTop: spacing.md,
  },
  description: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  recipeName: {
    color: colors.text.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  daysList: {
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  subDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  optionsContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  optionText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  optionTitle: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.medium,
  },
  optionSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  actions: {
    gap: spacing.sm,
  },
  actionButton: {
    marginBottom: 0,
  },
});
