import { apiClient } from './api';
import { LoginRequest, LoginResponse } from '../types/auth';
import { User } from '@/types/user';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post('/auth/login', credentials);
  },
  async getProfile(): Promise<User> {
    return apiClient.get('/user/profile');
  },
  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put('/user/profile', data);
  },
};
