import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigation } from './src/shared/routes/AuthNavigation';
import { ThemeProvider } from './src/contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <AuthNavigation />
      </NavigationContainer>
    </ThemeProvider>
  );
}