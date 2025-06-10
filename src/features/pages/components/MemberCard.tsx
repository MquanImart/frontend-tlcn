import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const DEFAULT_AVATAR = "https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png";

interface MemberCardProps {
  name: string;
  avatar: string;
  description?: string;
}

const MemberCard: React.FC<MemberCardProps> = ({ name, avatar, description }) => {
  useTheme();
  const avatarSource = avatar && avatar.trim() !== ""
    ? { uri: avatar }
    : { uri: DEFAULT_AVATAR };

  return (
    <View style={[styles.card, {
      backgroundColor: Color.backgroundSecondary,
      shadowColor: Color.shadow,
    }]}>
      <Image source={avatarSource} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: Color.textPrimary }]}>{name}</Text>
        <Text style={[styles.description, { color: Color.textSecondary }]}>{description || "Không có mô tả"}</Text>
      </View>
    </View>
  );
};

export default MemberCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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
  },
  description: {
    fontSize: 14,
    marginTop: 5,
  },
});