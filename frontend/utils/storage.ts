import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage wrapper that works on both web and native
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return await AsyncStorage.getItem(key);
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Ignore errors on web
      }
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore errors on web
      }
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};

export default storage;
