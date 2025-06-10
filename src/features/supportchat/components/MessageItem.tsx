import { StyleSheet, Text, View } from "react-native";
import { Message } from "../interface/Message";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  useTheme();
  const formatMessage = () => {
    if (!message.boldRanges || message.isUser) {
      return (
        <Text
          style={[
            styles.messageText,
            message.isUser ? { color: Color.textOnMain2 } : { color: Color.textPrimary },
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
              message.isUser ? { color: Color.textOnMain2 } : { color: Color.textPrimary },
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
            { fontWeight: 'bold' },
            message.isUser ? { color: Color.textOnMain2 } : { color: Color.textPrimary },
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
            message.isUser ? { color: Color.textOnMain2 } : { color: Color.textPrimary },
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
        styles.container,
        message.isUser ? styles.userMessage : styles.botMessage,
        { backgroundColor: message.isUser ? Color.mainColor2 : Color.backgroundSecondary }, // Dynamic background
      ]}
    >
      {formatMessage()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
});

export default MessageItem;