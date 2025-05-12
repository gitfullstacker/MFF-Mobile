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
import { AuthStackParamList } from '../../navigation/types';

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

const schema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

interface LoginFormData {
  username: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      await login(data);
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

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
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
