import AdminAccountListScreen from '@/src/features/admin/containers/AdminAccount/AdminAccountListScreen';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

export type AdminAccountStackParamList = {
  AdminAccountList: undefined;
};

const Stack = createStackNavigator<AdminAccountStackParamList>();

const AdminAccountNavigation: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminAccountList" component={AdminAccountListScreen} />
    </Stack.Navigator>
  );
};

export default AdminAccountNavigation;