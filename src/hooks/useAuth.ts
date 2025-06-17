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
} from '../store';
import { authService } from '../services/auth';
import { userService } from '../services/user';
import { subscriptionService } from '../services/subscription';
import { favoriteService } from '../services/favorite';
import { LoginRequest } from '../types/auth';
import { isTokenExpired } from '../utils/tokenUtils';

export const useAuth = () => {
  const [authToken, setAuthToken] = useAtom(authTokenAtom);
  const [user, setUser] = useAtom(userAtom);
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
      const favoriteRecipes = await favoriteService.getFavorites();
      const favoriteRecipeIds = favoriteRecipes.data.map(recipe => recipe._id);
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
      const plan = await userService.getActivePlan();
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
        const response = await authService.login(credentials);

        // Store auth data
        setAuthToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);

        // Save credentials if rememberMe is true
        if (rememberMe) {
          setSavedCredentials({
            username: credentials.username,
            password: credentials.password,
            rememberMe,
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
        setIsAuthenticated(false);
        addToast({
          message: error.response?.data?.message || 'Login failed',
          type: 'error',
          duration: 5000,
        });
        throw error;
      }
    },
    [
      setAuthToken,
      setUser,
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
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');

      setAuthToken(null);
      setUser(null);
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

      // Don't clear savedCredentials on logout if rememberMe was true
    } catch (error) {
      console.error('❌ Logout error:', error);
      setAuthToken(null);
      setUser(null);
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
    setIsAuthenticated,
    setSubscriptionStats,
    setFavoriteIds,
    setActivePlan,
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
      if (authToken && user) {
        // Check if token is expired
        if (isTokenExpired(authToken)) {
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
    setIsAuthenticated,
    logout,
    fetchAndSetSubscriptionStats,
    fetchAndSetFavoriteIds,
    fetchAndSetActivePlan,
  ]);

  return {
    user,
    authToken,
    isAuthenticated,
    savedCredentials,
    isTokenValid: authToken ? !isTokenExpired(authToken) : false,
    login,
    logout,
    updateProfile,
    checkAuthStatus,
  };
};
