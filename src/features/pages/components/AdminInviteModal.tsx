import React from "react";
import { View, Text, Modal, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import CButton from "@/src/shared/components/button/CButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface AdminInviteModalProps {
  visible: boolean;
  invites: { idUser: string }[];
  onAccept: (userId: string) => void;
  onDecline: (userId: string) => void;
  onClose: () => void;
}

const AdminInviteModal: React.FC<AdminInviteModalProps> = ({ visible, invites, onAccept, onDecline, onClose }) => {
  useTheme()
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Icon name="close" size={24} color={Color.textColor1} />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Lời mời làm quản trị viên</Text>

          {invites.length === 0 ? (
            <Text style={styles.noInvitesText}>Không có lời mời nào</Text>
          ) : (
            <FlatList
              data={invites}
              keyExtractor={(item) => item.idUser}
              renderItem={({ item }) => (
                <View style={styles.inviteItem}>
                  <Text style={styles.inviteText}>Bạn được mời làm quản trị viên</Text>
                  <View style={styles.inviteActions}>
                    <CButton
                      label="Chấp nhận"
                      onSubmit={() => onAccept(item.idUser)}
                      style={{
                        width: "45%",
                        height: 40,
                        backColor: Color.mainColor2,
                        textColor: Color.textColor2,
                        fontSize: 14,
                        fontWeight: "bold",
                        radius: 8,
                      }}
                    />
                    <CButton
                      label="Từ chối"
                      onSubmit={() => onDecline(item.idUser)}
                      style={{
                        width: "45%",
                        height: 40,
                        backColor: Color.textColor3,
                        textColor: Color.textColor2,
                        fontSize: 14,
                        fontWeight: "bold",
                        radius: 8,
                      }}
                    />
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AdminInviteModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: Color.white_homologous,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color.textColor1,
    marginBottom: 12,
  },
  noInvitesText: {
    fontSize: 16,
    color: Color.textColor3,
    marginVertical: 10,
  },
  inviteItem: {
    width: "100%",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Color.borderColor1,
  },
  inviteText: {
    fontSize: 16,
    color: Color.textColor1,
    textAlign: "center",
    marginBottom: 10,
  },
  inviteActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
