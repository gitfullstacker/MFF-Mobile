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
import { useNavigation } from '@react-navigation/native';
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

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

// Form data structure
type ForgotPasswordFormData = {
  email: string;
};

// Validation schema
const forgotPasswordSchema = yup
  .object({
    email: yup
      .string()
      .email('Please enter a valid email address')
      .required('Email is required'),
  })
  .required();

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema) as any,
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      await forgotPassword(data);
      setEmailSent(true);

      // Navigation handled by the toast message from useAuth
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error: any) {
      // Error handling is done in useAuth hook
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const handleResendEmail = async () => {
    const email = getValues('email');
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first.');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword({ email });
    } catch (error: any) {
      // Error handling is done in useAuth hook
      console.error('Resend email error:', error);
    } finally {
      setLoading(false);
    }
  };

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
              <Icon name="mail" size={48} color={colors.primary} />
            </View>

            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Don't worry! Enter your email address and we'll send you a link to
              reset your password.
            </Text>

            {!emailSent ? (
              <>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Email Address"
                      placeholder="Enter your email address"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                      leftIcon="mail"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      containerStyle={styles.input}
                    />
                  )}
                />

                <Button
                  title="Send Reset Link"
                  onPress={handleSubmit(onSubmit)}
                  variant="primary"
                  fullWidth
                  style={styles.sendButton}
                  loading={loading}
                  disabled={loading}
                />
              </>
            ) : (
              <View style={styles.successContainer}>
                <Icon
                  name="check-circle"
                  size={64}
                  color={colors.semantic.success}
                />
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successMessage}>
                  We've sent a password reset link to your email. Please check
                  your inbox and follow the instructions.
                </Text>

                <Button
                  title="Resend Email"
                  onPress={handleResendEmail}
                  variant="outline"
                  fullWidth
                  style={styles.resendButton}
                  loading={loading}
                  disabled={loading}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.backToLoginContainer}
              onPress={handleBackToLogin}>
              <Icon name="arrow-left" size={16} color={colors.primary} />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollContainer>
      </KeyboardAvoidingView>

      {loading && <LoadingOverlay message="Sending email..." />}
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
    marginBottom: spacing.lg,
    width: '100%',
  },
  sendButton: {
    marginBottom: spacing.lg,
  },
  successContainer: {
    alignItems: 'center',
    width: '100%',
  },
  successTitle: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  successMessage: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  resendButton: {
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
});

export default ForgotPasswordScreen;
