import { createStackNavigator } from "@react-navigation/stack";
import GroupScreen from "@/src/features/group/containers/group/GroupScreen";
import GroupDetailsScreen from "@/src/features/group/containers/detail-group/GroupDetailsScreen";
import React from "react";

export type GroupParamList = {
    GroupScreen: undefined;
    GroupDetailsScreen: { groupId: string; currentUserId: string };
};

const Stack = createStackNavigator<GroupParamList>(); // Sử dụng kiểu của GroupParamList


export function GroupNavigaton() {
  return (
    <Stack.Navigator initialRouteName="GroupScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupScreen" component={GroupScreen} />
      <Stack.Screen name="GroupDetailsScreen" component={GroupDetailsScreen} />
    </Stack.Navigator>
  );
}
