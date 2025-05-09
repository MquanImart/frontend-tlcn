import { showActionSheet } from "@/src/shared/components/showActionSheet/showActionSheet";
import restClient from "@/src/shared/services/RestClient";
import socket from "@/src/shared/services/socketio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Notification } from "../../interface/INotification";

const notificationsClient = restClient.apiClient.service("apis/notifications");

const useNotificationScreen = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("Tất cả");
  const [isSwiping, setIsSwiping] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!userId) return;

    socket.emit("joinUser", userId);

    socket.on("newNotification", ({ notification }) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.emit("leaveUser", userId);
      socket.off("newNotification");
    };
  }, [userId]);

  const getUserId = async () => {
    const id = await AsyncStorage.getItem("userId");
    setUserId(id);
  };

  useEffect(() => {
    getUserId();
  }, []);

  const tabs = ["Tất cả", "Chưa đọc", "Đã đọc"];

  const fetchNotifications = useCallback(
    async (newPage = 1, append = false) => {
      if (!userId || (newPage > totalPages && totalPages !== 0)) return;

      setLoading(!append);
      setIsLoadingMore(append);

      try {
        const status =
          selectedTab === "Chưa đọc" ? "unread" : selectedTab === "Đã đọc" ? "read" : "";

        const result = await notificationsClient.find({
          receiverId: userId,
          status,
          page: newPage,
          limit: 10,
        });

        if (result.success) {
          setNotifications((prev) =>
            append ? [...prev, ...result.data] : result.data
          );
          setTotalPages(result.totalPages);
          setPage(newPage);
        } else {
          console.error("Lỗi khi lấy thông báo:", result.message);
        }
      } catch (error) {
        console.error("Lỗi xảy ra:", error);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [userId, selectedTab, totalPages]
  );

  const loadMoreNotifications = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      fetchNotifications(page + 1, true);
    }
  }, [page, totalPages, isLoadingMore, fetchNotifications]);

  const handleSwipe = useCallback(
    (direction: string) => {
      if (isSwiping) return;

      const currentIndex = tabs.indexOf(selectedTab);

      if (direction === "left" && currentIndex < tabs.length - 1) {
        setSelectedTab(tabs[currentIndex + 1]);
      } else if (direction === "right" && currentIndex > 0) {
        setSelectedTab(tabs[currentIndex - 1]);
      }

      setIsSwiping(true);
      setTimeout(() => setIsSwiping(false), 300);
    },
    [isSwiping, selectedTab]
  );

  const handleUpdateNotificationStatus = useCallback(
    async (id: string, status: "read" | "unread") => {
      try {
        await notificationsClient.patch(id, { status });
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === id ? { ...notification, status } : notification
          )
        );
      } catch (error) {
        console.error(`Lỗi khi cập nhật trạng thái ${status}:`, error);
      }
    },
    []
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await notificationsClient.remove(id);
        setNotifications((prev) =>
          prev.filter((notification) => notification._id !== id)
        );
      } catch (error) {
        console.error("Lỗi khi xóa thông báo:", error);
      }
    },
    []
  );

  const handleOptions = useCallback(
    (onMarkAsRead: () => void, onMarkAsUnread: () => void, onDelete: () => void) => {
      showActionSheet(
        [
          { label: "Đánh dấu đã đọc", onPress: onMarkAsRead },
          { label: "Đánh dấu chưa đọc", onPress: onMarkAsUnread },
          { label: "Xóa thông báo", onPress: onDelete, destructive: true },
        ],
        "Hủy"
      );
    },
    []
  );

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, selectedTab]);

  return {
    notifications,
    selectedTab,
    setSelectedTab,
    handleMarkAsRead: (id: string) => handleUpdateNotificationStatus(id, "read"),
    handleMarkAsUnread: (id: string) => handleUpdateNotificationStatus(id, "unread"),
    handleDelete,
    handleOptions,
    unreadCount,
    handleSwipe,
    loading,
    getUserId,
    loadMoreNotifications,
    isLoadingMore,
  };
};

export default useNotificationScreen;