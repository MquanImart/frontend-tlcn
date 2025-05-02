import React from "react";
import { StyleSheet, KeyboardAvoidingView, Platform, Text, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";
import getColor from "@/src/styles/Color";
import { useSupportChatScreen } from "./useSupportChatScreen";
import { Message } from "../interface/Message";

const colors = getColor();
const ROBOT_IMAGE = "https://cdn-icons-png.flaticon.com/512/4712/4712105.png"; 


const SupportChatScreen: React.FC = () => {
  const initialMessages: Message[] = [
    { id: "1", text: "Xin chào! Tôi có thể giúp gì cho bạn?", isUser: false },
  ];
  const { messages, inputText, setInputText, handleSend } = useSupportChatScreen(initialMessages);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <Image
          source={{ uri: ROBOT_IMAGE }}
          style={styles.avatar}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>Hỗ trợ</Text>
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <MessageList messages={messages} />
        <ChatInput
          inputText={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.backGround,
  },
  header: {
    flexDirection: "row", 
    alignItems: "center",
    padding: 15,
    backgroundColor: colors.mainColor1,
  },
  avatar: {
    width: 30,
    height: 30,
    marginRight: 10, 
    borderRadius: 15, 
  },
  headerText: {
    color: colors.white_homologous,
    fontSize: 18,
    fontWeight: "bold",
  },
  keyboardContainer: {
    flex: 1,
  },
});

export default SupportChatScreen;