import { Group } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const usersClient = restClient.apiClient.service("apis/users");
const groupsClient = restClient.apiClient.service("apis/groups");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export const useExplore = (currentUserId: string) => {
  const [groupsNotJoined, setGroupsNotJoined] = useState<Group[]>([]);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const getUserDisplayName = async () => {
    const name = await AsyncStorage.getItem("displayName");
    setDisplayName(name);
  };

  const fetchGroups = useCallback(
    async (newPage = 1, append = false) => {
      if (newPage > totalPages && totalPages !== 0) return;

      setLoading(!append);
      setIsLoadingMore(append);

      try {
        const userSpecificClient = restClient.apiClient.service(`apis/users/${currentUserId}/not-joined-groups`);

        const response = await userSpecificClient.find({
          page: newPage,
          limit: 5, // Phù hợp với backend
        });

        if (response.success) {
          const validGroups = (response.data || []).filter(
            (group: Group) => group && group._id
          );
          setGroupsNotJoined((prev) => (append ? [...prev, ...validGroups] : validGroups));
          setTotalPages(response.totalPages || 1);
          setPage(newPage);
        } else {
          setError("Không thể lấy danh sách nhóm chưa tham gia.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy nhóm chưa tham gia:", error);
        setError("Có lỗi xảy ra khi lấy dữ liệu.");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [currentUserId, totalPages]
  );

  const loadMoreGroups = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      fetchGroups(page + 1, true);
    }
  }, [page, totalPages, isLoadingMore, fetchGroups]);

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await groupsClient.patch(`${groupId}/join`, { userId: currentUserId });
      if (response.success) {
        const joinedGroup = groupsNotJoined.find((group) => group._id === groupId);
        if (joinedGroup) {
          if (currentUserId !== joinedGroup.idCreater) {
            try {
              await notificationsClient.create({
                senderId: currentUserId,
                receiverId: joinedGroup.idCreater,
                message: `${displayName || "Một người dùng"} đã gửi yêu cầu tham gia nhóm ${joinedGroup.groupName}`,
                status: "unread",
              });
            } catch (notificationError) {
              console.error("🔴 Lỗi khi gửi thông báo tới chủ nhóm:", notificationError);
            }
          }

          if (joinedGroup.Administrators) {
            for (const admin of joinedGroup.Administrators) {
              if (admin.state === "accepted" && currentUserId !== admin.idUser._id) {
                try {
                  await notificationsClient.create({
                    senderId: currentUserId,
                    receiverId: admin.idUser._id,
                    message: `${displayName || "Một người dùng"} đã gửi yêu cầu tham gia nhóm ${joinedGroup.groupName}`,
                    status: "unread",
                  });
                } catch (notificationError) {
                  console.error(`🔴 Lỗi khi gửi thông báo tới quản trị viên ${admin.idUser._id}:`, notificationError);
                }
              }
            }
          }
        }

        fetchGroups(1); // Làm mới danh sách nhóm từ trang 1
      } else {
        console.error("Lỗi khi gửi yêu cầu tham gia nhóm:", response.messages);
      }
    } catch (error) {
      console.error("Lỗi khi tham gia nhóm:", error);
    }
  };

  useEffect(() => {
    getUserDisplayName();
    fetchGroups();
  }, [currentUserId, fetchGroups]);

  return {
    groupsNotJoined,
    loading,
    error,
    handleJoinGroup,
    loadMoreGroups,
    isLoadingMore,
    fetchGroups,
  };
};