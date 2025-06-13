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
    // Loại bỏ dấu # để tạo truy vấn tìm kiếm
    const query = hashtag.replace('#', '');
    // Mở URL tìm kiếm (ví dụ: Google Search)
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    Linking.openURL(searchUrl).catch((err) => console.error('Không thể mở URL:', err));
    // Hoặc, chuyển hướng đến màn hình tìm kiếm nội bộ:
    // navigation.navigate('SearchScreen', { query });
  };

  const formatMessage = () => {
    // Tách hashtag và văn bản chính
    const regex = /(#\w+)/g;
    const hashtags: string[] = [];
    let cleanText = message.text;

    // Thu thập hashtag và loại bỏ chúng khỏi văn bản chính
    let match;
    while ((match = regex.exec(message.text)) !== null) {
      hashtags.push(match[0]);
      cleanText = cleanText.replace(match[0], '');
    }
    // Loại bỏ khoảng trắng thừa
    cleanText = cleanText.replace(/\s+/g, ' ').trim();

    const parts: React.ReactNode[] = [];

    // Xử lý văn bản chính (không có hashtag)
    if (!message.boldRanges || message.isUser) {
      // Nếu không có boldRanges hoặc là tin nhắn người dùng, hiển thị văn bản sạch
      if (cleanText) {
        parts.push(
          <Text
            key="clean-text"
            style={[
              styles.messageText,
              message.isUser ? styles.userText : styles.supportText,
            ]}
          >
            {cleanText}
          </Text>
        );
      }
    } else {
      // Xử lý boldRanges cho tin nhắn bot
      let lastIndex = 0;
      const sortedRanges = [...message.boldRanges].sort((a, b) => a.start - b.start);

      // Điều chỉnh boldRanges cho văn bản đã loại bỏ hashtag
      const adjustedRanges: Array<{ start: number; end: number }> = [];
      let offset = 0;
      for (const range of sortedRanges) {
        let start = range.start - offset;
        let end = range.end - offset;
        const segment = message.text.slice(range.start, range.end);
        const hashtagMatches = segment.match(regex);
        if (hashtagMatches) {
          // Tính toán độ lệch do hashtag bị xóa trong đoạn in đậm
          const hashtagLength = hashtagMatches.join('').length + hashtagMatches.length; // +1 for space
          end -= hashtagLength;
        }
        if (start < cleanText.length && end <= cleanText.length && start < end) {
          adjustedRanges.push({ start, end });
        }
        offset += range.end - range.start;
      }

      // Hiển thị văn bản với boldRanges
      for (const range of adjustedRanges) {
        if (range.start > lastIndex && cleanText.slice(lastIndex, range.start)) {
          parts.push(
            <Text
              key={`text-${lastIndex}`}
              style={[styles.messageText, styles.supportText]}
            >
              {cleanText.slice(lastIndex, range.start)}
            </Text>
          );
        }
        if (cleanText.slice(range.start, range.end)) {
          parts.push(
            <Text
              key={`bold-${range.start}`}
              style={[styles.messageText, styles.supportText, { fontWeight: 'bold' }]}
            >
              {cleanText.slice(range.start, range.end)}
            </Text>
          );
        }
        lastIndex = range.end;
      }

      // Thêm phần văn bản còn lại
      if (lastIndex < cleanText.length && cleanText.slice(lastIndex)) {
        parts.push(
          <Text
            key={`text-${lastIndex}`}
            style={[styles.messageText, styles.supportText]}
          >
            {cleanText.slice(lastIndex)}
          </Text>
        );
      }
    }

    // Thêm hashtag ở cuối
    if (hashtags.length > 0) {
      parts.push(
        <View key="hashtags" style={styles.hashtagContainer}>
          {hashtags.map((hashtag, index) => (
            <TouchableOpacity
              key={`hashtag-${index}`}
              onPress={() => handleHashtagPress(hashtag)}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.supportText,
                  { textDecorationLine: 'underline', color: Color.mainColor2 },
                ]}
              >
                {hashtag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return parts.length > 0 ? parts : (
      <Text
        style={[
          styles.messageText,
          message.isUser ? styles.userText : styles.supportText,
        ]}
      >
        {cleanText || ' '}
      </Text>
    );
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
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
});

export default MessageBubble;