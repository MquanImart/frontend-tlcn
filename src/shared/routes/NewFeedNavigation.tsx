import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import NewFeed from "@/src/features/newfeeds/containers/newfeeds/NewFeed";
import { Article } from "@/src/features/newfeeds/interface/article";
import { SearchNavigation } from "./SearchNavigation";
import MessagesDrawerWrapper from "./MessageNavigation";
import { SupportChatNavigation } from "./SupportChatNavigation";
import Profile from "@/src/features/profile/containers/Profile";
import MyProfile from "@/src/features/profile/containers/MyProfile";
import ArticleDetail from "@/src/features/newfeeds/containers/articledetail/ArticleDetail";
import { PersonalPageStackParamList } from "./PersonalPageNavigation";
const Stack = createStackNavigator<NewFeedParamList>();

export type NewFeedParamList = {
  NewFeed: { article: Article };
  SearchNavigation: undefined;
  MessageNavigation: undefined;
  SupportChatNavigation: undefined;
  Profile: { userId: string };
  MyProfile: {
      screen?: keyof PersonalPageStackParamList;
      params?: PersonalPageStackParamList[keyof PersonalPageStackParamList];
    };
  ArticleDetail: { articleId: string };
};

export function NewFeedNavigation() {
  return (
    <Stack.Navigator initialRouteName="NewFeed" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NewFeed" component={NewFeed} />
      <Stack.Screen name="SearchNavigation" component={SearchNavigation} />
      <Stack.Screen name="MessageNavigation" component={MessagesDrawerWrapper} />
      <Stack.Screen name="SupportChatNavigation" component={SupportChatNavigation} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="MyProfile" component={MyProfile} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetail} />
    </Stack.Navigator>
  );
}