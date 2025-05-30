import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheet } from './BottomSheet';
import { RecipeFilterPanel } from '../recipe/RecipeFilterPanel';
import { colors, typography, spacing } from '../../theme';
import { RecipeFilters } from '../../types/recipe';

interface RecipeFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: RecipeFilters;
  onApply: (filters: RecipeFilters) => void;
}

export const RecipeFilterModal: React.FC<RecipeFilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApply,
}) => {
  return (
    <BottomSheet visible={visible} onClose={onClose} height={600}>
      <View style={styles.header}>
        <Text style={styles.title}>Filter Recipes</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <RecipeFilterPanel filters={filters} onApply={onApply} />
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
  title: {
    ...typography.h5,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
});
