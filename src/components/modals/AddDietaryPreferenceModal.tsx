import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheet } from './BottomSheet';
import { Button } from '../forms/Button';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
} from '../../theme';
import { COMMON_INGREDIENTS } from '@/constants';

interface AddDietaryPreferenceModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (
    name: string,
    type: 'avoid' | 'dislike',
    reason?: string,
  ) => Promise<void>;
}

export const AddDietaryPreferenceModal: React.FC<
  AddDietaryPreferenceModalProps
> = ({ visible, onClose, onAdd }) => {
  const [ingredient, setIngredient] = useState('');
  const [selectedType, setSelectedType] = useState<'avoid' | 'dislike'>(
    'avoid',
  );
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (ingredient.trim().length > 0) {
      const filtered = COMMON_INGREDIENTS.filter(item =>
        item.toLowerCase().includes(ingredient.toLowerCase()),
      ).slice(0, 8);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [ingredient]);

  const handleClose = () => {
    setIngredient('');
    setSelectedType('avoid');
    setReason('');
    setShowSuggestions(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!ingredient.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(ingredient.trim(), selectedType, reason.trim() || undefined);
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setIngredient(suggestion);
    setShowSuggestions(false);
  };

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => selectSuggestion(item)}>
      <Icon name="search" size={16} color={colors.text.secondary} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheet visible={visible} onClose={handleClose} height="85%">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name="plus-circle" size={24} color={colors.primary} />
            <Text style={styles.title}>Add Dietary Preference</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="x" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Ingredient Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Ingredient Name *</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="search"
                size={20}
                color={colors.text.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={ingredient}
                onChangeText={setIngredient}
                placeholder="Type or select an ingredient"
                placeholderTextColor={colors.text.disabled}
                autoCapitalize="words"
              />
              {ingredient.length > 0 && (
                <TouchableOpacity
                  onPress={() => setIngredient('')}
                  style={styles.clearButton}>
                  <Icon
                    name="x-circle"
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.helperText}>
              Start typing to see suggestions or enter a custom ingredient
            </Text>

            {/* Suggestions List */}
            {showSuggestions && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={filteredSuggestions}
                  renderItem={renderSuggestion}
                  keyExtractor={item => item}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => (
                    <View style={styles.suggestionSeparator} />
                  )}
                />
              </View>
            )}
          </View>

          {/* Type Selection */}
          <View style={styles.typeSection}>
            <Text style={styles.label}>Preference Type *</Text>
            <View style={styles.typeOptions}>
              <TouchableOpacity
                style={[
                  styles.typeCard,
                  selectedType === 'avoid' && styles.typeCardSelected,
                  {
                    borderColor:
                      selectedType === 'avoid'
                        ? colors.semantic.error
                        : colors.border.light,
                  },
                ]}
                onPress={() => setSelectedType('avoid')}>
                <View
                  style={[
                    styles.typeIcon,
                    {
                      backgroundColor:
                        selectedType === 'avoid'
                          ? colors.semantic.error + '15'
                          : colors.gray[50],
                    },
                  ]}>
                  <Icon
                    name="x-circle"
                    size={24}
                    color={
                      selectedType === 'avoid'
                        ? colors.semantic.error
                        : colors.text.secondary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.typeTitle,
                    selectedType === 'avoid' && styles.typeTitleSelected,
                  ]}>
                  Avoid
                </Text>
                <Text style={styles.typeDescription}>
                  Completely excluded from recipes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeCard,
                  selectedType === 'dislike' && styles.typeCardSelected,
                  {
                    borderColor:
                      selectedType === 'dislike'
                        ? colors.semantic.warning
                        : colors.border.light,
                  },
                ]}
                onPress={() => setSelectedType('dislike')}>
                <View
                  style={[
                    styles.typeIcon,
                    {
                      backgroundColor:
                        selectedType === 'dislike'
                          ? colors.semantic.warning + '15'
                          : colors.gray[50],
                    },
                  ]}>
                  <Icon
                    name="thumbs-down"
                    size={24}
                    color={
                      selectedType === 'dislike'
                        ? colors.semantic.warning
                        : colors.text.secondary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.typeTitle,
                    selectedType === 'dislike' && styles.typeTitleSelected,
                  ]}>
                  Dislike
                </Text>
                <Text style={styles.typeDescription}>
                  Shown less frequently
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reason Input */}
          <View style={styles.reasonSection}>
            <Text style={styles.label}>Reason (Optional)</Text>
            <TextInput
              style={styles.reasonInput}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g., Allergic reaction, Personal preference, etc."
              placeholderTextColor={colors.text.disabled}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>
              Help us understand why you want to avoid or dislike this
              ingredient
            </Text>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={handleClose}
            variant="outline"
            style={styles.footerButton}
          />
          <Button
            title={isSubmitting ? 'Adding...' : 'Add Preference'}
            onPress={handleSubmit}
            disabled={!ingredient.trim() || isSubmitting}
            loading={isSubmitting}
            icon={<Icon name="check" size={16} color={colors.white} />}
            style={styles.footerButton}
          />
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h6,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodyRegular,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.bodyRegular,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  clearButton: {
    padding: spacing.xs,
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  suggestionsContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  suggestionText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  suggestionSeparator: {
    height: 1,
    backgroundColor: colors.border.light,
  },
  typeSection: {
    marginBottom: spacing.lg,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  typeCardSelected: {
    borderWidth: 2,
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  typeTitle: {
    ...typography.bodyLarge,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  typeTitleSelected: {
    color: colors.primary,
  },
  typeDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  reasonSection: {
    marginBottom: spacing.lg,
  },
  reasonInput: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 80,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  footerButton: {
    flex: 1,
  },
});
