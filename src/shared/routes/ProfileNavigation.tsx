import MyProfile from "@/src/features/profile/containers/MyProfile";
import EditProfile from "@/src/features/profile/containers/EditProfile";
import Profile from "@/src/features/profile/containers/Profile";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { User } from "@/src/interface/interface_reference";

import { PersonalPageStackParamList } from "./PersonalPageNavigation";

export type ProfileStackParamList = {
    MyProfile: undefined;
    EditProfile: {
          screen?: keyof PersonalPageStackParamList;
          params?: PersonalPageStackParamList[keyof PersonalPageStackParamList];
        };
    Profile: { userId: string };
};

const Stack = createStackNavigator<ProfileStackParamList>();

export function ProfileNavigation() {
  return (
        <Stack.Navigator initialRouteName="MyProfile" screenOptions={{
           headerShown: false,
        }}>
          <Stack.Screen name="MyProfile" component={MyProfile} />
          <Stack.Screen name="EditProfile" component={EditProfile}/>
          <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
  );
}