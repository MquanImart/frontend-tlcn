import { createStackNavigator } from "@react-navigation/stack";
import MyPagesScreen from "@/src/features/mypages/containers/MyPagesScreen";
import React from "react";
import PageScreen from "@/src/features/pages/containers/pages/PageScreen";
import WeatherDetail from "@/src/features/weather/container/weatherDetail/WeatherDetail";
import EditPage from "@/src/features/pages/containers/edit/EditPage";
import { Page } from "@/src/interface/interface_reference";

export type MyPageStackParamList = {
    PageScreen: { pageId: string; currentUserId: string }
    MyPage: undefined;
    WeatherDetail: { lat:number, lon:number};
    EditPage: { page: Page };
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
      </Stack.Navigator>
  );
}