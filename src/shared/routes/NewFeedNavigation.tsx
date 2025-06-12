import GroupDetailsScreen from "@/src/features/group/containers/detail-group/GroupDetailsScreen";
import ArticleDetail from "@/src/features/newfeeds/containers/articledetail/ArticleDetail";
import NewFeed from "@/src/features/newfeeds/containers/newfeeds/NewFeed";
import { Article } from "@/src/features/newfeeds/interface/article";
import Profile from "@/src/features/profile/containers/Profile";
import { ProfileNavigation } from "./ProfileNavigation";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import MessagesDrawerWrapper from "./MessageNavigation";
import { SearchNavigation, SearchStackParamList } from "./SearchNavigation";
import { SupportChatNavigation } from "./SupportChatNavigation";
import { ProfileStackParamList } from "./ProfileNavigation";
import { MapNavigation, MapStackParamList } from "./MapNavigation";
const Stack = createStackNavigator<NewFeedParamList>();

export type NewFeedParamList = {
  NewFeed: { article: Article };
  SearchNavigation: {
    screen?: keyof SearchStackParamList;
    params?: SearchStackParamList[keyof SearchStackParamList];
  };
  MessageNavigation: undefined;
  SupportChatNavigation: undefined;
  Profile: { userId: string };
  ProfileNavigation: {
      screen?: keyof ProfileStackParamList;
      params?: ProfileStackParamList[keyof ProfileStackParamList];
    };
  ArticleDetail: { articleId: string; commentId?: string }; 
  GroupDetailsScreen: { groupId: string; currentUserId: string };
  MapNavigation: {
        screen?: keyof MapStackParamList;
        params?: MapStackParamList[keyof MapStackParamList];
  };
};

export function NewFeedNavigation() {
  return (
    <Stack.Navigator initialRouteName="NewFeed" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NewFeed" component={NewFeed} />
      <Stack.Screen name="SearchNavigation" component={SearchNavigation} />
      <Stack.Screen name="MessageNavigation" component={MessagesDrawerWrapper} />
      <Stack.Screen name="SupportChatNavigation" component={SupportChatNavigation}/>
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="ProfileNavigation" component={ProfileNavigation} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetail} />
      <Stack.Screen name="GroupDetailsScreen" component={GroupDetailsScreen} />
      <Stack.Screen name="MapNavigation" component={MapNavigation} />
    </Stack.Navigator>
  );
}