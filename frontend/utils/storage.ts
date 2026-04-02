import { Platform } from 'react-native';

// Conditional import of AsyncStorage - only for native platforms
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

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
    if (!AsyncStorage) return null;
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
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
    if (!AsyncStorage) return;
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Ignore errors
    }
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
    if (!AsyncStorage) return;
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  },
};

export default storage;
