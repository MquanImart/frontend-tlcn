import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import NotificationScreen from "@/src/features/notifications/containers/notifications/NotificationScreen";
import {Notification} from "@/src/features/notifications/interface/INotification";


const Stack = createStackNavigator();

export type NotificationParamList = {
    NotificationScreen: { notifications: Notification[] };
};

export function NotificationNavigation() {
  return (
        <Stack.Navigator initialRouteName="NotificationScreen" screenOptions={{
           headerShown: false,
        }}>
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} />       
          {/* <Stack.Screen name="Register" component={Resgister} /> */}
      </Stack.Navigator>
  );
}