import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

import { getApiUrl } from './apiConfig';
const API_URL = getApiUrl();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const systemDark = useColorScheme() === 'dark';
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!user) {
      setDarkMode(false);
      return;
    }
    if (user.dark_mode !== undefined) {
      setDarkMode(user.dark_mode === 1 || user.dark_mode === true);
    } else {
      setDarkMode(systemDark);
    }
  }, [user]);

  const toggleDarkMode = useCallback(async () => {
    const next = !darkMode;
    setDarkMode(next);
    if (user?.id) {
      try {
        await fetch(`${API_URL}/dark-mode`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, dark_mode: next ? 1 : 0 }),
        });
      } catch {}
    }
    AsyncStorage.setItem('@darkMode', next.toString());
  }, [darkMode, user]);

  const logout = useCallback(async () => {
    setUser(null);
    setDarkMode(false);
    await AsyncStorage.removeItem('@darkMode');
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, darkMode, toggleDarkMode, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};
