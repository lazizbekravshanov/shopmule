import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'shopmule_auth_token';
const USER_KEY = 'shopmule_user';

// Wrapper for SecureStore that handles web fallback
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export async function getToken(): Promise<string | null> {
  return storage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await storage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await storage.removeItem(TOKEN_KEY);
}

export async function getStoredUser(): Promise<string | null> {
  return storage.getItem(USER_KEY);
}

export async function setStoredUser(user: string): Promise<void> {
  await storage.setItem(USER_KEY, user);
}

export async function removeStoredUser(): Promise<void> {
  await storage.removeItem(USER_KEY);
}

export async function clearAuth(): Promise<void> {
  await Promise.all([removeToken(), removeStoredUser()]);
}
