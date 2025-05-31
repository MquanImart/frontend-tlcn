import { showActionSheet } from "@/src/shared/components/showActionSheet/showActionSheet"; // Import showActionSheet
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";
import getColor from "@/src/styles/Color";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Color = getColor();
const DEFAULT_AVATAR = "https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png";

interface MemberCardProps {
  name: string;
  avatar: string;
  description?: string;
  memberUserId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner"; // Add role prop
  section: string; // Add section prop to identify member type
  navigation: StackNavigationProp<GroupParamList>;
  onLongPress: (userId: string, section: string) => { label: string; onPress: () => void; destructive?: boolean }[]; // Add onLongPress handler
}

const MemberCard: React.FC<MemberCardProps> = ({
  name,
  avatar,
  description,
  memberUserId,
  currentUserId,
  role,
  section,
  navigation,
  onLongPress,
}) => {
  const avatarSource = avatar && avatar.trim() !== "" ? { uri: avatar } : { uri: DEFAULT_AVATAR };

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

  const handleLongPress = () => {
    if (role === "Guest" || role === "Member") {
      console.log("Long-press disabled for role:", role);
      return;
    }
    const options = onLongPress(memberUserId, section);
    console.log("Long-press options:", options, "for user:", memberUserId, "in section:", section);
    if (options.length > 0) {
      showActionSheet(options);
    } else {
      console.warn("No options available for long-press");
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={300} // Explicitly set long-press delay
      style={styles.card}
      activeOpacity={0.8}
    >
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