import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Message } from "../interface/Message";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';


interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  useTheme();
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

    const sortedRanges = [...message.boldRanges].sort((a, b) => a.start - b.start);

    for (const range of sortedRanges) {
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
        { backgroundColor: message.isUser ? Color.mainColor1 : Color.backgroundSecondary }, // Dynamic background
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
  },
  supportMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 14,
  },
  userText: {
    color: Color.textOnMain1, // Text color for user messages
  },
  supportText: {
    color: Color.textPrimary, // Text color for support messages
  },
});

export default MessageBubble;