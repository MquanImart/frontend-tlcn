// useGroupPostApproval.ts
import { useState, useEffect } from "react";
import restClient from "@/src/shared/services/RestClient";
import { Article } from "@/src/features/newfeeds/interface/article";
import AsyncStorage from "@react-native-async-storage/async-storage";

const groupsClient = restClient.apiClient.service("apis/groups");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export const useGroupPostApproval = (groupId: string) => {
  const [pendingPosts, setPendingPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string | null>(null); // Thêm state cho displayName của người duyệt

  const getCurrentUserDisplayName = async () => {
    const name = await AsyncStorage.getItem("displayName");
    setCurrentUserDisplayName(name);
  };

  const fetchPendingArticles = async () => {
    try {
      const response = await groupsClient.get(`${groupId}/pending-articles`);
      if (response.success) {
        setPendingPosts(response.data);
      } else {
        console.error("Không có bài viết đang chờ duyệt:", response.message);
      }
    } catch (error) {
      console.error("Lỗi API khi lấy bài viết chờ duyệt:", error);
    } finally {
      setLoading(false);
    }
  };

  // Approve a post
  const handleApprove = async (id: string) => {
    try {
      const response = await groupsClient.patch(`${groupId}/articles/${id}`, { action: "approve" });
      if (response.success) {
        const approvedPost = pendingPosts.find((post) => post._id === id);
        if (approvedPost && approvedPost.createdBy._id !== (await AsyncStorage.getItem("userId"))) {
          try {
            const groupName = response.data.groupName || "nhóm"; 
            await notificationsClient.create({
              senderId: await AsyncStorage.getItem("userId"), 
              receiverId: approvedPost.createdBy._id, 
              message: `${currentUserDisplayName || "Quản trị viên"} đã duyệt bài viết của bạn trong ${groupName}`,
              status: "unread",
            });
          } catch (notificationError) {
            console.error("🔴 Lỗi khi gửi thông báo duyệt bài viết:", notificationError);
          }
        }
        setPendingPosts(pendingPosts.filter((post) => post._id !== id));
      } else {
        console.error("Lỗi khi duyệt bài viết:", response.message);
      }
    } catch (error) {
      console.error("Lỗi API khi duyệt bài viết:", error);
    }
  };

  // Reject a post
  const handleReject = async (id: string) => {
    try {
      const response = await groupsClient.patch(`${groupId}/articles/${id}`, { action: "reject" });
      if (response.success) {
        setPendingPosts(pendingPosts.filter((post) => post._id !== id));
      } else {
        console.error("Lỗi khi từ chối bài viết:", response.message);
      }
    } catch (error) {
      console.error("Lỗi API khi từ chối bài viết:", error);
    }
  };

  useEffect(() => {
    getCurrentUserDisplayName(); // Lấy displayName khi mount
    fetchPendingArticles();
  }, [groupId]);

  return {
    pendingPosts,
    loading,
    handleApprove,
    handleReject,
  };
};