import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { ExploreNavigation } from "./ExploreNavigation";
import { NewFeedNavigation } from "./NewFeedNavigation";
import { NotificationNavigation } from "./NotificationNavigation";
import { ReelNavigation } from "./ReelNavigation";
import { MenuNavigation } from "./MenuNavigation";

export type TabbarStackParamList = {
    Explore: undefined;
    NewFeed: undefined;
    Notify: undefined;
    Reel: undefined;
    Menu: undefined;
};

const Stack = createStackNavigator<TabbarStackParamList>();

export function TabbarNavigation() {
  return (
        <Stack.Navigator initialRouteName="NewFeed" screenOptions={{
           headerShown: false,
        }}>
        <Stack.Screen name="Explore" component={ExploreNavigation} />
        <Stack.Screen name="NewFeed" component={NewFeedNavigation} />
        <Stack.Screen name="Notify" component={NotificationNavigation} />
        <Stack.Screen name="Reel" component={ReelNavigation} />
        <Stack.Screen name="Menu" component={MenuNavigation} />
      </Stack.Navigator>
  );
}