import * as React from 'react';
import { AuthNavigation } from './src/shared/routes/AuthNavigation';
import { NavigationContainer } from '@react-navigation/native';
export default function App() {
  return (
    <>
      <NavigationContainer>
        <AuthNavigation/>
      </NavigationContainer>
    </>
  );
}