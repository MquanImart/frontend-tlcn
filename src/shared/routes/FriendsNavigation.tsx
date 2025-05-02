import Friends from "@/src/features/friends/containers/Friends";
import { FriendCardData } from "@/src/features/friends/containers/request-friends/useRequestFriends";
import ViewAllRequestFriends from "@/src/features/friends/containers/request-friends/ViewAllRequestFriends";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";



export type FriendsStackParamList = {
  Friends: undefined;
  ViewAllRequestFriends: { isSendMe: boolean, data: FriendCardData[] };
};

const Stack = createStackNavigator<FriendsStackParamList>();

export function FriendsNavigation() {
  return (
        <Stack.Navigator initialRouteName="Friends" screenOptions={{
           headerShown: false,
        }}>
          <Stack.Screen name="Friends" component={Friends} />
          <Stack.Screen name="ViewAllRequestFriends" component={ViewAllRequestFriends}/>
      </Stack.Navigator>
  );
}