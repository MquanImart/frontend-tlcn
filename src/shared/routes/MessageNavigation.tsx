import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Messages from "@/src/features/messages/containers/list-messages/Messages";
import { createStackNavigator } from "@react-navigation/stack";
import NewChat from "@/src/features/messages/containers/list-messages/NewChat";
import NewGroupChat from "@/src/features/messages/containers/list-messages/NewGroupChat";
import SettingsMessages from "@/src/features/messages/containers/settings/SettingsMessages";
import StrangeMessages from "@/src/features/messages/containers/strange-messages/StrangeMessages";
import Conversations from "@/src/features/messages/containers/conversations/Conversations";
import DetailsConversations from "@/src/features/messages/containers/conversations/DetailsConversations";
import PhotoAndFile from "@/src/features/messages/containers/conversations/PhotoAndFile";
import SettingsNotify from "@/src/features/messages/containers/conversations/SettingsNotify";
import { Conversation, UserDisplay } from "@/src/interface/interface_flex";
import ListMember from "@/src/features/messages/containers/conversations/ListMember";
import AddMember from "@/src/features/messages/containers/conversations/AddMember";
import PageMessages from "@/src/features/messages/containers/page-messages/PageMessages";
import { MapNavigation, MapStackParamList } from "./MapNavigation";

export type MessagesDrawerParamList = {
    "Tin nhắn": {
      screen?: keyof ChatStackParamList;
      params?: ChatStackParamList[keyof ChatStackParamList];
    };
    "Cài đặt": undefined;
    "Tin nhắn lạ": {
      screen?: keyof StrangeChatStackParamList;
      params?: StrangeChatStackParamList[keyof StrangeChatStackParamList];
    };
    "Tin nhắn trang của bạn": undefined;
};

const Drawer = createDrawerNavigator<MessagesDrawerParamList>();

const MessagesDrawerWrapper = () => {
  return (
    <Drawer.Navigator 
    initialRouteName="Tin nhắn"
        screenOptions={{
          headerShown: false, 
        }}>
      <Drawer.Screen name="Tin nhắn" component={MessageNavigation} />
      <Drawer.Screen name="Cài đặt" component={SettingsMessages} />
      <Drawer.Screen name="Tin nhắn lạ" component={StrangeMessageNavigation} />
      <Drawer.Screen name="Tin nhắn trang của bạn" component={PageChatNavigation} />
    </Drawer.Navigator>
  );
};

export default MessagesDrawerWrapper;

export type ChatStackParamList = {
  ListMessages: undefined;
  NewChat: undefined;
  NewGroupChat: {defaultChoose?: UserDisplay[]};
  BoxChat: { 
    conversationId: string | null, 
    isFriend?: boolean,
    friend? : {
      _id: string;
      displayName: string;
    }
  };
  Details: { defaultConversation: Conversation, isFriend?: boolean };
  PhotoAndFile: { conversationId: string };
  SettingsNotify: { conversation: Conversation };
  ListMember: {conversation: Conversation};
  AddMember: {conversationId: string, defaultChoose?: UserDisplay[]};
  Map: {
    screen?: keyof MapStackParamList;
    params?: MapStackParamList[keyof MapStackParamList];
  };
};

const Stack = createStackNavigator<ChatStackParamList>();

export function MessageNavigation() {
return (
    <Stack.Navigator initialRouteName="ListMessages" screenOptions={{
       headerShown: false,
    }}>
        <Stack.Screen name="ListMessages" component={Messages} />
        <Stack.Screen name="NewChat" component={NewChat} />
        <Stack.Screen name="NewGroupChat" component={NewGroupChat} />
        <Stack.Screen name="BoxChat" component={Conversations} />
        <Stack.Screen name="Details" component={DetailsConversations} />
        <Stack.Screen name="PhotoAndFile" component={PhotoAndFile} />
        <Stack.Screen name="SettingsNotify" component={SettingsNotify} />
        <Stack.Screen name="ListMember" component={ListMember} />
        <Stack.Screen name="AddMember" component={AddMember} />
        <Stack.Screen name="Map" component={MapNavigation} />
    </Stack.Navigator>
);
}

export type StrangeChatStackParamList = {
  StrangeMessages: undefined;
  BoxChat: { 
    conversationId: string | null, 
    isFriend?: boolean;
    friend? : {
      _id: string;
      displayName: string;
    }
  };
  Details: { defaultConversation: Conversation, isFriend?: boolean};
  PhotoAndFile: { conversationId: string };
  SettingsNotify: { conversation: Conversation };
};

const StackStrange = createStackNavigator<StrangeChatStackParamList>();

export function StrangeMessageNavigation() {
return (
    <StackStrange.Navigator initialRouteName="StrangeMessages" screenOptions={{
       headerShown: false,
    }}>
        <StackStrange.Screen name="BoxChat" component={Conversations} />
        <StackStrange.Screen name="StrangeMessages" component={StrangeMessages} />
        <StackStrange.Screen name="Details" component={DetailsConversations} />
        <StackStrange.Screen name="PhotoAndFile" component={PhotoAndFile} />
        <StackStrange.Screen name="SettingsNotify" component={SettingsNotify} />
    </StackStrange.Navigator>
);
}

export type PageChatStackParamList = {
  PageChat: undefined;
  BoxChat: { 
    conversationId: string | null, 
    isFriend?: boolean;
    friend? : {
      _id: string;
      displayName: string;
    }
  };
  Details: { defaultConversation: Conversation, isFriend?: boolean };
  PhotoAndFile: { conversationId: string };
  SettingsNotify: { conversation: Conversation };
};

const PageChat = createStackNavigator<PageChatStackParamList>();

export function PageChatNavigation() {
return (
    <PageChat.Navigator initialRouteName="PageChat" screenOptions={{
       headerShown: false,
    }}>
        <PageChat.Screen name="BoxChat" component={Conversations} />
        <PageChat.Screen name="PageChat" component={PageMessages} />
        <PageChat.Screen name="Details" component={DetailsConversations} />
        <PageChat.Screen name="PhotoAndFile" component={PhotoAndFile} />
        <PageChat.Screen name="SettingsNotify" component={SettingsNotify} />
    </PageChat.Navigator>
);
}