import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Button } from '../forms/Button';
import { Input } from '../forms/Input';
import { colors, typography, spacing } from '../../theme';
import { RecipeFilters } from '../../types/recipe';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: RecipeFilters;
  onApply: (filters: RecipeFilters) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApply,
}) => {
  const [localFilters, setLocalFilters] = useState<RecipeFilters>(filters);

  const handleReset = () => {
    setLocalFilters({});
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const updateFilter = (key: keyof RecipeFilters, value: any) => {
    setLocalFilters({
      ...localFilters,
      [key]: value,
    });
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height={600}>
      <View style={styles.header}>
        <Text style={styles.title}>Filter Recipes</Text>
        <Button
          title="Reset"
          onPress={handleReset}
          variant="text"
          size="small"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Min Protein (g)"
                value={localFilters.proteinMin?.toString() || ''}
                onChangeText={text =>
                  updateFilter('proteinMin', text ? Number(text) : undefined)
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Max Protein (g)"
                value={localFilters.proteinMax?.toString() || ''}
                onChangeText={text =>
                  updateFilter('proteinMax', text ? Number(text) : undefined)
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Min Carbs (g)"
                value={localFilters.carbsMin?.toString() || ''}
                onChangeText={text =>
                  updateFilter('carbsMin', text ? Number(text) : undefined)
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Max Carbs (g)"
                value={localFilters.carbsMax?.toString() || ''}
                onChangeText={text =>
                  updateFilter('carbsMax', text ? Number(text) : undefined)
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Min Fat (g)"
                value={localFilters.fatMin?.toString() || ''}
                onChangeText={text =>
                  updateFilter('fatMin', text ? Number(text) : undefined)
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Max Fat (g)"
                value={localFilters.fatMax?.toString() || ''}
                onChangeText={text =>
                  updateFilter('fatMax', text ? Number(text) : undefined)
                }
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooking Time</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Min Time (min)"
                value={localFilters.timeMin?.toString() || ''}
                onChangeText={text =>
                  updateFilter('timeMin', text ? Number(text) : undefined)
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Max Time (min)"
                value={localFilters.timeMax?.toString() || ''}
                onChangeText={text =>
                  updateFilter('timeMax', text ? Number(text) : undefined)
                }
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Apply Filters"
          onPress={handleApply}
          variant="primary"
          fullWidth
        />
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
  title: {
    ...typography.h5,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  footer: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
