// src/features/group/containers/detail-group/tabs/useGroupMySelf.ts
import { Article } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

const groupsClient = restClient.apiClient.service("apis/groups");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export const useGroupMySelf = (groupId: string, currentUserId: string) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Keep modalVisible and setModalVisible here as they relate to adminInvite
  const [modalVisible, setModalVisible] = useState(false);
  const [adminInvite, setAdminInvite] = useState<{
    groupName: string;
    inviterName: string;
    inviteDate: string;
    inviterAvatar: string;
    inviterId: string;
    hasInvite: boolean;
  } | null>(null);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const getCurrentUserDisplayName = async () => {
    try {
      const name = await AsyncStorage.getItem("displayName");
      setCurrentUserDisplayName(name);
    } catch (error) {
      console.error("❌ Lỗi khi lấy displayName:", error);
    }
  };

  const fetchUserArticles = useCallback(
    async (newPage = 1, append = false) => {
      if (newPage > totalPages && totalPages !== 0) return;

      setLoading(!append);
      setIsLoadingMore(append);
      setError(null);

      try {
        const userSpecificClient = restClient.apiClient.service(`apis/groups/${groupId}/members/${currentUserId}/articles`);

        const response = await userSpecificClient.find({
          query: {
            page: newPage,
            limit: 5, // Phù hợp với backend
          },
        });

        if (response.success) {
          const validArticles = (response.data || []).filter((article: Article) => article && article._id);
          setArticles((prev) => (append ? [...prev, ...validArticles] : validArticles));
          setTotalPages(response.totalPages || 1);
          setPage(newPage);
        } else {
          setError(response.message || "Không thể lấy danh sách bài viết.");
          setArticles([]);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy bài viết của user:", error);
        setError("Có lỗi xảy ra khi lấy danh sách bài viết.");
        setArticles([]);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [groupId, currentUserId, totalPages]
  );

  const loadMoreArticles = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      fetchUserArticles(page + 1, true);
    }
  }, [page, totalPages, isLoadingMore, fetchUserArticles]);

  const fetchAdminInvite = async () => {
    try {
      const response = await groupsClient.get(`${groupId}/administrators/${currentUserId}`);
      if (response.success && response.data) {
        setAdminInvite({
          groupName: response.data.groupName || "",
          inviterName: response.data.inviterName || "Unknown",
          inviteDate: response.data.inviteDate || new Date().toISOString(),
          inviterAvatar: response.data.inviterAvatar || "",
          inviterId: response.data.inviterId || "",
          hasInvite: !!response.data.hasInvite,
        });
      } else {
        setAdminInvite(null);
      }
    } catch (error) {
      console.error("❌ Lỗi khi kiểm tra lời mời làm quản trị viên:", error);
      setAdminInvite(null);
    }
  };

  const handleAcceptInvite = async () => {
    if (!adminInvite) return;

    try {
      const response = await groupsClient.patch(`${groupId}/members/${currentUserId}`, { state: "accept-admin" });
      console.log('response', response)
      if (response.success) {
        if (adminInvite.inviterId && adminInvite.inviterId !== currentUserId) {
          try {
            await notificationsClient.create({
              senderId: currentUserId,
              receiverId: adminInvite.inviterId,
              message: `đã chấp nhận lời mời làm quản trị viên của ${adminInvite.groupName}`,
              status: "unread",
              groupId: groupId,
              relatedEntityType: "Group",
            });
          } catch (notificationError) {
            console.error("🔴 Lỗi khi gửi thông báo chấp nhận lời mời quản trị viên:", notificationError);
          }
        }

        Alert.alert("Thành công", "Bạn đã trở thành quản trị viên của nhóm.");
        setAdminInvite(null);
        setModalVisible(false); // Close modal
      } else {
        Alert.alert("Lỗi", response.message || "Không thể chấp nhận lời mời.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi chấp nhận lời mời:", error);
      Alert.alert("Lỗi", "Không thể chấp nhận lời mời làm quản trị viên.");
    }
  };

  const handleRejectInvite = async () => {
    if (!adminInvite) return;

    try {
      const response = await groupsClient.patch(`${groupId}/members/${currentUserId}`, { state: "remove-admin" }); // Assuming "remove-admin" state is used for rejection
      if (response.success) {
        setAdminInvite(null);
        setModalVisible(false); // Close modal
      } else {
        Alert.alert("Lỗi", response.message || "Không thể từ chối lời mời.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi từ chối lời mời:", error);
      Alert.alert("Lỗi", "Không thể từ chối lời mời làm quản trị viên.");
    }
  };

  useEffect(() => {
    getCurrentUserDisplayName();
    if (groupId && currentUserId) {
      fetchAdminInvite();
      fetchUserArticles();
    }
  }, [groupId, currentUserId, fetchUserArticles]);

  return {
    articles,
    setArticles,
    loading,
    error,
    modalVisible,
    setModalVisible,
    adminInvite,
    handleAcceptInvite, 
    handleRejectInvite,
    loadMoreArticles,
    isLoadingMore,
    fetchUserArticles,
  };
};