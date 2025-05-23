import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { isTokenExpired } from '../utils/tokenUtils';
import { eventBus } from '@/utils/eventBus';

const BASE_URL = API_BASE_URL || 'http://localhost:5000/v1';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      async config => {
        try {
          const authToken = await AsyncStorage.getItem('authToken');

          if (authToken) {
            // Check if token is expired
            if (isTokenExpired(authToken)) {
              // Clear auth data
              await AsyncStorage.multiRemove(['authToken', 'user']);
              // Let the request proceed without token - it will fail with 401
              // which will redirect to login
            } else {
              // Token is valid
              config.headers.Authorization = `Bearer ${authToken}`;
              console.log('🔑 Bearer token added to request');
            }
          } else {
            console.log('❌ No auth token in AsyncStorage');
          }
        } catch (error) {
          console.error('❌ Error getting auth token:', error);
        }

        // Debug log for requests
        if (__DEV__) {
          console.log('📡 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            hasAuth: !!config.headers.Authorization,
          });
        }

        return config;
      },
      error => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      response => {
        // Debug log for responses
        if (__DEV__) {
          console.log('API Response:', response.status, response.config.url);
        }
        return response;
      },
      async error => {
        if (__DEV__) {
          console.error(
            'API Error:',
            error.response?.status,
            error.config?.url,
          );
        }

        if (error.response?.status === 401) {
          // Handle unauthorized access - token expired or invalid
          try {
            // Clear auth data
            await AsyncStorage.multiRemove(['authToken', 'user']);
            console.log('🔒 401 Unauthorized - cleared auth data');

            // Emit auth error event to trigger login redirect
            eventBus.emit(
              'AUTH_ERROR',
              'Your session has expired. Please log in again.',
            );
          } catch (storageError) {
            console.error('Error clearing auth data:', storageError);
          }
        }
        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  async upload<T>(url: string, formData: FormData) {
    const response = await this.instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
