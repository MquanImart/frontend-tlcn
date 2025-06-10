import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

interface ChatInputProps {
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ inputText, onChangeText, onSend }) => {
  useTheme(); // Ensure theme is active here
  return (
    <View style={[styles.inputContainer, { backgroundColor: Color.background, borderTopColor: Color.border }]}>
      <TextInput
        style={[styles.input, { backgroundColor: Color.backgroundSecondary, color: Color.textPrimary }]}
        value={inputText}
        onChangeText={onChangeText}
        placeholder="Nhập tin nhắn..."
        placeholderTextColor={Color.textSecondary} // Using textSecondary for placeholder
        multiline
      />
      <TouchableOpacity onPress={onSend} style={styles.sendButton}>
        <Ionicons name="send" size={24} color={Color.mainColor2} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
  },
});

export default ChatInput;