import restClient from "@/src/shared/services/RestClient";
import { Image } from 'expo-image';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const groupsClient = restClient.apiClient.service("apis/groups");
const notificationsClient = restClient.apiClient.service("apis/notifications");

interface User {
  _id: string;
  displayName: string;
  avt: string | null;
}

interface InviteFriendsModalProps {
  groupId: string;
  userId: string;
  groupName: string;
  visible: boolean;
  onClose: () => void;
  onInvite: (selectedUsers: User[]) => void;
}

const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  groupId,
  userId,
  groupName,
  visible,
  onClose,
  onInvite,
}) => {
  const [friendsList, setFriendsList] = useState<User[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useTheme();

  useEffect(() => {
    if (visible) {
      fetchInvitableFriends();
    }
  }, [visible]);

  const fetchInvitableFriends = async () => {
    setLoading(true);
    try {
      const response = await groupsClient.get(`${groupId}/invite-friends?userId=${userId}`);
      if (response.success) {
        setFriendsList(response.data);
      } else {
        setFriendsList([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
      setFriendsList([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectFriend = (user: User) => {
    setSelectedFriends((prevSelected) =>
      prevSelected.some((u) => u._id === user._id)
        ? prevSelected.filter((u) => u._id !== user._id)
        : [...prevSelected, user]
    );
  };

  const sendInviteNotification = async (receiverId: string) => {
    try {
      await notificationsClient.create({
        senderId: userId,
        receiverId,
        message: `đã mời bạn tham gia nhóm ${groupName}.`,
        status: "unread",
        groupId: groupId,
        relatedEntityType: "Group",
      });
    } catch (error) {
      console.error(`Lỗi khi gửi thông báo đến ${receiverId}:`, error);
    }
  };

  const handleInvite = async () => {
    if (selectedFriends.length > 0) {
      selectedFriends.forEach(async (friend) => {
        await sendInviteNotification(friend._id);
      });

      onInvite(selectedFriends);
      setSelectedFriends([]);
      onClose();
      Alert.alert("Thành công", `Đã gửi lời mời đến ${selectedFriends.length} bạn bè!`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalContainer, { backgroundColor: Color.backgroundSecondary + 'cc' }]}>
        <View style={[styles.modalContent, { backgroundColor: Color.background }]}>
          <Text style={[styles.modalTitle, { color: Color.textPrimary }]}>Mời bạn bè vào nhóm</Text>

          {loading ? (
            <ActivityIndicator size="large" color={Color.mainColor2} />
          ) : friendsList.length === 0 ? (
            <Text style={[styles.noFriendsText, { color: Color.textSecondary }]}>Không có bạn bè nào để mời.</Text>
          ) : (
            <FlatList
              data={friendsList}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => {
                const isSelected = selectedFriends.some((u) => u._id === item._id);
                return (
                  <TouchableOpacity
                    style={[
                      styles.inviteItem,
                      { borderBottomColor: Color.border },
                      isSelected && { backgroundColor: Color.backgroundSelected },
                    ]}
                    onPress={() => toggleSelectFriend(item)}
                  >
                    {/* Avatar & Tên */}
                    <View style={styles.userInfo}>
                      <Image source={{ uri: item.avt || "https://via.placeholder.com/100" }} style={styles.avatar} />
                      <Text style={[styles.inviteText, { color: Color.textPrimary }]}>{item.displayName}</Text>
                    </View>

                    {/* Check Icon */}
                    <Icon
                      name={isSelected ? "check-box" : "check-box-outline-blank"}
                      size={24}
                      color={isSelected ? Color.mainColor2 : Color.textSecondary}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* Nút Mời và Đóng */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: Color.backgroundTertiary }]} onPress={onClose}>
              <Text style={[styles.closeText, { color: Color.textPrimary }]}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.inviteButton,
                { backgroundColor: Color.mainColor2 },
                selectedFriends.length === 0 && { backgroundColor: Color.backgroundTertiary },
              ]}
              onPress={handleInvite}
              disabled={selectedFriends.length === 0}
            >
              <Text style={[styles.inviteButtonText, { color: Color.textOnMain2 }]}>
                Mời ({selectedFriends.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InviteFriendsModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 320,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noFriendsText: {
    fontSize: 16,
    marginVertical: 10,
  },
  inviteItem: {
    padding: 12,
    borderBottomWidth: 1,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedItem: {
    // This style is now applied inline in renderItem, so it's not strictly needed here
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  inviteText: {
    fontSize: 16,
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  closeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginRight: 5,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  inviteButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginLeft: 5,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    // This style is now applied inline in renderItem, so it's not strictly needed here
  },
});