// useGroupMySelf.ts
import { useState, useEffect } from "react";
import restClient from "@/src/shared/services/RestClient";
import { Article } from "@/src/features/newfeeds/interface/article";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const groupsClient = restClient.apiClient.service("apis/groups");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export const useGroupMySelf = (groupId: string, currentUserId: string) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminInvite, setAdminInvite] = useState<{
    groupName: string;
    inviterName: string;
    inviteDate: string;
    inviterAvatar: string;
    inviterId: string; // Thêm inviterId để gửi thông báo
    hasInvite: boolean;
  } | null>(null);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string | null>(null); // Thêm state cho displayName của người chấp nhận

  const getCurrentUserDisplayName = async () => {
    const name = await AsyncStorage.getItem("displayName");
    setCurrentUserDisplayName(name);
  };

  // Fetch articles for the user in the group
  const fetchUserArticles = async () => {
    setLoading(true);
    try {
      const response = await groupsClient.get(`${groupId}/members/${currentUserId}/articles`);
      setArticles(response.success ? response.data : []);
    } catch (error) {
      console.error("❌ Lỗi khi lấy bài viết của user:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has an invite to become an admin
  const fetchAdminInvite = async () => {
    try {
      const response = await groupsClient.get(`${groupId}/administrators/${currentUserId}`);
      if (response.success && response.data) {
        setAdminInvite({
          ...response.data,
          inviterId: response.data.inviterId, // Giả định API trả về inviterId
        });
      } else {
        setAdminInvite(null);
      }
    } catch (error) {
      console.error("❌ Lỗi khi kiểm tra lời mời làm quản trị viên:", error);
      setAdminInvite(null);
    }
  };

  useEffect(() => {
    getCurrentUserDisplayName(); // Lấy displayName khi mount
    if (groupId) {
      fetchAdminInvite();
      fetchUserArticles();
    }
  }, [groupId, currentUserId]);

  // Accept the admin invite
  const handleAcceptInvite = async () => {
    if (!adminInvite) return;

    try {
      const response = await groupsClient.patch(`${groupId}/members/${currentUserId}`, { state: "accept-admin" });
      if (response.success) {
        // Gửi thông báo đến người mời
        if (adminInvite.inviterId && adminInvite.inviterId !== currentUserId) {
          try {
            await notificationsClient.create({
              senderId: currentUserId, 
              receiverId: adminInvite.inviterId, 
              message: `${currentUserDisplayName || "Một người dùng"} đã chấp nhận lời mời làm quản trị viên của ${adminInvite.groupName}`,
              status: "unread",
            });
          } catch (notificationError) {
            console.error("🔴 Lỗi khi gửi thông báo chấp nhận lời mời quản trị viên:", notificationError);
          }
        }

        Alert.alert("Thành công", "Bạn đã trở thành quản trị viên của nhóm.");
        setAdminInvite(null);
        setModalVisible(false);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể chấp nhận lời mời.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi chấp nhận lời mời:", error);
      Alert.alert("Lỗi", "Không thể chấp nhận lời mời làm quản trị viên.");
    }
  };

  // Reject the admin invite
  const handleRejectInvite = async () => {
    if (!adminInvite) return;

    try {
      const response = await groupsClient.patch(`${groupId}/members/${currentUserId}`, { state: "remove-admin" });
      if (response.success) {
        Alert.alert("Thành công", "Bạn đã từ chối lời mời làm quản trị viên.");
        setAdminInvite(null);
        setModalVisible(false);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể từ chối lời mời.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi từ chối lời mời:", error);
      Alert.alert("Lỗi", "Không thể từ chối lời mời làm quản trị viên.");
    }
  };

  return {
    articles,
    setArticles,
    loading,
    modalVisible,
    setModalVisible,
    adminInvite,
    handleAcceptInvite,
    handleRejectInvite,
  };
};