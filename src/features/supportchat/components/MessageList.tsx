import { FlatList, StyleSheet } from "react-native";
import { Message } from "../interface/Message";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  flatListRef?: React.RefObject<FlatList<Message>>;
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
    flex: 1,
  },
  messageList: {
    padding: 10,
    flexGrow: 1,
  },
});

export default MessageList;