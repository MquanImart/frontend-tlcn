import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Message } from "../interface/Message";
import getColor from "@/src/styles/Color";

const colors = getColor();

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => (
  <View
    style={[
      styles.messageBubble,
      message.isUser ? styles.userMessage : styles.supportMessage,
    ]}
  >
    <Text
      style={[
        styles.messageText,
        message.isUser ? styles.userText : styles.supportText, // Thêm style riêng cho text
      ]}
    >
      {message.text}
    </Text>
  </View>
);

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
    backgroundColor: colors.backGround2 
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