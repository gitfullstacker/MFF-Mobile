import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/Feather';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/forms/Button';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { useAuth } from '../../hooks/useAuth';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
} from '../../theme';

// Form validation schema
const profileSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
});

const passwordSchema = yup.object({
  current_password: yup.string().required('Current password is required'),
  new_password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('new_password')], 'Passwords must match')
    .required('Please confirm your password'),
});

type ProfileFormData = {
  first_name: string;
  last_name: string;
  email: string;
};

type PasswordFormData = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateProfile, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'password'>(
    'profile',
  );

  // Profile form
  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
    },
  });

  // Password form
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      resetProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user, resetProfile]);

  // Handle profile update
  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      await updateProfile(data);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      setLoading(true);

      await changePassword({
        currentPassword: data.current_password,
        newPassword: data.new_password,
      });

      resetPassword();
      Alert.alert('Success', 'Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer safeArea={false}>
      <Header title="Profile" showBack={true} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <Image
                source={{
                  uri: user.avatar_url,
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="user" size={40} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            Tap to change avatar via Gravatar
          </Text>
        </View>

        {/* Section Toggle */}
        <View style={styles.sectionToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeSection === 'profile' && styles.toggleButtonActive,
            ]}
            onPress={() => setActiveSection('profile')}>
            <Text
              style={[
                styles.toggleButtonText,
                activeSection === 'profile' && styles.toggleButtonTextActive,
              ]}>
              Profile Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeSection === 'password' && styles.toggleButtonActive,
            ]}
            onPress={() => setActiveSection('password')}>
            <Text
              style={[
                styles.toggleButtonText,
                activeSection === 'password' && styles.toggleButtonTextActive,
              ]}>
              Change Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Information Form */}
        {activeSection === 'profile' && (
          <Section title="Personal Information">
            <Controller
              control={profileControl}
              name="first_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="First Name"
                  placeholder="Enter your first name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={profileErrors.first_name?.message}
                  leftIcon="user"
                />
              )}
            />

            <Controller
              control={profileControl}
              name="last_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Last Name"
                  placeholder="Enter your last name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={profileErrors.last_name?.message}
                  leftIcon="user"
                />
              )}
            />

            <Controller
              control={profileControl}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={profileErrors.email?.message}
                  leftIcon="mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />

            <Button
              title="Update Profile"
              onPress={handleProfileSubmit(onSubmitProfile)}
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading || !isProfileDirty}
              style={styles.submitButton}
            />
          </Section>
        )}

        {/* Password Change Form */}
        {activeSection === 'password' && (
          <Section title="Change Password">
            <Controller
              control={passwordControl}
              name="current_password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Current Password"
                  placeholder="Enter your current password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={passwordErrors.current_password?.message}
                  secureTextEntry
                  leftIcon="lock"
                />
              )}
            />

            <Controller
              control={passwordControl}
              name="new_password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="New Password"
                  placeholder="Enter your new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={passwordErrors.new_password?.message}
                  secureTextEntry
                  leftIcon="lock"
                  helperText="Password must be at least 8 characters long"
                />
              )}
            />

            <Controller
              control={passwordControl}
              name="confirm_password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={passwordErrors.confirm_password?.message}
                  secureTextEntry
                  leftIcon="lock"
                />
              )}
            />

            <Button
              title="Change Password"
              onPress={handlePasswordSubmit(onSubmitPassword)}
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            />
          </Section>
        )}
      </ScrollView>

      {loading && <LoadingOverlay message="Updating profile..." />}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  sectionToggle: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium,
  },
  toggleButtonTextActive: {
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});

export default ProfileScreen;
