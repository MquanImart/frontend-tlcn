import WeatherScreen from "@/src/features/pages/components/WeatherScreen";
import PageScreen from "@/src/features/pages/containers/pages/PageScreen";
import Discovery from "@/src/features/explore/containers/discovery/Discovery";
import { createStackNavigator } from "@react-navigation/stack";
import MyPagesScreen from "@/src/features/mypages/containers/MyPagesScreen";
import WeatherDetail from "@/src/features/weather/container/weatherDetail/WeatherDetail";
import EditPage from "@/src/features/pages/containers/edit/EditPage";
import React from "react";
import { Page } from "@/src/interface/interface_reference";

export type PageStackParamList = {
    WeatherDetail: { lat:number, lon:number};
    PageScreen: { pageId: string; currentUserId: string }
    Discovery: undefined;
    MyPage: undefined;
    EditPage: { page: Page };
};

const Stack = createStackNavigator<PageStackParamList>();

export function PageNavigation() {
  return (
        <Stack.Navigator initialRouteName="PageScreen" screenOptions={{
           headerShown: false,
        }}>
          <Stack.Screen name="PageScreen" component={PageScreen} />
          <Stack.Screen name="Discovery" component={Discovery} />
          <Stack.Screen name="MyPage" component={MyPagesScreen} />
          <Stack.Screen name="WeatherDetail" component={WeatherDetail} />
          <Stack.Screen name="EditPage" component={EditPage} />
      </Stack.Navigator>
  );
}