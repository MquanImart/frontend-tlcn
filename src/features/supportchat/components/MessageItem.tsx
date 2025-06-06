import { StyleSheet, Text, View } from "react-native";
import { Message } from "../interface/Message";
import getColor from "@/src/styles/Color";

const colors = getColor();

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  const formatMessage = () => {
    if (!message.boldRanges || message.isUser) {
      return <Text style={styles.messageText}>{message.text}</Text>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sắp xếp boldRanges theo start để xử lý đúng thứ tự
    const sortedRanges = [...message.boldRanges].sort((a, b) => a.start - b.start);

    for (const range of sortedRanges) {
      // Thêm phần văn bản trước đoạn in đậm
      if (range.start > lastIndex) {
        parts.push(
          <Text key={lastIndex} style={styles.messageText}>
            {message.text.slice(lastIndex, range.start)}
          </Text>
        );
      }
      // Thêm phần in đậm bằng style
      parts.push(
        <Text key={range.start} style={[styles.messageText, { fontWeight: 'bold' }]}>
          {message.text.slice(range.start, range.end)}
        </Text>
      );
      lastIndex = range.end;
    }

    // Thêm phần văn bản còn lại
    if (lastIndex < message.text.length) {
      parts.push(
        <Text key={lastIndex} style={styles.messageText}>
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
    backgroundColor: colors.mainColor1,
    color: colors.white_homologous,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.textColor1,
  },
  messageText: {
    fontSize: 16,
    color: colors.textColor1,
  },
});

export default MessageItem;