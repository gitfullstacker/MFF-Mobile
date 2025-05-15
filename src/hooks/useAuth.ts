import { useAtom } from 'jotai';
import { useCallback } from 'react';
import {
  authTokenAtom,
  userAtom,
  isAuthenticatedAtom,
  addToastAtom,
  savedCredentialsAtom,
} from '../store';
import { authService } from '../services/auth';
import { LoginRequest } from '../types/auth';
import { isTokenExpired } from '../utils/tokenUtils';

export const useAuth = () => {
  const [authToken, setAuthToken] = useAtom(authTokenAtom);
  const [user, setUser] = useAtom(userAtom);
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, addToast] = useAtom(addToastAtom);
  const [savedCredentials, setSavedCredentials] = useAtom(savedCredentialsAtom);

  const login = useCallback(
    async (credentials: LoginRequest, rememberMe: boolean = false) => {
      try {
        // Call login endpoint
        const response = await authService.login(credentials);

        // Store token
        const token = response.token;

        // Then update atoms
        setAuthToken(token);
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
          // Clear saved credentials if remember me is turned off
          setSavedCredentials(null);
        }

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
    [setAuthToken, setUser, setIsAuthenticated, setSavedCredentials, addToast],
  );

  const logout = useCallback(async () => {
    try {
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);

      // Don't clear savedCredentials on logout if rememberMe was true
      // This allows for quick login next time
    } catch (error) {
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [setAuthToken, setUser, setIsAuthenticated]);

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
      if (authToken && user) {
        // Check if token is expired
        if (isTokenExpired(authToken)) {
          console.log('❌ Token expired, logging out');
          await logout();
          return;
        }

        setIsAuthenticated(true);

        // Verify token is still valid by making a test request
        try {
          await authService.getProfile();
        } catch (error) {
          console.log('❌ Token is invalid, logging out');
          await logout();
        }
      } else {
        console.log('❌ No stored auth data found');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  }, [authToken, user, setIsAuthenticated, logout]);

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
