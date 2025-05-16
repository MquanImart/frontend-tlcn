import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

const groupsClient = restClient.apiClient.service("apis/groups");
const notificationsClient = restClient.apiClient.service("apis/notifications");

interface Member {
  id: string;
  name: string;
  avatar: string;
  description?: string;
}

export const useGroupMembers = (groupId: string, currentUserId: string, role: "Guest" | "Member" | "Admin" | "Owner") => {
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState<{ idCreater: Member; Administrators: Member[]; members: Member[] } | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null); // Thêm state cho displayName của người gửi

  const getUserDisplayName = async () => {
    const name = await AsyncStorage.getItem("displayName");
    setDisplayName(name);
  };

  const fetchGroupMembers = async () => {
    setLoading(true);
    try {
      const response = await groupsClient.get(`${groupId}/members`);
      if (response.success) {
        setGroupData(response.data);
      } else {
        setGroupData(null);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách thành viên:", error);
      setGroupData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemberStatus = async (userId: string, state: "accepted" | "rejected" | "invite-admin" | "remove-admin" | "accept-admin") => {
    try {
      const response = await groupsClient.patch(`${groupId}/members/${userId}`, { state });
      if (response.success) {
        // Gửi thông báo khi mời làm quản trị viên
        if (state === "invite-admin" && userId !== currentUserId) {
          try {
            const groupName = groupData?.idCreater ? "nhóm này" : "nhóm"; // Giả định có thể lấy tên nhóm từ dữ liệu
            await notificationsClient.create({
              senderId: currentUserId,
              receiverId: userId,
              message: `đã mời bạn làm quản trị viên của ${groupName}`,
              status: "unread",
            });
          } catch (notificationError) {
            console.error("🔴 Lỗi khi gửi thông báo mời làm quản trị viên:", notificationError);
          }
        }

        Alert.alert("Thành công", `Thành viên đã được cập nhật trạng thái: ${state}`);
        fetchGroupMembers(); 
      } else {
        Alert.alert("Lỗi", response.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật trạng thái thành viên:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái thành viên");
    }
  };

  const handleLongPress = (userId: string, section: string) => {
    if (role === "Owner") {
      if (section === "Quản trị viên" && userId !== groupData?.idCreater.id) {
        return [
          {
            label: "Xóa Quản Trị Viên",
            onPress: () => handleUpdateMemberStatus(userId, "remove-admin"),
            destructive: true,
          },
        ];
      } else if (section === "Thành viên khác") {
        return [
          { label: "Mời làm quản trị viên", onPress: () => handleUpdateMemberStatus(userId, "invite-admin") },
          {
            label: "Xóa khỏi nhóm",
            onPress: () => handleUpdateMemberStatus(userId, "rejected"),
            destructive: true,
          },
        ];
      }
    } else if (role === "Admin" && section === "Thành viên khác") {
      return [
        {
          label: "Xóa khỏi nhóm",
          onPress: () => handleUpdateMemberStatus(userId, "rejected"),
          destructive: true,
        },
      ];
    }
    return [];
  };

  useEffect(() => {
    getUserDisplayName(); // Lấy displayName khi mount
    if (groupId) {
      fetchGroupMembers();
    }
  }, [groupId]);

  return {
    loading,
    groupData,
    handleUpdateMemberStatus,
    handleLongPress,
  };
};