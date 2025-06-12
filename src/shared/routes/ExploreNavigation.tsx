// src/shared/routes/ExploreNavigation.ts (Đã sửa để thay thế PageScreen bằng MyPageNavigation)

import CityProvice from "@/src/features/explore/containers/city-province/CityProvice";
import Discovery from "@/src/features/explore/containers/discovery/Discovery";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
// Đã loại bỏ: import PageScreen from "@/src/features/pages/containers/pages/PageScreen";
import EditPage from "@/src/features/pages/containers/edit/EditPage";
import WeatherDetail from "@/src/features/weather/container/weatherDetail/WeatherDetail";
import { Page } from "@/src/interface/interface_reference";
import { PageNavigation, PageStackParamList } from "./PageNavigation";
import Conversations from "@/src/features/messages/containers/conversations/Conversations";
import { MapNavigation, MapStackParamList } from "./MapNavigation";

export type ExploreStackParamList = {
    Discovery: undefined;
    CityProvice: { provinceId: string};
    WeatherDetail: { lat:number, lon:number};
    EditPage: { page: Page };
    BoxChat: { conversationId: string | null, friend? : {
      _id: string;
      displayName: string;
      avt: string;
    }};
    PageNavigation: {
      screen?: keyof PageStackParamList;
      params?: PageStackParamList[keyof PageStackParamList];
    };
    MapNavigation: {
          screen?: keyof MapStackParamList;
          params?: MapStackParamList[keyof MapStackParamList];
    };
    // ----------------------
};

const Stack = createStackNavigator<ExploreStackParamList>();

export function ExploreNavigation() {
  return (
        <Stack.Navigator initialRouteName="Discovery" screenOptions={{
           headerShown: false,
        }}>
          <Stack.Screen name="Discovery" component={Discovery} />
          <Stack.Screen name="CityProvice" component={CityProvice} />
          <Stack.Screen name="PageNavigation" component={PageNavigation} />
          <Stack.Screen name="WeatherDetail" component={WeatherDetail} />
          <Stack.Screen name="EditPage" component={EditPage} />
          <Stack.Screen name="BoxChat" component={Conversations} />
          <Stack.Screen name="MapNavigation" component={MapNavigation} />
      </Stack.Navigator>
  );
}