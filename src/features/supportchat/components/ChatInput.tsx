import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import getColor from "@/src/styles/Color";

const Color = getColor();

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
      placeholderTextColor={Color.textColor3}
      multiline
    />
    <TouchableOpacity onPress={onSend} style={styles.sendButton}>
      <Ionicons name="send" size={24} color={Color.mainColor1} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: Color.borderColor1,
    backgroundColor: Color.backGround,
  },
  input: {
    flex: 1,
    backgroundColor: Color.backGround2 || "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    color: Color.textColor1,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
  },
});

export default ChatInput;