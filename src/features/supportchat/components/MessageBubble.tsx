import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Message } from "../interface/Message";
import getColor from "@/src/styles/Color";

const colors = getColor();

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const formatMessage = () => {
    if (!message.boldRanges || message.isUser) {
      return (
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.supportText,
          ]}
        >
          {message.text}
        </Text>
      );
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sắp xếp boldRanges theo start để xử lý đúng thứ tự
    const sortedRanges = [...message.boldRanges].sort((a, b) => a.start - b.start);

    for (const range of sortedRanges) {
      // Thêm phần văn bản trước đoạn in đậm
      if (range.start > lastIndex) {
        parts.push(
          <Text
            key={lastIndex}
            style={[
              styles.messageText,
              message.isUser ? styles.userText : styles.supportText,
            ]}
          >
            {message.text.slice(lastIndex, range.start)}
          </Text>
        );
      }
      // Thêm phần in đậm bằng style
      parts.push(
        <Text
          key={range.start}
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.supportText,
            { fontWeight: 'bold' },
          ]}
        >
          {message.text.slice(range.start, range.end)}
        </Text>
      );
      lastIndex = range.end;
    }

    // Thêm phần văn bản còn lại
    if (lastIndex < message.text.length) {
      parts.push(
        <Text
          key={lastIndex}
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.supportText,
          ]}
        >
          {message.text.slice(lastIndex)}
        </Text>
      );
    }

    return parts;
  };

  return (
    <View
      style={[
        styles.messageBubble,
        message.isUser ? styles.userMessage : styles.supportMessage,
      ]}
    >
      {formatMessage()}
    </View>
  );
};

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 15,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: colors.mainColor1,
  },
  supportMessage: {
    alignSelf: "flex-start",
    backgroundColor: colors.backGround2,
  },
  messageText: {
    fontSize: 14,
  },
  userText: {
    color: colors.white_homologous,
  },
  supportText: {
    color: colors.textColor1,
  },
});

export default MessageBubble;