import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage<any>(() => ({
  getItem: async (key: string) => {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      if (__DEV__) {
        console.error(`Error getting ${key} from storage:`, error);
      }
      return null;
    }
  },
  setItem: async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (__DEV__) {
        console.error(`Error setting ${key} in storage:`, error);
      }
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      if (__DEV__) {
        console.error(`Error removing ${key} from storage:`, error);
      }
    }
  },
}));

export interface UserPreferences {
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  // notification preferences, units, etc.
}

export const userPreferencesAtom = atomWithStorage<UserPreferences>(
  'userPreferences',
  {
    calorieTarget: 2000,
    proteinTarget: 150,
    carbsTarget: 200,
    fatTarget: 65,
  },
  storage,
);
