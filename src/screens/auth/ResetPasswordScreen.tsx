import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PageContainer } from '../../components/layout/PageContainer';
import { ScrollContainer } from '../../components/layout/ScrollContainer';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/forms/Button';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { useAuth } from '../../hooks/useAuth';
import {
  colors,
  typography,
  spacing,
  fontWeights,
  borderRadius,
} from '../../theme';
import Icon from 'react-native-vector-icons/Feather';
import { AuthStackParamList } from '@/types';

type ResetPasswordScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ResetPassword'
>;

type ResetPasswordScreenRouteProp = RouteProp<
  AuthStackParamList,
  'ResetPassword'
>;

// Form data structure
type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

// Validation schema
const resetPasswordSchema = yup
  .object({
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  })
  .required();

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordScreenRouteProp>();
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get token from route params (would come from deep link)
  const token = route.params?.token || '';

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema) as any,
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      Alert.alert(
        'Error',
        'Invalid reset token. Please request a new password reset.',
      );
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        token,
        password: data.password,
      });

      // Success handling is done in useAuth hook
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error: any) {
      // Error handling is done in useAuth hook
      if (__DEV__) {
        console.error('Reset password error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return null;

    const strength = {
      score: 0,
      feedback: [],
    };

    if (password.length >= 8) strength.score += 1;
    if (/[a-z]/.test(password)) strength.score += 1;
    if (/[A-Z]/.test(password)) strength.score += 1;
    if (/[0-9]/.test(password)) strength.score += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength.score += 1;

    return strength.score;
  };

  const renderPasswordStrength = () => {
    const strength = getPasswordStrength();
    if (!strength) return null;

    const getStrengthColor = () => {
      if (strength <= 2) return colors.semantic.error;
      if (strength <= 3) return colors.semantic.warning;
      return colors.semantic.success;
    };

    const getStrengthText = () => {
      if (strength <= 2) return 'Weak';
      if (strength <= 3) return 'Good';
      return 'Strong';
    };

    return (
      <View style={styles.passwordStrength}>
        <View style={styles.strengthBars}>
          {[1, 2, 3, 4, 5].map(bar => (
            <View
              key={bar}
              style={[
                styles.strengthBar,
                {
                  backgroundColor:
                    bar <= strength ? getStrengthColor() : colors.gray[200],
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
          {getStrengthText()}
        </Text>
      </View>
    );
  };

  if (!token) {
    return (
      <PageContainer
        backgroundColor={colors.primary}
        statusBarStyle="light-content">
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.semantic.error} />
          <Text style={styles.errorTitle}>Invalid Reset Link</Text>
          <Text style={styles.errorMessage}>
            This password reset link is invalid or has expired. Please request a
            new password reset.
          </Text>
          <Button
            title="Request New Reset"
            onPress={() => navigation.navigate('ForgotPassword')}
            variant="primary"
            style={styles.errorButton}
          />
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      backgroundColor={colors.primary}
      statusBarStyle="light-content">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollContainer contentContainerStyle={styles.scrollContent}>
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}>
              <Icon name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/logo-white-text.png')}
              style={styles.logo}
              resizeMode="contain"
              defaultSource={require('../../../assets/images/logo-white-text.png')}
            />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.iconContainer}>
              <Icon name="lock" size={48} color={colors.primary} />
            </View>

            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below. Make sure it's strong and secure.
            </Text>

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="New Password"
                  placeholder="Enter your new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry={!showPassword}
                  leftIcon="lock"
                  rightIcon={showPassword ? 'eye-off' : 'eye'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerStyle={styles.input}
                />
              )}
            />

            {renderPasswordStrength()}

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  secureTextEntry={!showConfirmPassword}
                  leftIcon="lock"
                  rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onRightIconPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerStyle={styles.input}
                />
              )}
            />

            <Button
              title="Reset Password"
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              fullWidth
              style={styles.resetButton}
              loading={loading}
              disabled={loading}
            />

            <TouchableOpacity
              style={styles.backToLoginContainer}
              onPress={handleBackToLogin}>
              <Icon name="arrow-left" size={16} color={colors.primary} />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollContainer>
      </KeyboardAvoidingView>

      {loading && <LoadingOverlay message="Resetting password..." />}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  header: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.xxl,
  },
  logo: {
    width: 144,
    height: 43,
    marginBottom: spacing.md,
    tintColor: colors.white,
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  input: {
    marginBottom: spacing.md,
    width: '100%',
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
  },
  strengthBars: {
    flexDirection: 'row',
    flex: 1,
    marginRight: spacing.sm,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    marginRight: 2,
    borderRadius: 2,
  },
  strengthText: {
    ...typography.bodySmall,
    fontWeight: fontWeights.semibold,
  },
  resetButton: {
    marginBottom: spacing.lg,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backToLoginText: {
    ...typography.bodyRegular,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
    marginLeft: spacing.xs,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.bodyRegular,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  errorButton: {
    marginBottom: spacing.lg,
  },
});

export default ResetPasswordScreen;
