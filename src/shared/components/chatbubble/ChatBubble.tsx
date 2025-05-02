import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import getColor from "@/src/styles/Color";
import { NewFeedParamList } from "@/src/shared/routes/NewFeedNavigation"; // Import type từ NewFeedNavigation

const colors = getColor();
const ROBOT_IMAGE = "https://cdn-icons-png.flaticon.com/512/4712/4712105.png";

const ChatBubble: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<NewFeedParamList>>();

  const handlePress = () => {
    navigation.navigate("SupportChatNavigation"); // Điều hướng đến SupportChatNavigation
  };

  return (
    <TouchableOpacity style={styles.bubble} onPress={handlePress}>
      <Image
        source={{ uri: ROBOT_IMAGE }}
        style={styles.robotImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    bottom: 220,
    right: 5,
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: colors.mainColor2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  robotImage: {
    width: 40,
    height: 40,
  },
});

export default ChatBubble;