import { useState, useEffect } from "react";
import { Alert } from "react-native";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const groupsClient = restClient.apiClient.service("apis/groups");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export const useGroupJoinRequests = (groupId: string) => {
  const [searchText, setSearchText] = useState("");
  const [memberRequests, setMemberRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string | null>(null); // Thêm state cho displayName của người duyệt

  const getCurrentUserDisplayName = async () => {
    const name = await AsyncStorage.getItem("displayName");
    setCurrentUserDisplayName(name);
  };

  const fetchPendingMembers = async () => {
    setLoading(true);
    try {
      const response = await groupsClient.get(`${groupId}/pending-members`);
      if (response.success) {
        const formattedData = response.data.map((member: any) => ({
          ...member,
          joinDate: new Date(member.joinDate).toLocaleDateString("vi-VN"),
        }));
        setMemberRequests(formattedData);
      } else {
        setMemberRequests([]);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách yêu cầu:", error);
      setMemberRequests([]);
    } finally {
      setLoading(false);
    }
  };

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
              message: `${currentUserDisplayName || "Quản trị viên"} đã chấp nhận bạn vào ${groupName}`,
              status: "unread",
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
    updateMemberStatus(id, "accepted");
  };

  const handleReject = async (id: string) => {
    updateMemberStatus(id, "rejected");
  };

  const filteredRequests = memberRequests.filter((member) =>
    member.fullName.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    getCurrentUserDisplayName(); 
    if (groupId) {
      fetchPendingMembers();
    }
  }, [groupId]);

  return {
    searchText,
    setSearchText,
    loading,
    filteredRequests,
    handleAccept,
    handleReject,
  };
};