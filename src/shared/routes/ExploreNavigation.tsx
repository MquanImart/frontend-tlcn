import CityProvice from "@/src/features/explore/containers/city-province/CityProvice";
import Discovery from "@/src/features/explore/containers/discovery/Discovery";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import PageScreen from "@/src/features/pages/containers/pages/PageScreen";
import WeatherDetail from "@/src/features/weather/container/weatherDetail/WeatherDetail";
import { Page } from "@/src/interface/interface_reference";
import EditPage from "@/src/features/pages/containers/edit/EditPage";

export type ExploreStackParamList = {
    Discovery: undefined;
    CityProvice: { provinceId: string};
    PageScreen: { pageId: string; currentUserId: string }
    WeatherDetail: { lat:number, lon:number};
    EditPage: { page: Page };
};

const Stack = createStackNavigator<ExploreStackParamList>();

export function ExploreNavigation() {
  return (
        <Stack.Navigator initialRouteName="Discovery" screenOptions={{
           headerShown: false,
        }}>
          <Stack.Screen name="Discovery" component={Discovery} />
          <Stack.Screen name="CityProvice" component={CityProvice} />
          <Stack.Screen name="PageScreen" component={PageScreen} />
          <Stack.Screen name="WeatherDetail" component={WeatherDetail} />
          <Stack.Screen name="EditPage" component={EditPage} />
      </Stack.Navigator>
  );
}