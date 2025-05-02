import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import Reel from "@/src/features/reel/containers/Reel/Reel";
import Profile from "@/src/features/profile/containers/Profile";
import MyProfile from "@/src/features/profile/containers/MyProfile";
export type ReelStackParamList = {
    Reel: undefined;
    Profile: { userId: string };
    MyProfile: undefined;
};

const Stack = createStackNavigator<ReelStackParamList>();

export function ReelNavigation() {
  return (
        <Stack.Navigator initialRouteName="Reel" screenOptions={{
           headerShown: false,
        }}>
          <Stack.Screen name="Reel" component={Reel} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="MyProfile" component={MyProfile} />
      </Stack.Navigator>
  );
}