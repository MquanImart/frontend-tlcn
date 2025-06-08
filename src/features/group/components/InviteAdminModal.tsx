import CButton from "@/src/shared/components/button/CButton";
import getColor from "@/src/styles/Color";
import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Color = getColor();

interface InviteAdminModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  groupName: string;
  inviterName: string;
  inviteDate: string;
  inviterAvatar: string;
}

const InviteAdminModal: React.FC<InviteAdminModalProps> = ({
  visible,
  onClose,
  onAccept,
  onReject,
  groupName,
  inviterName,
  inviteDate,
  inviterAvatar,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Tiêu đề */}
          <View style={styles.header}>
            <Text style={styles.title}>Lời mời làm quản trị viên</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Color.textColor1} />
            </TouchableOpacity>
          </View>

          {/* Thông tin người mời */}
          <View style={styles.content}>
            <Image source={{ uri: inviterAvatar }} style={styles.avatar} />
            <View style={styles.textContainer}>
              <Text style={styles.inviteText}>
                Nhóm <Text style={styles.highlight}>{groupName}</Text> đã mời bạn làm quản trị viên
              </Text>
              <Text style={styles.inviteDate}>Thời gian: {inviteDate}</Text>
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
                backColor: "white",
                textColor: Color.mainColor1,
                fontSize: 16,
                fontWeight: "bold",
                radius: 8,
                borderWidth: 1,
                borderColor: Color.mainColor1,
              }}
            />
            <CButton
              label="Chấp nhận"
              onSubmit={onAccept}
              style={{
                width: "48%",
                height: 45,
                backColor: Color.mainColor1,
                textColor: "white",
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color.textColor1,
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
    color: Color.textColor1,
  },
  highlight: {
    fontWeight: "bold",
    color: Color.mainColor1,
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
