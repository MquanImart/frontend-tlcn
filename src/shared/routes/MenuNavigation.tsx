import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import Menu from "@/src/features/setting/containers/menu/Menu";
import Setting from "@/src/features/setting/containers/setting/Setting";
import GroupDetailsScreen from "@/src/features/group/containers/detail-group/GroupDetailsScreen";
import { CollectionNavigation } from "./CollectionNavigation";
import { FriendsNavigation } from "./FriendsNavigation";
import { GroupNavigaton } from "./GroupNavigation";
import { MapNavigation } from "./MapNavigation";
import { WeatherNavigation } from "./WeatherNavigation";
import { ProfileNavigation } from "./ProfileNavigation";
import { MyPageNavigation } from "./MyPageNavigation";
import { AuthNavigation } from "./AuthNavigation";
import { PersonalPageStackParamList } from "./PersonalPageNavigation";
export type MenuStackParamList = {
    Menu: undefined;
    Setting: undefined;
    Collections: undefined;
    Friends: undefined;
    Groups: undefined;
    Map: undefined;
    Weather: undefined;
    MyProfile: {
      screen?: keyof PersonalPageStackParamList;
      params?: PersonalPageStackParamList[keyof PersonalPageStackParamList];
    };
    MyPage: undefined;
    Login: undefined;
    GroupDetailsScreen: { groupId: string; currentUserId: string };

};

const Stack = createStackNavigator<MenuStackParamList>();

export function MenuNavigation() {
  return (
        <Stack.Navigator initialRouteName="Menu" screenOptions={{
           headerShown: false,
        }}>
          <Stack.Screen name="Menu" component={Menu} />
          <Stack.Screen name="Collections" component={CollectionNavigation} />
          <Stack.Screen name="Friends" component={FriendsNavigation} />
          <Stack.Screen name="Groups" component={GroupNavigaton} />
          <Stack.Screen name="Map" component={MapNavigation} />
          <Stack.Screen name="Weather" component={WeatherNavigation} />
          <Stack.Screen name="Setting" component={Setting} />
          <Stack.Screen name="MyProfile" component={ProfileNavigation} />
          <Stack.Screen name="MyPage" component={MyPageNavigation} />
          <Stack.Screen name="Login" component={AuthNavigation} />
          <Stack.Screen name="GroupDetailsScreen" component={GroupDetailsScreen} />
      </Stack.Navigator>
  );
}