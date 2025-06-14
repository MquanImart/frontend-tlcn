import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface UserInfoProps {
  groupName: string;
  role: string;
  joinDate: number;
}

const UserInfo: React.FC<UserInfoProps> = ({ groupName, role, joinDate }) => {
  useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Color.background,
          shadowColor: Color.mainColor2,
          borderColor: Color.border,
          borderWidth: 1,
        },
      ]}
    >
      <View style={styles.groupInfo}>
        <Ionicons name="people-outline" size={20} color={Color.textPrimary} />
        <Text style={[styles.groupName, { color: Color.textPrimary }]}>{groupName}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={20} color={Color.textPrimary} />
        <Text style={[styles.infoText, { color: Color.textPrimary }]}>
          Thành viên từ ngày:{" "}
          <Text style={[styles.highlight, { color: Color.mainColor2 }]}>
            {new Date(joinDate).toLocaleDateString("vi-VN")}
          </Text>
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="briefcase-outline" size={20} color={Color.textPrimary} />
        <Text style={[styles.infoText, { color: Color.textPrimary }]}>
          Vai trò: <Text style={[styles.highlight, { color: Color.mainColor2 }]}>{role}</Text>
        </Text>
      </View>
    </View>
  );
};

export default UserInfo;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
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
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
  },
  highlight: {
    fontWeight: "bold",
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
    color: Color.textPrimary,
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
    color: Color.textPrimary,
  },
  inviteDate: {
    fontSize: 14,
    color: Color.textSecondary,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});