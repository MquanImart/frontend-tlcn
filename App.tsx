import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigation } from './src/shared/routes/AuthNavigation';
import { TabbarNavigation } from './src/shared/routes/TabbarBottom';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { SuggestedProvider } from './SuggestedPageContext';
import { AuthProvider, useAuth } from './AuthContext';

function AppNavigator() {
  const { isLoggedIn } = useAuth();

  return (
    <NavigationContainer>
      {isLoggedIn ? <TabbarNavigation /> : <AuthNavigation />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SuggestedProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SuggestedProvider>
  );
}
