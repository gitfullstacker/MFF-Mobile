import React, { useState, useEffect } from 'react';
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

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

// Strictly define the form data structure
type LoginFormData = {
  username: string;
  password: string;
  rememberMe: boolean;
};

// Define the validation schema with explicit typing
const loginSchema = yup
  .object({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
    rememberMe: yup.boolean().defined(),
  })
  .required();

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, savedCredentials } = useAuth();
  const [loading, setLoading] = useState(false);

  // Use explicit typing for the form
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema) as any,
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  // Load saved credentials if they exist
  useEffect(() => {
    if (savedCredentials) {
      setValue('username', savedCredentials.username);
      setValue('password', savedCredentials.password);
      setValue('rememberMe', savedCredentials.rememberMe);
    }
  }, [savedCredentials, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      await login(
        { username: data.username, password: data.password },
        data.rememberMe,
      );
      // Navigation will be handled automatically by the navigation stack
      // when isAuthenticated becomes true
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message ||
          'Please check your credentials and try again.',
        [{ text: 'OK' }],
      );
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
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/logo-white-text.png')}
              style={styles.logo}
              resizeMode="contain"
              defaultSource={require('../../../assets/images/logo-white-text.png')}
            />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign In</Text>

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Username"
                  placeholder="Enter your username"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.username?.message}
                  leftIcon="user"
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerStyle={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry
                  leftIcon="lock"
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerStyle={styles.input}
                />
              )}
            />

            <View style={styles.optionsRow}>
              <Controller
                control={control}
                name="rememberMe"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={styles.rememberMeContainer}
                    onPress={() => onChange(!value)}
                    activeOpacity={0.7}>
                    <View
                      style={[
                        styles.checkbox,
                        value ? styles.checkboxChecked : null,
                      ]}>
                      {value ? (
                        <Icon name="check" size={16} color={colors.white} />
                      ) : null}
                    </View>
                    <Text style={styles.rememberMeText}>Remember Me</Text>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Get Started"
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              fullWidth
              style={styles.signInButton}
              loading={loading}
              disabled={loading}
            />

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollContainer>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={loading} message="Signing in..." />
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
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
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  input: {
    marginBottom: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginRight: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberMeText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    ...typography.bodyRegular,
    color: colors.primary,
  },
  signInButton: {
    marginBottom: spacing.lg,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  signUpLink: {
    ...typography.bodyRegular,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
});

export default LoginScreen;
