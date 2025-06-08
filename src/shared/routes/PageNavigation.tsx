import Discovery from "@/src/features/explore/containers/discovery/Discovery";
import { Location } from "@/src/features/maps/containers/directions/interfaceLocation";
import MyPagesScreen from "@/src/features/mypages/containers/MyPagesScreen";
import EditPage from "@/src/features/pages/containers/edit/EditPage";
import PageScreen from "@/src/features/pages/containers/pages/PageScreen";
import WeatherDetail from "@/src/features/weather/container/weatherDetail/WeatherDetail";
import { Page } from "@/src/interface/interface_reference";
import { MapNavigation, MapStackParamList } from "./MapNavigation";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { ProfileNavigation, ProfileStackParamList } from "./ProfileNavigation";

export type PageStackParamList = {
    WeatherDetail: { lat:number, lon:number};
    PageScreen: { pageId: string; currentUserId: string }
    Discovery: undefined;
    MyPage: undefined;
    EditPage: { page: Page };
    Directions: {start?: Location, end?: Location};
    MapNavigation: {
      screen?: keyof MapStackParamList;
      params?: MapStackParamList[keyof MapStackParamList];
    };
    ProfileNavigation: {
      screen?: keyof ProfileStackParamList;
      params?: ProfileStackParamList[keyof ProfileStackParamList];
    };
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
          <Stack.Screen name="MapNavigation" component={MapNavigation} />
          <Stack.Screen name="ProfileNavigation" component={ProfileNavigation} />
      </Stack.Navigator>
  );
}