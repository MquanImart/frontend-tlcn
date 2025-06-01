import MyProfile from "@/src/features/profile/containers/MyProfile";
import Profile from "@/src/features/profile/containers/Profile";
import Reel from "@/src/features/reel/containers/Reel/Reel";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
export type ReelStackParamList = {
    Reel: { reelId?: string }; // <-- T
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