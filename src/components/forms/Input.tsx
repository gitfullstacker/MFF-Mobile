import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface InputProps extends Omit<TextInputProps, 'onChangeText'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  helperText,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const showPassword = secureTextEntry && !isPasswordVisible;
  const inputBorderColor = error
    ? colors.semantic.error
    : isFocused
    ? colors.primary
    : colors.border.default;

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.iconContainer}>
          <Icon
            name={isPasswordVisible ? 'eye' : 'eye-off'}
            size={20}
            color={colors.gray[400]}
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.iconContainer}
          disabled={!onRightIconPress}>
          <Icon name={rightIcon} size={20} color={colors.gray[400]} />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          { borderColor: inputBorderColor },
          multiline && styles.multilineContainer,
          disabled && styles.disabledContainer,
        ]}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            <Icon name={leftIcon} size={20} color={colors.gray[400]} />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={showPassword}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...rest}
        />

        {renderRightIcon()}
      </View>

      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}

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
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeights.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    minHeight: 48,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    minHeight: 100,
    paddingVertical: spacing.sm,
  },
  disabledContainer: {
    backgroundColor: colors.gray[50],
  },
  iconContainer: {
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.bodyRegular,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  multilineInput: {
    paddingTop: spacing.sm,
    height: '100%',
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.semantic.error,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
