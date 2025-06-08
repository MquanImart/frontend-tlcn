// src/shared/routes/SearchNavigation.tsx
import GroupDetailsScreen from "@/src/features/group/containers/detail-group/GroupDetailsScreen";
import Search from "@/src/features/search/containers/Search";
import PostSearch from "@/src/features/search/containers/SearchPost/PostSearch";
import SearchUserAndGroup from "@/src/features/search/containers/SearchUserAndGroup/SearchUserAndGroup";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { ProfileNavigation, ProfileStackParamList } from "./ProfileNavigation";

export type SearchStackParamList = {
  Search: undefined;
  SearchUserAndGroup: { textSearch: string; userId: string };
  SearchPost: { textSearch: string[] };
  MyProfile: {
        screen?: keyof ProfileStackParamList;
        params?: ProfileStackParamList[keyof ProfileStackParamList];
      };
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
      <Stack.Screen name="MyProfile" component={ProfileNavigation} />
      <Stack.Screen name="GroupDetailsScreen" component={GroupDetailsScreen} />
    </Stack.Navigator>
  );
}