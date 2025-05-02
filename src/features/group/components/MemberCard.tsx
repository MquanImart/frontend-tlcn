import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import getColor from "@/src/styles/Color";
import restClient from "@/src/shared/services/RestClient";
import { MyPhoto } from "@/src/interface/interface_reference";

const Color = getColor();

const DEFAULT_AVATAR = "https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png";

interface MemberCardProps {
  name: string;
  avatar: string;
  description?: string;
}

const MemberCard: React.FC<MemberCardProps> = ({ name, avatar, description }) => {
  const avatarSource = avatar && avatar.trim() !== "" 
    ? { uri: avatar } 
    : { uri: DEFAULT_AVATAR }; 

  return (
    <View style={styles.card}>
      <Image source={avatarSource} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description || "Không có mô tả"}</Text>
      </View>
    </View>
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