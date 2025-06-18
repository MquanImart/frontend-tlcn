import EditProfile from "@/src/features/profile/containers/EditProfile";
import MyProfile from "@/src/features/profile/containers/MyProfile";
import Profile from "@/src/features/profile/containers/Profile";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { MapNavigation, MapStackParamList } from "./MapNavigation";

export type PersonalPageStackParamList = {
    Profile: { userId: string };
    MyProfile: undefined;
    EditProfile: undefined;
    MapNavigation: {
          screen?: keyof MapStackParamList;
          params?: MapStackParamList[keyof MapStackParamList];
    };
};

const Stack = createStackNavigator<PersonalPageStackParamList>();

export function PersonalPageNavigation() {
  return (
        <Stack.Navigator initialRouteName="Profile" screenOptions={{
           headerShown: false,
        }}>
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="MyProfile" component={MyProfile} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="MapNavigation" component={MapNavigation} />
      </Stack.Navigator>
  );
}