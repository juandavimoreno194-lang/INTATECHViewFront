import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'custom_api_url';
let _apiUrl = null;

export function getApiUrl() {
  return _apiUrl || process.env.EXPO_PUBLIC_API_URL;
}

export async function initApiUrl() {
  try {
    const custom = await AsyncStorage.getItem(STORAGE_KEY);
    _apiUrl = custom || process.env.EXPO_PUBLIC_API_URL;
  } catch {
    _apiUrl = process.env.EXPO_PUBLIC_API_URL;
  }
}

export async function setApiUrl(url) {
  if (url) {
    await AsyncStorage.setItem(STORAGE_KEY, url);
    _apiUrl = url;
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY);
    _apiUrl = process.env.EXPO_PUBLIC_API_URL;
  }
}
