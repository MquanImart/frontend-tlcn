import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

const groupsClient = restClient.apiClient.service("apis/groups");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export const useGroupJoinRequests = (groupId: string) => {
  const [searchText, setSearchText] = useState("");
  const [memberRequests, setMemberRequests] = useState<any[]>([]);
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

  const fetchPendingMembers = useCallback(
    async (newPage = 1, append = false) => {
      if (newPage > totalPages && totalPages !== 0) return;

      setLoading(!append);
      setIsLoadingMore(append);
      setError(null);

      try {
        const groupSpecificClient = restClient.apiClient.service(`apis/groups/${groupId}/pending-members`);

        const response = await groupSpecificClient.find({
          page: newPage,
          limit: 5, // Phù hợp với backend
        });

        if (response.success) {
          const formattedData = (response.data || []).map((member: any) => ({
            ...member,
            joinDate: new Date(member.joinDate).toLocaleDateString("vi-VN"),
          }));
          setMemberRequests((prev) => (append ? [...prev, ...formattedData] : formattedData));
          setTotalPages(response.totalPages || 1);
          setPage(newPage);
        } else {
          setError(response.message || "Không thể lấy danh sách yêu cầu.");
          setMemberRequests([]);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách yêu cầu:", error);
        setError("Có lỗi xảy ra khi lấy danh sách yêu cầu.");
        setMemberRequests([]);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [groupId, totalPages]
  );

  const loadMoreRequests = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      fetchPendingMembers(page + 1, true);
    }
  }, [page, totalPages, isLoadingMore, fetchPendingMembers]);

  const updateMemberStatus = async (id: string, state: "accepted" | "rejected") => {
    try {
      const response = await groupsClient.patch(`${groupId}/members/${id}`, { state });

      if (response.success) {
        if (state === "accepted") {
          try {
            const acceptedMember = memberRequests.find((member) => member.id === id);
            const groupName = response.data.groupName || "nhóm";
            await notificationsClient.create({
              senderId: await AsyncStorage.getItem("userId"),
              receiverId: id,
              message: `đã chấp nhận bạn vào ${groupName}`,
              status: "unread",
              groupId: groupId,
              relatedEntityType: "Group",
            });
          } catch (notificationError) {
            console.error("🔴 Lỗi khi gửi thông báo chấp nhận thành viên:", notificationError);
          }
        }

        Alert.alert("Thành công", state === "accepted" ? "Thành viên đã được chấp nhận!" : "Thành viên đã bị từ chối!");
        setMemberRequests((prev) => prev.filter((member) => member.id !== id));
      } else {
        throw new Error(response.message || "Cập nhật thất bại!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật trạng thái:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái, vui lòng thử lại!");
    }
  };

  const handleAccept = async (id: string) => {
    await updateMemberStatus(id, "accepted");
  };

  const handleReject = async (id: string) => {
    await updateMemberStatus(id, "rejected");
  };

  const filteredRequests = memberRequests.filter((member) =>
    member.fullName.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    getCurrentUserDisplayName();
    if (groupId) {
      fetchPendingMembers();
    }
  }, [groupId, fetchPendingMembers]);

  return {
    searchText,
    setSearchText,
    loading,
    error,
    filteredRequests,
    handleAccept,
    handleReject,
    loadMoreRequests,
    isLoadingMore,
    fetchPendingMembers,
  };
};