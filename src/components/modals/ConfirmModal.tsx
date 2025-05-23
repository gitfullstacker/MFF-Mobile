import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheet } from './BottomSheet';
import { Button } from '../forms/Button';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  confirmButtonTextColor?: string;
  confirmIcon?: string;
  isLoading?: boolean;
  destructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonColor,
  confirmButtonTextColor,
  confirmIcon,
  isLoading = false,
  destructive = false,
}) => {
  // Determine the confirm button color based on the destructive flag
  const buttonColor =
    confirmButtonColor ||
    (destructive ? colors.semantic.error : colors.primary);
  const textColor =
    confirmButtonTextColor ||
    (destructive ? colors.semantic.error : colors.primary);

  // Create the confirm button style dynamically
  const confirmButtonStyle: ViewStyle = {
    ...styles.confirmButton,
  };

  // Add border color conditionally
  if (destructive) {
    confirmButtonStyle.borderColor = buttonColor;
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} height="auto">
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={cancelText}
          onPress={onClose}
          variant="outline"
          style={styles.cancelButton}
          disabled={isLoading}
        />

        <Button
          title={confirmText}
          onPress={onConfirm}
          variant={destructive ? 'outline' : 'primary'}
          style={confirmButtonStyle}
          textStyle={destructive ? { color: textColor } : undefined}
          icon={
            confirmIcon ? (
              <Icon
                name={confirmIcon}
                size={18}
                color={destructive ? textColor : colors.white}
              />
            ) : undefined
          }
          loading={isLoading}
          disabled={isLoading}
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
    fontWeight: typography.fontWeights.semibold,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    paddingVertical: spacing.lg,
  },
  message: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
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
