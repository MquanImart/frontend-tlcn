import AdminAccountNavigation from '@/src/shared/routes/AdminAccountNavigation';
import AdminArticleNavigation from '@/src/shared/routes/AdminArticleNavigation';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

const Tab = createBottomTabNavigator();

const AdminTabNavigator: React.FC = () => {
  useTheme()
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];
          if (route.name === 'Articles') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else {
            iconName = focused ? 'people' : 'people-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Color.mainColor2,
        tabBarInactiveTintColor: Color.textColor3,
        tabBarStyle: {
          backgroundColor: Color.backGround,
          borderTopColor: Color.borderColor1,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Articles"
        component={AdminArticleNavigation}
        options={{ tabBarLabel: 'Bài viết' }}
      />
      <Tab.Screen
        name="Accounts"
        component={AdminAccountNavigation}
        options={{ tabBarLabel: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;