// src/features/group/components/MemberCard.tsx (Cleaned)

import getColor from "@/src/styles/Color";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Imports for navigation
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";
import { StackNavigationProp } from "@react-navigation/stack";


const Color = getColor();

const DEFAULT_AVATAR = "https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png";

interface MemberCardProps {
  name: string;
  avatar: string;
  description?: string;
  memberUserId: string;
  currentUserId: string;
  navigation: StackNavigationProp<GroupParamList>;
}

const MemberCard: React.FC<MemberCardProps> = ({ name, avatar, description, memberUserId, currentUserId, navigation }) => {
  const avatarSource = avatar && avatar.trim() !== ""
    ? { uri: avatar }
    : { uri: DEFAULT_AVATAR };

  const handlePress = () => {
    console.log("Navigating to profile for user:", memberUserId);
    if (memberUserId === currentUserId) {
      navigation.navigate("ProfileNavigation", {
        screen: "MyProfile",
        params: undefined,
      });
    } else {
      navigation.navigate("ProfileNavigation", {
        screen: "Profile",
        params: { userId: memberUserId },
      });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <Image source={avatarSource} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description || "Không có mô tả"}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default MemberCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: Color.textColor1,
  },
  description: {
    fontSize: 14,
    color: Color.textColor3,
    marginTop: 5,
  },
});