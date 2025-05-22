import getColor from '@/src/styles/Color';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import AdminTabNavigator from '../components/AdminTabNavigator';

const AdminDashboardScreen: React.FC = () => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor().backGround }]}>
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