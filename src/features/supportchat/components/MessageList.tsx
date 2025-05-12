import React, { RefObject } from "react";
import { FlatList, StyleSheet } from "react-native";
import MessageBubble from "./MessageBubble";
import { Message } from "../interface/Message";

interface MessageListProps {
  messages: Message[];
  flatListRef?: RefObject<FlatList<Message> | null>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, flatListRef }) => (
  <FlatList
    ref={flatListRef}
    data={messages}
    renderItem={({ item }) => <MessageBubble message={item} />}
    keyExtractor={(item) => item.id}
    style={styles.flatList}
    contentContainerStyle={styles.messageList}
    onScrollToIndexFailed={(info) => {
      console.warn("Scroll to index failed:", info);
      setTimeout(() => {
        flatListRef?.current?.scrollToEnd({ animated: true });
      }, 100);
    }}
  />
);

const styles = StyleSheet.create({
  flatList: {
    flex: 1, // Đảm bảo FlatList chiếm toàn bộ không gian
  },
  messageList: {
    padding: 10,
    flexGrow: 1, // Mở rộng nội dung
  },
});

export default MessageList;