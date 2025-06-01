import { Article } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const groupsClient = restClient.apiClient.service("apis/groups");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export const useGroupPostApproval = (groupId: string) => {
  const [pendingPosts, setPendingPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const getCurrentUserDisplayName = async () => {
    const name = await AsyncStorage.getItem("displayName");
    setCurrentUserDisplayName(name);
  };

  const fetchPendingArticles = useCallback(
    async (newPage = 1, append = false) => {
      if (newPage > totalPages && totalPages !== 0) return;

      setLoading(!append);
      setIsLoadingMore(append);
      setError(null);

      try {
        const groupSpecificClient = restClient.apiClient.service(`apis/groups/${groupId}/pending-articles`);

        const response = await groupSpecificClient.find({
          page: newPage,
          limit: 5,
        });

        if (response.success) {
          const validPosts = (response.data || []).filter((post: Article) => post && post._id);
          setPendingPosts((prev) => (append ? [...prev, ...validPosts] : validPosts));
          setTotalPages(response.totalPages || 1);
          setPage(newPage);
        } else {
          setError(response.message || "Không thể lấy danh sách bài viết đang chờ duyệt.");
          setPendingPosts([]);
        }
      } catch (error) {
        console.error("Lỗi API khi lấy bài viết chờ duyệt:", error);
        setError("Có lỗi xảy ra khi lấy danh sách bài viết.");
        setPendingPosts([]);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [groupId, totalPages]
  );

  const loadMorePosts = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      fetchPendingArticles(page + 1, true);
    }
  }, [page, totalPages, isLoadingMore, fetchPendingArticles]);

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
              message: `đã duyệt bài viết của bạn trong ${groupName}`,
              status: "unread",
              groupId: groupId,
              relatedEntityType: "Group",
            });
          } catch (notificationError) {
            console.error("🔴 Lỗi khi gửi thông báo duyệt bài viết:", notificationError);
          }
        }
        setPendingPosts(pendingPosts.filter((post) => post._id !== id));
      } else {
        console.error("Lỗi khi duyệt bài viết:", response.message);
        setError(response.message || "Không thể duyệt bài viết.");
      }
    } catch (error) {
      console.error("Lỗi API khi duyệt bài viết:", error);
      setError("Có lỗi xảy ra khi duyệt bài viết.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await groupsClient.patch(`${groupId}/articles/${id}`, { action: "reject" });
      if (response.success) {
        setPendingPosts(pendingPosts.filter((post) => post._id !== id));
      } else {
        console.error("Lỗi khi từ chối bài viết:", response.message);
        setError(response.message || "Không thể từ chối bài viết.");
      }
    } catch (error) {
      console.error("Lỗi API khi từ chối bài viết:", error);
      setError("Có lỗi xảy ra khi từ chối bài viết.");
    }
  };

  useEffect(() => {
    getCurrentUserDisplayName();
    if (groupId) {
      fetchPendingArticles();
    }
  }, [groupId, fetchPendingArticles]);

  return {
    pendingPosts,
    loading,
    error,
    handleApprove,
    handleReject,
    loadMorePosts,
    isLoadingMore,
    fetchPendingArticles,
  };
};