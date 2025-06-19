// @/src/features/group/hooks/useExplore.ts

import { Group } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState, useRef } from "react"; // Thêm useRef
import { Alert } from 'react-native';

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

  // Sử dụng useRef để lưu trữ giá trị totalPages và isLoadingMore mới nhất
  // mà không cần đưa chúng vào dependencies của useCallback
  const totalPagesRef = useRef(totalPages);
  const isLoadingMoreRef = useRef(isLoadingMore);

  // Cập nhật giá trị ref mỗi khi state thay đổi
  useEffect(() => {
    totalPagesRef.current = totalPages;
    isLoadingMoreRef.current = isLoadingMore;
  }, [totalPages, isLoadingMore]);


  const getUserDisplayName = async () => {
    const name = await AsyncStorage.getItem("displayName");
    setDisplayName(name);
  };

  const fetchGroups = useCallback(
    async (newPage = 1, append = false) => {
      // Sử dụng giá trị từ ref thay vì state trực tiếp
      if (isLoadingMoreRef.current && append) {
        console.log("Đang tải thêm, bỏ qua fetch mới.");
        return;
      }
      if (append && totalPagesRef.current !== 0 && newPage > totalPagesRef.current) {
        console.log(`Đã hết trang. Hiện tại: ${newPage -1}/${totalPagesRef.current}`);
        return;
      }

      console.log(`Fetching groups: Page ${newPage}, Append: ${append}`);

      if (!append) { // Nếu không phải append, tức là load mới hoàn toàn
        setLoading(true);
      } else { // Nếu là append, tức là load thêm
        setIsLoadingMore(true);
      }
      setError(null); // Reset lỗi mỗi khi fetch mới

      try {
        const userSpecificClient = restClient.apiClient.service(`apis/users/${currentUserId}/not-joined-groups`);

        const response = await userSpecificClient.find({
          page: newPage,
          limit: 5,
          currentUserId: currentUserId,
        });

        if (response.success) {
          const fetchedGroups = (response.data || []).filter(
            (group: Group) => group && group._id
          );

          setGroupsNotJoined(prevGroups => {
            let combinedGroups = append ? [...prevGroups, ...fetchedGroups] : fetchedGroups;

            // Khử trùng lặp cuối cùng
            const uniqueGroupMap = new Map();
            combinedGroups.forEach((group: Group) => {
              uniqueGroupMap.set(group._id, group);
            });
            return Array.from(uniqueGroupMap.values());
          });

          setTotalPages(response.totalPages || 1);
          setPage(newPage);
        } else {
          setError("Không thể lấy danh sách nhóm chưa tham gia.");
        }
      } catch (error: any) { // Thêm kiểu any để tránh lỗi TypeScript
        console.error("Lỗi khi gọi API lấy nhóm chưa tham gia:", error);
        setError("Có lỗi xảy ra khi lấy dữ liệu: " + error.message); // Hiển thị thông báo lỗi chi tiết
      } finally {
        if (!append) {
          setLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    // Rất quan trọng: Chỉ giữ currentUserId trong dependencies.
    // totalPages và isLoadingMore được truy cập qua ref.
    [currentUserId]
  );

  const loadMoreGroups = useCallback(() => {
    // Sử dụng giá trị từ ref thay vì state trực tiếp
    if (!isLoadingMoreRef.current && page < totalPagesRef.current) {
      fetchGroups(page + 1, true);
    }
  }, [page, fetchGroups]); 


  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await groupsClient.patch(`${groupId}/join`, { userId: currentUserId });
      if (response.success) {
        // Find the group in the current state to get its details for notifications
        const joinedGroup = groupsNotJoined.find((group) => group._id === groupId);
        if (joinedGroup) {
          // Notify creator
          if (currentUserId !== joinedGroup.idCreater) {
            try {
              await notificationsClient.create({
                senderId: currentUserId,
                receiverId: joinedGroup.idCreater,
                message: `đã gửi yêu cầu tham gia nhóm ${joinedGroup.groupName}`,
                status: "unread",
                groupId: groupId,
                relatedEntityType: "Group",
              });
            } catch (notificationError) {
              console.error("🔴 Lỗi khi gửi thông báo tới chủ nhóm:", notificationError);
            }
          }
          // Notify administrators
          if (joinedGroup.Administrators) {
            for (const admin of joinedGroup.Administrators) {
              if (admin.state === "accepted" && currentUserId !== admin.idUser._id) {
                try {
                  await notificationsClient.create({
                    senderId: currentUserId,
                    receiverId: admin.idUser._id,
                    message: `đã gửi yêu cầu tham gia nhóm ${joinedGroup.groupName}`,
                    status: "unread",
                    groupId: groupId,
                    relatedEntityType: "Group",
                  });
                } catch (notificationError) {
                  console.error(`🔴 Lỗi khi gửi thông báo tới quản trị viên ${admin.idUser._id}:`, notificationError);
                }
              }
            }
          }
        }

        Alert.alert("Thành công", "Yêu cầu tham gia nhóm đã được gửi!");
        fetchGroups(1); // Refresh the list from page 1 to show updated status
      } else {
        Alert.alert("Lỗi", response.messages || "Không thể gửi yêu cầu tham gia nhóm.");
        console.error("Lỗi khi gửi yêu cầu tham gia nhóm:", response.messages);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi tham gia nhóm.");
      console.error("Lỗi khi tham gia nhóm:", error);
    }
  };

  const handleCancelJoinRequest = async (groupId: string) => {
    try {
      const response = await groupsClient.patch(`${groupId}/members/${currentUserId}`, { state: "rejected" });

      if (response.success) {
        Alert.alert("Thành công", "Yêu cầu tham gia đã được hủy.");
        fetchGroups(1); // Refresh the list
      } else {
        Alert.alert("Lỗi", response.message || "Không thể hủy yêu cầu tham gia nhóm.");
        console.error("Lỗi khi hủy yêu cầu tham gia nhóm:", response.message);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi hủy yêu cầu.");
      console.error("Lỗi khi hủy yêu cầu tham gia nhóm:", error);
    }
  };

  useEffect(() => {
    getUserDisplayName();
    fetchGroups();
  }, [currentUserId, fetchGroups]); // fetchGroups là ổn định, chỉ thay đổi khi currentUserId thay đổi

  return {
    groupsNotJoined,
    loading,
    error,
    handleJoinGroup,
    loadMoreGroups,
    isLoadingMore,
    fetchGroups,
    handleCancelJoinRequest,
  };
};