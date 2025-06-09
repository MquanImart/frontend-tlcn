// src/contexts/ThemeContext.tsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColor, darkColor } from '@/src/styles/Color';
import { colors as dynamicColors } from '@/src/styles/DynamicColors';

interface ThemeContextData {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const applyTheme = (themeToApply: 'light' | 'dark') => {
    const newColors = themeToApply === 'light' ? lightColor : darkColor;
    Object.assign(dynamicColors, newColors);
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = (await AsyncStorage.getItem('theme')) as 'light' | 'dark' | null;
        const currentTheme = savedTheme || 'light';
        setTheme(currentTheme);
        applyTheme(currentTheme);
      } catch (error) {
        console.error('Failed to load theme from storage', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme to storage', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);