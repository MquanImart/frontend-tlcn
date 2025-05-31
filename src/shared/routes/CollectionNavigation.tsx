import Collections from "@/src/features/collections/containers/Collections";
import DetailsCollections from "@/src/features/collections/containers/post/DetailsCollections";
import ArticleDetail from "@/src/features/newfeeds/containers/articledetail/ArticleDetail";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

export type CollectionStackParamList = {
    Collections: undefined;
    DetailsCollections: {collectionId: string};
    ArticleDetail: { articleId: string };
};

const Stack = createStackNavigator<CollectionStackParamList>();

export function CollectionNavigation() {
  return (
        <Stack.Navigator initialRouteName="Collections" screenOptions={{
           headerShown: false,
        }}>
          {/* Màn hình hướng dẫn sử dụng tabbar. Màn hình nào cần thì làm theo */}
          <Stack.Screen name="Collections" component={Collections} />
          <Stack.Screen name="DetailsCollections" component={DetailsCollections} />
          <Stack.Screen name="ArticleDetail" component={ArticleDetail} />
          {/* <Stack.Screen name="Register" component={Resgister} /> */}
      </Stack.Navigator>
  );
}