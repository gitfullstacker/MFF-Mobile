import { atom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { User } from '../../types/auth';

// Create a custom storage for React Native
const storage = createJSONStorage<any>(() => ({
  getItem: async (key: string) => {
    try {
      const item = await AsyncStorage.getItem(key);
      console.log(
        `📥 Getting ${key} from storage:`,
        item ? 'Found' : 'Not found',
      );
      // For authToken, we store it as a plain string, not JSON
      if (key === 'authToken' && item) {
        return item; // Return plain string, not parsed JSON
      }
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`❌ Error getting ${key} from storage:`, error);
      return null;
    }
  },
  setItem: async (key: string, value: any) => {
    try {
      console.log(`📤 Setting ${key} in storage`);
      // For authToken, store as plain string
      if (key === 'authToken') {
        await AsyncStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }

      // Verify it was saved
      const saved = await AsyncStorage.getItem(key);
      console.log(`✅ ${key} saved:`, saved ? 'Success' : 'Failed');
    } catch (error) {
      console.error(`❌ Error setting ${key} in storage:`, error);
    }
  },
  removeItem: async (key: string) => {
    try {
      console.log(`🗑️ Removing ${key} from storage`);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`❌ Error removing ${key} from storage:`, error);
    }
  },
}));

// Store token as a simple string
export const authTokenAtom = atomWithStorage<string | null>(
  'authToken',
  null,
  storage,
);

export const userAtom = atomWithStorage<User | null>('user', null, storage);

export const isAuthenticatedAtom = atom(async get => {
  try {
    const token = await get(authTokenAtom);
    return !!token;
  } catch {
    return false;
  }
});
