import AdminArticleListScreen from '@/src/features/admin/containers/AdminArticleListScreen/AdminArticleListScreen';
import ArticleDetail from '@/src/features/newfeeds/containers/articledetail/ArticleDetail';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

export type AdminArticleStackParamList = {
  AdminArticleList: undefined;
  ArticleDetail: { articleId: string };
};

const Stack = createStackNavigator<AdminArticleStackParamList>();

const AdminArticleNavigation: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminArticleList" component={AdminArticleListScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetail} />
    </Stack.Navigator>
  );
};

export default AdminArticleNavigation;