// src/shared/routes/SearchNavigation.tsx
import GroupDetailsScreen from "@/src/features/group/containers/detail-group/GroupDetailsScreen";
import Profile from "@/src/features/profile/containers/Profile";
import Search from "@/src/features/search/containers/Search";
import PostSearch from "@/src/features/search/containers/SearchPost/PostSearch";
import SearchUserAndGroup from "@/src/features/search/containers/SearchUserAndGroup/SearchUserAndGroup";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

export type SearchStackParamList = {
  Search: undefined;
  SearchUserAndGroup: { textSearch: string; userId: string };
  SearchPost: { textSearch: string[] };
  Profile: { userId: string };
  GroupDetailsScreen: { groupId: string; currentUserId: string };
};

const Stack = createStackNavigator<SearchStackParamList>();

export function SearchNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="Search"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="SearchUserAndGroup" component={SearchUserAndGroup} />
      <Stack.Screen name="SearchPost" component={PostSearch} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="GroupDetailsScreen" component={GroupDetailsScreen} />
    </Stack.Navigator>
  );
}