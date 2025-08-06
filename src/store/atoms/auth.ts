import { atom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { User } from '@/types';

// Create a custom storage for React Native
const storage = createJSONStorage<any>(() => ({
  getItem: async (key: string) => {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item === null) {
        return null;
      }
      // For authToken, we store it as a plain string, not JSON
      if (key === 'authToken' && item) {
        return item;
      }
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  },
  setItem: async (key: string, value: any) => {
    try {
      // Handle null/undefined values by removing the item instead
      if (value === null || value === undefined) {
        await AsyncStorage.removeItem(key);
        return;
      }

      // For authToken, store as plain string
      if (key === 'authToken') {
        // Value is already JSON.stringify'd by atomWithStorage, so we need to parse it first
        const actualValue =
          typeof value === 'string' ? JSON.parse(value) : value;
        if (actualValue === null || actualValue === undefined) {
          await AsyncStorage.removeItem(key);
        } else {
          await AsyncStorage.setItem(key, actualValue);
        }
      } else {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  },
}));

// Atoms for authentication state
export const authTokenAtom = atomWithStorage<string | null>(
  'authToken',
  null,
  storage,
);

export const userAtom = atomWithStorage<User | null>('user', null, storage);

// Save username/password for "Remember Me" functionality
export const savedCredentialsAtom = atomWithStorage<{
  username: string;
  password: string;
  rememberMe: boolean;
} | null>('savedCredentials', null, storage);

export const isAuthenticatedAtom = atom<boolean>(false);
