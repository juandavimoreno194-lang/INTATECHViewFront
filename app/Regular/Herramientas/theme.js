import { useUser } from './UserContext';

export const lightColors = {
  background: '#F5F7FA',
  card: '#FFFFFF',
  text: '#1E1E1E',
  textSecondary: '#7A7A7A',
  textLight: '#999',
  primary: '#4A90E2',
  primaryDark: '#357ABD',
  border: '#E0E0E0',
  headerBg: '#4A90E2',
  headerText: '#fff',
  inputBg: '#FFFFFF',
  danger: '#E74C3C',
  success: '#00B894',
  white: '#fff',
  black: '#1E1E1E',
  tabBar: '#FFFFFF',
  tabBarInactive: '#A0A0A0',
  overlay: 'rgba(0,0,0,0.45)',
};

export const darkColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textLight: '#777',
  primary: '#4A90E2',
  primaryDark: '#357ABD',
  border: '#333333',
  headerBg: '#1E1E1E',
  headerText: '#fff',
  inputBg: '#2A2A2A',
  danger: '#FF5252',
  success: '#00E676',
  white: '#fff',
  black: '#000',
  tabBar: '#1E1E1E',
  tabBarInactive: '#666',
  overlay: 'rgba(0,0,0,0.7)',
};

export const useTheme = () => {
  const { darkMode } = useUser();
  return darkMode ? darkColors : lightColors;
};
