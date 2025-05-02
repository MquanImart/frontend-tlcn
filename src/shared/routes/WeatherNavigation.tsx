import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import Weather from "@/src/features/weather/container/weather/Weather";
import WeatherDetail from "@/src/features/weather/container/weatherDetail/WeatherDetail";

export type WeatherStackParamList = {
    Weather: undefined;
    WeatherDetail: { lat:number, lon:number};
};

const Stack = createStackNavigator<WeatherStackParamList>();

export function WeatherNavigation() {
  return (
        <Stack.Navigator initialRouteName="Weather" screenOptions={{
           headerShown: false,
        }}>
          <Stack.Screen name="Weather" component={Weather} />
          <Stack.Screen name="WeatherDetail" component={WeatherDetail} />
      </Stack.Navigator>
  );
}