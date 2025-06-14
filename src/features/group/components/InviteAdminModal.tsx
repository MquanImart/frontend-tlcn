import CButton from "@/src/shared/components/button/CButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface InviteAdminModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  groupName: string;
  inviterName: string; // This prop is not used in the current render logic.
  inviteDate: string;
  inviterAvatar: string;
}

const InviteAdminModal: React.FC<InviteAdminModalProps> = ({
  visible,
  onClose,
  onAccept,
  onReject,
  groupName,
  // inviterName, // Removed as it's unused
  inviteDate,
  inviterAvatar,
}) => {
  useTheme(); // Ensure this hook is called to get the dynamic colors

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: Color.backgroundSecondary + 'cc' }]}>
        <View style={[styles.container, { backgroundColor: Color.background }]}>
          {/* Tiêu đề */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: Color.textPrimary }]}>Lời mời làm quản trị viên</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Color.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Thông tin người mời */}
          <View style={styles.content}>
            <Image source={{ uri: inviterAvatar }} style={styles.avatar} />
            <View style={styles.textContainer}>
              <Text style={[styles.inviteText, { color: Color.textPrimary }]}>
                Nhóm <Text style={[styles.highlight, { color: Color.mainColor2 }]}>{groupName}</Text> đã mời bạn làm quản trị viên
              </Text>
              <Text style={[styles.inviteDate, { color: Color.textSecondary }]}>Thời gian: {inviteDate}</Text>
            </View>
          </View>

          {/* Nút thao tác */}
          <View style={styles.buttonContainer}>
            <CButton
              label="Từ chối"
              onSubmit={onReject}
              style={{
                width: "48%",
                height: 45,
                backColor: Color.background,
                textColor: Color.mainColor2,
                fontSize: 16,
                fontWeight: "bold",
                radius: 8,
                borderWidth: 1,
                borderColor: Color.mainColor2,
              }}
            />
            <CButton
              label="Chấp nhận"
              onSubmit={onAccept}
              style={{
                width: "48%",
                height: 45,
                backColor: Color.mainColor2,
                textColor: Color.textOnMain2,
                fontSize: 16,
                fontWeight: "bold",
                radius: 8,
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InviteAdminModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
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
  },
  highlight: {
    fontWeight: "bold",
  },
  inviteDate: {
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});