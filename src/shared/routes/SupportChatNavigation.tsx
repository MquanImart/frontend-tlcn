import SupportChatScreen from "@/src/features/supportchat/containers/SupportChatScreen";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react"

const Stack = createStackNavigator();

export type SupportChatParamList = {
    SupportChatScreen: undefined;
};

export function SupportChatNavigation() {
  return (
    <Stack.Navigator initialRouteName="SupportChatScreen" screenOptions={{
         headerShown: false,
      }}>
        <Stack.Screen name="SupportChatScreen" component={SupportChatScreen} />
    </Stack.Navigator>
  );
}