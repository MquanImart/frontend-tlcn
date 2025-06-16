import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Message } from "../interface/Message";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  useTheme();

  const handleHashtagPress = (hashtag: string) => {
    const query = hashtag.replace('#', '');
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    Linking.openURL(searchUrl).catch((err) => console.error('Không thể mở URL:', err));
  };

  const formatMessage = () => {
    if (!message.text || message.text.trim().length === 0) {
      return (
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.supportText,
          ]}
        >
          {' '}
        </Text>
      );
    }

    const parts: React.ReactNode[] = [];
    const text = message.text;
    const regex = /\*\*([^\*]+)\*\*(.*?)(?=\*\*|$)/gs; // Lấy tiêu đề **text** và nội dung phía sau

    let match;
    while ((match = regex.exec(text)) !== null) {
      const boldText = match[1].trim(); // Tiêu đề in đậm
      let content = match[2].trim(); // Nội dung phía sau

      // Loại bỏ hashtag (#tag)
      content = content.replace(/#\w+/g, '').trim();

      // Loại bỏ các dấu * thừa không thuộc định dạng Markdown (*text* hoặc **text**)
      content = content.replace(/(?<!\*)\*(?!\*)/g, '').trim();

      // Nếu nội dung không rỗng, hiển thị tiêu đề và nội dung
      if (boldText) {
        parts.push(
          <View key={`section-${match.index}`} style={{ marginBottom: 12 }}>
            <Text
              style={[
                styles.messageText,
                message.isUser ? styles.userText : styles.supportText,
                { fontWeight: 'bold' },
              ]}
            >
              {boldText}
            </Text>
            {content && (
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.supportText,
                ]}
              >
                {content}
              </Text>
            )}
          </View>
        );
      }
    }

    // Nếu không có tiêu đề in đậm, hiển thị toàn bộ văn bản (loại bỏ hashtag và dấu * thừa)
    if (parts.length === 0) {
      let cleanText = text.replace(/#\w+/g, '').trim();
      cleanText = cleanText.replace(/(?<!\*)\*(?!\*)/g, '').trim();
      return cleanText ? (
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.supportText,
          ]}
        >
          {cleanText}
        </Text>
      ) : (
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.supportText,
          ]}
        >
          Không có nội dung để hiển thị.
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
        { backgroundColor: message.isUser ? Color.mainColor2 : Color.backgroundSecondary },
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
    color: Color.textOnMain2,
  },
  supportText: {
    color: Color.textPrimary,
  },
});

export default MessageBubble;