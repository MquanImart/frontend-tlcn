import { createStackNavigator } from "@react-navigation/stack";
import GroupScreen from "@/src/features/group/containers/group/GroupScreen";
import GroupDetailsScreen from "@/src/features/group/containers/detail-group/GroupDetailsScreen";
import React from "react";
import { PersonalPageStackParamList } from "./PersonalPageNavigation";
import { ProfileNavigation } from "./ProfileNavigation";

export type GroupParamList = {
    GroupScreen: undefined;
    GroupDetailsScreen: { groupId: string; currentUserId: string };
    ProfileNavigation: {
      screen?: keyof PersonalPageStackParamList;
      params?: PersonalPageStackParamList[keyof PersonalPageStackParamList];
    };
};

const Stack = createStackNavigator<GroupParamList>();


export function GroupNavigaton() {
  return (
    <Stack.Navigator initialRouteName="GroupScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupScreen" component={GroupScreen} />
      <Stack.Screen name="GroupDetailsScreen" component={GroupDetailsScreen} />
      <Stack.Screen name="ProfileNavigation" component={ProfileNavigation} />
    </Stack.Navigator>
  );
}
