import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image } from 'expo-image';
import React, { useEffect, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatInput from "../components/ChatInput";
import MessageList from "../components/MessageList";
import { Message } from "../interface/Message";
import { useSupportChatScreen } from "./useSupportChatScreen";

const ROBOT_IMAGE = "https://cdn-icons-png.flaticon.com/512/4712/4712105.png";

const SupportChatScreen: React.FC = () => {
  useTheme();
  const initialMessages: Message[] = [
    { id: "1", text: "Xin chào! Tôi có thể giúp gì cho bạn?", isUser: false },
  ];
  const { messages, inputText, setInputText, handleSend } = useSupportChatScreen(
    initialMessages
  );

  const flatListRef = useRef<FlatList<Message>>(null as unknown as FlatList<Message>);

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: Color.background }]}>
      <View style={[styles.header, { backgroundColor: Color.mainColor2 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color={Color.textOnMain2} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image
            source={{ uri: ROBOT_IMAGE }}
            style={styles.avatar}
            resizeMode="contain"
          />
          <Text style={[styles.headerText, { color: Color.textOnMain2 }]}>Hỗ trợ</Text>
        </View>
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <MessageList messages={messages} flatListRef={flatListRef} />
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 35,
    height: 35,
    marginRight: 8,
    borderRadius: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  keyboardContainer: {
    flex: 1,
  },
});

export default SupportChatScreen;