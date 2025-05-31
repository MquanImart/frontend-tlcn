// src/shared/routes/MyPageNavigation.ts
import Directions from "@/src/features/maps/containers/directions/Directions";
import MyPagesScreen from "@/src/features/mypages/containers/MyPagesScreen";
import EditPage from "@/src/features/pages/containers/edit/EditPage";
import PageScreen from "@/src/features/pages/containers/pages/PageScreen";
import WeatherDetail from "@/src/features/weather/container/weatherDetail/WeatherDetail";
import { Page } from "@/src/interface/interface_reference";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { Location } from "@/src/features/maps/containers/directions/interfaceLocation";


export type MyPageStackParamList = {
    PageScreen: { pageId: string; currentUserId: string }
    MyPage: undefined;
    WeatherDetail: { lat:number, lon:number};
    EditPage: { page: Page };
    Directions: {start?: Location, end?: Location};
};

const Stack = createStackNavigator<MyPageStackParamList>();

export function MyPageNavigation() {
  return (
        <Stack.Navigator initialRouteName="MyPage" screenOptions={{
           headerShown: false,
        }}>
          <Stack.Screen name="MyPage" component={MyPagesScreen} />
          <Stack.Screen name="PageScreen" component={PageScreen} />
          <Stack.Screen name="WeatherDetail" component={WeatherDetail} />
          <Stack.Screen name="EditPage" component={EditPage} />
          <Stack.Screen name="Directions" component={Directions} />
      </Stack.Navigator>
  );
}