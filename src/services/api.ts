import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { isTokenExpiredCombined } from '../utils/tokenUtils';
import { eventBus } from '@/utils/eventBus';

console.log('🌍 Environment Debug:', {
  API_BASE_URL_from_env: API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  typeof_API_BASE_URL: typeof API_BASE_URL,
});

const getBaseURL = () => {
  console.log('🔍 API_BASE_URL from env:', API_BASE_URL);

  if (!API_BASE_URL) {
    console.warn('⚠️ API_BASE_URL is undefined, using fallback');
  }

  return API_BASE_URL;
};

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    const baseURL = getBaseURL();
    console.log('🏗️ Creating axios instance with baseURL:', baseURL);

    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Debug the instance after creation
    console.log('✅ Axios instance created:', {
      baseURL: this.instance.defaults.baseURL,
      timeout: this.instance.defaults.timeout,
    });

    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      async config => {
        try {
          const authToken = await AsyncStorage.getItem('authToken');

          if (authToken) {
            const tokenExpirationData = await AsyncStorage.getItem(
              'tokenExpiration',
            );
            let tokenExpiration = null;

            if (tokenExpirationData) {
              try {
                tokenExpiration = JSON.parse(tokenExpirationData);
              } catch (parseError) {
                console.warn(
                  'Failed to parse token expiration data:',
                  parseError,
                );
              }
            }

            // Check if token is expired
            if (isTokenExpiredCombined(authToken, tokenExpiration)) {
              // Clear auth data
              await AsyncStorage.multiRemove(['authToken', 'user']);
              console.log('🔄 Token expired, cleared auth data');

              // Emit auth error to trigger app-wide logout
              eventBus.emit(
                'AUTH_ERROR',
                'Your session has expired. Please log in again.',
              );
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

        // Enhanced debug log for requests
        if (__DEV__) {
          console.log('📡 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
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
          console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            fullURL: `${response.config.baseURL}${response.config.url}`,
          });
        }
        return response;
      },
      async (error: AxiosError) => {
        // Enhanced error logging
        if (__DEV__) {
          console.error('❌ API Error Details:', {
            status: error.response?.status || 'No Response',
            statusText: error.response?.statusText,
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            fullURL: error.config
              ? `${error.config.baseURL}${error.config.url}`
              : 'Unknown URL',
            message: error.message,
            code: error.code,
            hasResponse: !!error.response,
            hasRequest: !!error.request,
          });

          // Log response data if available
          if (error.response?.data) {
            console.error('❌ Error Response Data:', error.response.data);
          }

          // Log request details if no response
          if (!error.response && error.request) {
            console.error('❌ Request made but no response:', {
              url: error.config?.url,
              method: error.config?.method,
              timeout: error.config?.timeout,
            });
          }
        }

        // Network timeout
        if (
          error.code === 'ECONNABORTED' ||
          error.message.includes('timeout')
        ) {
          console.error('❌ Network timeout error');
          eventBus.emit(
            'NETWORK_ERROR',
            'Network timeout. Please check your connection.',
          );
          return Promise.reject(
            new Error('Connection timeout. Please try again.'),
          );
        }

        // Network connection error
        if (error.code === 'NETWORK_ERROR' || !error.response) {
          console.error('❌ Network connection error');
          eventBus.emit(
            'NETWORK_ERROR',
            'No internet connection. Please check your network.',
          );
          return Promise.reject(
            new Error('No internet connection. Please check your network.'),
          );
        }

        if (error.response?.status === 401) {
          // Handle unauthorized access - token expired or invalid
          try {
            // Clear auth data
            await AsyncStorage.multiRemove([
              'authToken',
              'user',
              'tokenExpiration',
            ]);
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
    try {
      const response = await this.instance.get<T>(url, config);
      return response.data;
    } catch (error) {
      console.error('❌ GET request failed:', {
        url,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    try {
      const response = await this.instance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error('❌ POST request failed:', {
        url,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    try {
      const response = await this.instance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error('❌ PUT request failed:', {
        url,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    try {
      const response = await this.instance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      console.error('❌ DELETE request failed:', {
        url,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async upload<T>(url: string, formData: FormData) {
    try {
      const response = await this.instance.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ UPLOAD request failed:', {
        url,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  // Debug method to check instance configuration
  debugInstance() {
    console.log('🔍 Current Axios Instance Config:', {
      baseURL: this.instance.defaults.baseURL,
      timeout: this.instance.defaults.timeout,
      headers: this.instance.defaults.headers,
    });
  }
}

export const apiClient = new ApiClient();

// Export debug method for testing
export const debugApi = () => apiClient.debugInstance();
