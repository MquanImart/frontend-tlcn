import NotificationScreen from "@/src/features/notifications/containers/notifications/NotificationScreen";
import { Notification } from "@/src/features/notifications/interface/INotification";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { GroupNavigaton, GroupParamList } from "./GroupNavigation";
import { NewFeedNavigation, NewFeedParamList } from "./NewFeedNavigation";
import { PageNavigation, PageStackParamList } from "./PageNavigation";
const Stack = createStackNavigator();

export type NotificationParamList = {
  NotificationScreen: { notifications: Notification[] };
  NewFeedNavigation: {
    screen?: keyof NewFeedParamList;
    params?: NewFeedParamList[keyof NewFeedParamList];
  };
  GroupNavigaton: {
    screen?: keyof GroupParamList;
    params?: GroupParamList[keyof GroupParamList];
  };
  PageNavigation: {
    screen?: keyof PageStackParamList;
    params?: PageStackParamList[keyof PageStackParamList];
  };
};

export function NotificationNavigation() {
  return (
        <Stack.Navigator initialRouteName="NotificationScreen" screenOptions={{
           headerShown: false,
        }}>
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} />    
          <Stack.Screen name="NewFeedNavigation" component={NewFeedNavigation} /> 
          <Stack.Screen name="GroupNavigaton" component={GroupNavigaton} />
          <Stack.Screen name="PageNavigation" component={PageNavigation} />
      </Stack.Navigator>
  );
}