import { apiClient } from './api';
import { LoginRequest, LoginResponse } from '../types/auth';
import { UserProfile } from '@/types/common';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post('/auth/login', credentials);
  },

  async getProfile(): Promise<UserProfile> {
    return apiClient.get('/user/profile');
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return apiClient.put('/user/profile', data);
  },

  async logout(): Promise<void> {
    // If needed, call a logout endpoint
    // await apiClient.post('/auth/logout');
  },
};
