import React from "react";
import { FlatList, StyleSheet } from "react-native";
import MessageBubble from "./MessageBubble";
import { Message } from "../interface/Message";

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => (
  <FlatList
    data={messages}
    renderItem={({ item }) => <MessageBubble message={item} />}
    keyExtractor={(item) => item.id}
    contentContainerStyle={styles.messageList}
  />
);

const styles = StyleSheet.create({
  messageList: {
    padding: 10,
  },
});

export default MessageList;