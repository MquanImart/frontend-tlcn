import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import getColor from "@/src/styles/Color";
import CIconButton from "@/src/shared/components/button/CIconButton";
import CButton from "@/src/shared/components/button/CButton";

const Color = getColor();

interface UserInfoProps {
  groupName: string;
  role: string;
  joinDate: number;
  inviterAvatar: string;
  onPress?: () => void; // Thêm prop mới 
}

const UserInfo: React.FC<UserInfoProps> = ({ groupName, role, joinDate, onPress }) => {

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {/* Tên nhóm */}
      <View style={styles.groupInfo}>
        <Ionicons name="people-outline" size={20} color={Color.textColor1} />
        <Text style={styles.groupName}>{groupName}</Text>
      </View>

      {/* Ngày tham gia và vai trò */}
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={20} color={Color.textColor1} />
        <Text style={styles.infoText}>
          Thành viên từ ngày:{" "}
          <Text style={styles.highlight}>
            {new Date(joinDate).toLocaleDateString("vi-VN")}
          </Text>
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="briefcase-outline" size={20} color={Color.textColor1} />
        <Text style={styles.infoText}>
          Vai trò: <Text style={styles.highlight}>{role}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default UserInfo;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.white_homologous,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  groupInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color.textColor1,
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: Color.textColor1,
    marginLeft: 10,
  },
  highlight: {
    fontWeight: "bold",
    color: Color.mainColor1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color.textColor1,
  },
  modalContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  inviteText: {
    fontSize: 16,
    color: Color.textColor1,
  },
  inviteDate: {
    fontSize: 14,
    color: Color.textColor3,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
