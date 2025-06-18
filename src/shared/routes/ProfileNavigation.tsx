import MyProfile from "@/src/features/profile/containers/MyProfile";
import EditProfile from "@/src/features/profile/containers/EditProfile";
import Profile from "@/src/features/profile/containers/Profile";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import Conversations from "@/src/features/messages/containers/conversations/Conversations";
import { MapNavigation, MapStackParamList } from "./MapNavigation";

export type ProfileStackParamList = {
    MyProfile: undefined;
    EditProfile: undefined;
    Profile: { userId: string };
    Message: { 
      conversationId: string | null, 
      friend? : {
        _id: string;
        displayName: string;
      }
    };
    MapNavigation: {
              screen?: keyof MapStackParamList;
              params?: MapStackParamList[keyof MapStackParamList];
    };
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
          <Stack.Screen name="Message" component={Conversations} />
          <Stack.Screen name="MapNavigation" component={MapNavigation} />
      </Stack.Navigator>
  );
}