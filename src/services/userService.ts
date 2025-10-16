import { apiClient } from './api';
import { User } from '../types/user';

export const userService = {
  async getProfile(): Promise<User> {
    return apiClient.get('/user/profile');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put('/user/profile', data);
  },
};
