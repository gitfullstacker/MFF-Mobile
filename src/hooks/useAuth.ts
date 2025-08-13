import { useCallback } from 'react';
import { useAtom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  authTokenAtom,
  userAtom,
  isAuthenticatedAtom,
  addToastAtom,
  savedCredentialsAtom,
  subscriptionStatsAtom,
  favoriteRecipeIdsAtom,
  activePlanAtom,
  tokenExpirationAtom,
} from '../store';
import { authService } from '../services/auth';
import { userService } from '../services/user';
import { subscriptionService } from '../services/subscription';
import { favoriteService } from '../services/favorite';
import { planService } from '../services/plan';
import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
} from '../types/auth';
import { isTokenExpiredCombined } from '../utils/tokenUtils';

export const useAuth = () => {
  const [authToken, setAuthToken] = useAtom(authTokenAtom);
  const [user, setUser] = useAtom(userAtom);
  const [tokenExpiration, setTokenExpiration] = useAtom(tokenExpirationAtom);
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [savedCredentials, setSavedCredentials] = useAtom(savedCredentialsAtom);
  const [, setSubscriptionStats] = useAtom(subscriptionStatsAtom);
  const [, setFavoriteIds] = useAtom(favoriteRecipeIdsAtom);
  const [, setActivePlan] = useAtom(activePlanAtom);
  const [, addToast] = useAtom(addToastAtom);

  const fetchAndSetSubscriptionStats = useCallback(async () => {
    try {
      const stats = await subscriptionService.getSubscriptionStats();
      setSubscriptionStats(stats);
      return stats;
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      // Set default stats on error
      setSubscriptionStats({
        status: null,
        name: null,
        expire_date: null,
        paid_date: null,
        total_price: null,
        subscription_id: null,
        product_id: null,
        allowed_category_ids: [],
      });
      return null;
    }
  }, [setSubscriptionStats]);

  const fetchAndSetFavoriteIds = useCallback(async () => {
    try {
      const favoriteIds = await favoriteService.getFavoriteIds();
      const favoriteRecipeIds = favoriteIds.ids;
      setFavoriteIds(favoriteRecipeIds);
      return favoriteRecipeIds;
    } catch (error) {
      console.error('Error fetching favorite recipe IDs:', error);
      setFavoriteIds([]);
      return [];
    }
  }, [setFavoriteIds]);

  const fetchAndSetActivePlan = useCallback(async () => {
    try {
      const plan = await planService.getActivePlan();
      setActivePlan(plan);
      return plan;
    } catch (error) {
      console.error('Error fetching active plan:', error);
      setActivePlan(null);
      return null;
    }
  }, [setActivePlan]);

  const login = useCallback(
    async (credentials: LoginRequest, rememberMe: boolean = false) => {
      try {
        console.log('🔐 Attempting login...');
        const response = await authService.login(credentials);

        console.log('✅ Login successful:', {
          hasToken: !!response.token,
          hasUser: !!response.user,
          expires_at: response.expires_at,
          expires_in: response.expires_in,
        });

        // Store auth data
        setAuthToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);

        // Save credentials if rememberMe is true
        if (rememberMe) {
          setSavedCredentials({
            username: credentials.username,
            password: credentials.password,
            rememberMe: true,
          });
        } else {
          setSavedCredentials(null);
        }

        // Fetch user-specific data after successful login
        await Promise.all([
          fetchAndSetSubscriptionStats(),
          fetchAndSetFavoriteIds(),
          fetchAndSetActivePlan(),
        ]);

        addToast({
          message: 'Login successful!',
          type: 'success',
          duration: 3000,
        });

        return response;
      } catch (error: any) {
        console.error('❌ Login failed:', error);

        const errorMessage =
          error.response?.data?.message ||
          'Login failed. Please check your credentials and try again.';

        addToast({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        });

        throw error;
      }
    },
    [
      setAuthToken,
      setUser,
      setTokenExpiration,
      setIsAuthenticated,
      setSavedCredentials,
      addToast,
      fetchAndSetSubscriptionStats,
      fetchAndSetFavoriteIds,
      fetchAndSetActivePlan,
    ],
  );

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');

      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');

      // Clear all auth-related data
      setAuthToken(null);
      setUser(null);
      setTokenExpiration(null);
      setIsAuthenticated(false);

      // Clear all user-specific data on logout
      setSubscriptionStats({
        status: null,
        name: null,
        expire_date: null,
        paid_date: null,
        total_price: null,
        subscription_id: null,
        product_id: null,
        allowed_category_ids: [],
      });
      setFavoriteIds([]);
      setActivePlan(null);

      console.log('✅ Logout successful');

      addToast({
        message: 'You have been logged out successfully.',
        type: 'info',
        duration: 3000,
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      setAuthToken(null);
      setUser(null);
      setTokenExpiration(null);
      setIsAuthenticated(false);
      setSubscriptionStats({
        status: null,
        name: null,
        expire_date: null,
        paid_date: null,
        total_price: null,
        subscription_id: null,
        product_id: null,
        allowed_category_ids: [],
      });
      setFavoriteIds([]);
      setActivePlan(null);
    }
  }, [
    setAuthToken,
    setUser,
    setTokenExpiration,
    setIsAuthenticated,
    setSubscriptionStats,
    setFavoriteIds,
    setActivePlan,
    addToast,
  ]);

  const updateProfile = useCallback(
    async (data: any) => {
      try {
        const updatedProfile = await userService.updateProfile(data);

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
        console.error('❌ Update profile failed:', error);

        const errorMessage =
          error.response?.data?.message ||
          'Failed to update profile. Please try again.';

        addToast({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        });

        throw error;
      }
    },
    [user, setUser, addToast],
  );

  const forgotPassword = useCallback(
    async (data: ForgotPasswordRequest) => {
      try {
        const response = await authService.forgotPassword(data);

        addToast({
          message: 'Password reset email sent successfully!',
          type: 'success',
          duration: 5000,
        });

        return response;
      } catch (error: any) {
        console.error('❌ Forgot password failed:', error);

        const errorMessage =
          error.response?.data?.message ||
          'Failed to send password reset email. Please try again.';

        addToast({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        });

        throw error;
      }
    },
    [addToast],
  );

  const resetPassword = useCallback(
    async (data: ResetPasswordRequest) => {
      try {
        const response = await authService.resetPassword(data);

        addToast({
          message: 'Password reset successfully!',
          type: 'success',
          duration: 3000,
        });

        return response;
      } catch (error: any) {
        console.error('❌ Reset password failed:', error);

        const errorMessage =
          error.response?.data?.message ||
          'Failed to reset password. Please try again.';

        addToast({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        });

        throw error;
      }
    },
    [addToast],
  );

  const changePassword = useCallback(
    async (data: ChangePasswordRequest) => {
      try {
        const response = await authService.changePassword(data);

        addToast({
          message: 'Password changed successfully!',
          type: 'success',
          duration: 3000,
        });

        return response;
      } catch (error: any) {
        console.error('❌ Change password failed:', error);

        const errorMessage =
          error.response?.data?.message ||
          'Failed to change password. Please try again.';

        addToast({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        });

        throw error;
      }
    },
    [addToast],
  );

  const checkAuthStatus = useCallback(async () => {
    try {
      if (authToken && user) {
        // Check if token is expired
        if (isTokenExpiredCombined(authToken, tokenExpiration)) {
          console.log('❌ Token expired, logging out');
          await logout();
          return false;
        }

        setIsAuthenticated(true);

        // Verify token is still valid by making a test request
        try {
          await userService.getProfile();
          // Fetch user-specific data for authenticated users
          await Promise.all([
            fetchAndSetSubscriptionStats(),
            fetchAndSetFavoriteIds(),
            fetchAndSetActivePlan(),
          ]);
          return true;
        } catch (error) {
          console.log('❌ Token is invalid, logging out');
          await logout();
          return false;
        }
      } else {
        console.log('❌ No stored auth data found');
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setIsAuthenticated(false);
      return false;
    }
  }, [
    authToken,
    user,
    tokenExpiration,
    setIsAuthenticated,
    logout,
    fetchAndSetSubscriptionStats,
    fetchAndSetFavoriteIds,
    fetchAndSetActivePlan,
  ]);

  return {
    user,
    authToken,
    tokenExpiration,
    isAuthenticated,
    savedCredentials,
    isTokenValid: authToken
      ? !isTokenExpiredCombined(authToken, tokenExpiration)
      : false,
    // Authentication functions
    login,
    logout,
    updateProfile,
    checkAuthStatus,
    // Password reset functions
    forgotPassword,
    resetPassword,
    changePassword,
  };
};
