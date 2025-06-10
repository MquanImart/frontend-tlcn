import AdminAccountNavigation from '@/src/shared/routes/AdminAccountNavigation';
import AdminArticleNavigation from '@/src/shared/routes/AdminArticleNavigation';
// Đã loại bỏ import { useTheme } từ '@/src/contexts/ThemeContext';
// Đã loại bỏ import { colors as Color } từ '@/src/styles/DynamicColors';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

const Tab = createBottomTabNavigator();

const AdminTabNavigator: React.FC = () => {
  // Đã loại bỏ useTheme()
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
        // Thay thế bằng mã màu hex cứng cho màu hoạt động
        tabBarActiveTintColor: '#2196F3', // Đây có thể là mainColor2 từ lightColors
        // Thay thế bằng mã màu hex cứng cho màu không hoạt động
        tabBarInactiveTintColor: '#616161', // Đây có thể là textSecondary từ lightColors
        tabBarStyle: {
          // Thay thế bằng mã màu hex cứng cho màu nền
          backgroundColor: '#FFFFFF', // Đây có thể là background từ lightColors
          // Thay thế bằng mã màu hex cứng cho màu đường viền trên
          borderTopColor: '#E0E0E0', // Đây có thể là border từ lightColors
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