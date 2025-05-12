import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const BASE_URL = API_BASE_URL || 'http://localhost:5000';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    console.log('Initializing API Client with URL:', BASE_URL);

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
          console.log('🔍 Checking for auth token...');
          const authToken = await AsyncStorage.getItem('authToken');

          if (authToken) {
            console.log('📦 Auth token found in AsyncStorage');
            config.headers.Authorization = `Bearer ${authToken}`;
            console.log('🔑 Bearer token added to request');
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
          // Handle unauthorized access
          try {
            await AsyncStorage.multiRemove(['authToken', 'user']);
            // You might want to emit an event or update global state here
            // to trigger navigation to login screen
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
