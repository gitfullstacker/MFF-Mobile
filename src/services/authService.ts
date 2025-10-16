import { apiClient } from './api';
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../types/auth';

export const authService = {
  // login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post('/auth/login', credentials);
  },

  // Forgot password - sends reset email
  async forgotPassword(
    data: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    return apiClient.post('/auth/forgot-password', data);
  },

  // Reset password using token from email
  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    return apiClient.post('/auth/reset-password', data);
  },

  // Change password for authenticated users
  async changePassword(
    data: ChangePasswordRequest,
  ): Promise<ChangePasswordResponse> {
    return apiClient.post('/auth/change-password', data);
  },

  // Verify reset token (optional - for checking if token is valid before showing form)
  async verifyResetToken(token: string): Promise<{ valid: boolean }> {
    return apiClient.post('/auth/verify-reset-token', { token });
  },
};
