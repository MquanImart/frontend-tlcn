import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import getColor from "@/src/styles/Color";

const colors = getColor();

interface ChatInputProps {
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ inputText, onChangeText, onSend }) => (
  <View style={styles.inputContainer}>
    <TextInput
      style={styles.input}
      value={inputText}
      onChangeText={onChangeText}
      placeholder="Nhập tin nhắn..."
      placeholderTextColor={colors.textColor3}
      multiline
    />
    <TouchableOpacity onPress={onSend} style={styles.sendButton}>
      <Ionicons name="send" size={24} color={colors.mainColor1} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderColor1,
    backgroundColor: colors.backGround,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backGround2 || "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.textColor1,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
  },
});

export default ChatInput;