import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Picker as RNPicker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Feather';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';

interface PickerItem {
  label: string;
  value: string;
}

interface PickerProps {
  label?: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const Picker: React.FC<PickerProps> = ({
  label,
  selectedValue,
  onValueChange,
  items,
  error,
  disabled = false,
  placeholder = 'Select an option',
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);
  const displayValue = selectedItem?.label || placeholder;

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  // For iOS, we use a modal with custom UI
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}

        <TouchableOpacity
          style={[
            styles.touchableInput,
            error && styles.inputError,
            disabled && styles.inputDisabled,
          ]}
          onPress={() => !disabled && setModalVisible(true)}
          activeOpacity={0.7}
          disabled={disabled}>
          <Text
            style={[styles.inputText, !selectedItem && styles.placeholderText]}>
            {displayValue}
          </Text>
          <Icon
            name="chevron-down"
            size={20}
            color={disabled ? colors.text.disabled : colors.text.secondary}
          />
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label || 'Select'}</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}>
                  <Icon name="x" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                {items.map(item => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.modalItem,
                      selectedValue === item.value && styles.modalItemSelected,
                    ]}
                    onPress={() => handleSelect(item.value)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedValue === item.value &&
                          styles.modalItemTextSelected,
                      ]}>
                      {item.label}
                    </Text>
                    {selectedValue === item.value && (
                      <Icon name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // For Android, use native picker
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.pickerWrapper,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}>
        <RNPicker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          enabled={!disabled}
          style={styles.picker}>
          {!selectedValue && (
            <RNPicker.Item
              label={placeholder}
              value=""
              color={colors.text.disabled}
            />
          )}
          {items.map(item => (
            <RNPicker.Item
              key={item.value}
              label={item.label}
              value={item.value}
            />
          ))}
        </RNPicker>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyRegular,
    fontWeight: fontWeights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  touchableInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  inputText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    flex: 1,
  },
  placeholderText: {
    color: colors.text.disabled,
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  inputDisabled: {
    backgroundColor: colors.gray[100],
    opacity: 0.6,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.semantic.error,
    marginTop: spacing.xs,
  },
  pickerWrapper: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...typography.h6,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalContent: {
    maxHeight: 400,
    paddingBottom: spacing.lg,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalItemSelected: {
    backgroundColor: colors.primary + '10',
  },
  modalItemText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    flex: 1,
  },
  modalItemTextSelected: {
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
});
