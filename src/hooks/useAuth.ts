import { useAtom } from 'jotai';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  authTokenAtom,
  userAtom,
  isAuthenticatedAtom,
  addToastAtom,
} from '../store';
import { authService } from '../services/auth';
import { LoginRequest } from '../types/auth';

export const useAuth = () => {
  const [authToken, setAuthToken] = useAtom(authTokenAtom);
  const [user, setUser] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, addToast] = useAtom(addToastAtom);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        console.log('🔐 Starting login process...');

        // Call login endpoint
        const response = await authService.login(credentials);
        console.log('✅ Login response received:', {
          hasToken: !!response.token,
          hasUser: !!response.user,
        });

        // Store token as plain string
        const token = response.token;

        // Save to AsyncStorage first
        await AsyncStorage.setItem('authToken', token);
        console.log('💾 Token saved to AsyncStorage');

        // Then update atom
        setAuthToken(token);
        console.log('📝 Token set in atom');

        // Store user data
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        console.log('👤 User data stored');

        // Verify storage
        const storedToken = await AsyncStorage.getItem('authToken');
        console.log(
          '🔍 Verification - Stored token:',
          storedToken ? 'Found' : 'Not found',
        );

        addToast({
          message: 'Login successful!',
          type: 'success',
          duration: 3000,
        });

        return response;
      } catch (error: any) {
        console.error('❌ Login failed:', error);
        addToast({
          message: error.response?.data?.message || 'Login failed',
          type: 'error',
          duration: 5000,
        });
        throw error;
      }
    },
    [setAuthToken, setUser, addToast],
  );

  const logout = useCallback(async () => {
    try {
      console.log('👋 Starting logout...');

      // Clear token and user data
      setAuthToken(null);
      setUser(null);

      // Clear AsyncStorage
      await AsyncStorage.multiRemove(['authToken', 'user']);
      console.log('✅ Auth data cleared');

      addToast({
        message: 'Logged out successfully',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if there's an error, clear local data
      setAuthToken(null);
      setUser(null);
      await AsyncStorage.multiRemove(['authToken', 'user']);
    }
  }, [setAuthToken, setUser, addToast]);

  const updateProfile = useCallback(
    async (data: any) => {
      try {
        const updatedProfile = await authService.updateProfile(data);

        if (user) {
          // Map UserProfile to User format
          const updatedUser = {
            id: updatedProfile.user_id,
            email: updatedProfile.email,
            first_name: updatedProfile.first_name,
            last_name: updatedProfile.last_name,
            username: updatedProfile.username,
            avatar_url: updatedProfile.avatar_url,
          };

          setUser({ ...user, ...updatedUser });
        }

        addToast({
          message: 'Profile updated successfully!',
          type: 'success',
          duration: 3000,
        });

        return updatedProfile;
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to update profile',
          type: 'error',
          duration: 5000,
        });
        throw error;
      }
    },
    [user, setUser, addToast],
  );

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('🔍 Checking auth status...');
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        console.log('✅ Found stored auth data');
        setAuthToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Verify token is still valid by making a test request
        try {
          await authService.getProfile();
          console.log('✅ Token is valid');
        } catch (error) {
          console.log('❌ Token is invalid, clearing auth');
          await logout();
        }
      } else {
        console.log('❌ No stored auth data found');
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
    }
  }, [setAuthToken, setUser, logout]);

  return {
    user,
    authToken,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    checkAuthStatus,
  };
};
