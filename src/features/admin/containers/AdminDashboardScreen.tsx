import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import AdminTabNavigator from '../components/AdminTabNavigator';

const AdminDashboardScreen: React.FC = () => {
  useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Color.backGround }]}>
      <AdminTabNavigator />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AdminDashboardScreen;