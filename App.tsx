import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigation } from './src/shared/routes/AuthNavigation';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { SuggestedProvider } from './SuggestedPageContext';

export default function App() {
  return (
    <SuggestedProvider>
      <ThemeProvider>
        <NavigationContainer>
          <AuthNavigation />
        </NavigationContainer>
      </ThemeProvider>
    </SuggestedProvider>
  );
}