// useExploreGroups.ts
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import restClient from "@/src/shared/services/RestClient";
import { Group } from "@/src/features/newfeeds/interface/article";

const usersClient = restClient.apiClient.service("apis/users");
const groupsClient = restClient.apiClient.service("apis/groups");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export const useExplore = (currentUserId: string) => {
  const [groupsNotJoined, setGroupsNotJoined] = useState<Group[]>([]);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getUserDisplayName = async () => {
    const name = await AsyncStorage.getItem("displayName");
    setDisplayName(name);
  };

  useEffect(() => {
    getUserDisplayName(); // Lấy displayName khi mount
    fetchGroups();
  }, [currentUserId]);

  const fetchGroups = async () => {
    try {
      const response = await usersClient.get(`${currentUserId}/not-joined-groups`);
      if (response.success) {
        setGroupsNotJoined(response.data);
      } else {
        setError("Không thể lấy danh sách nhóm chưa tham gia.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API lấy nhóm chưa tham gia:", error);
      setError("Có lỗi xảy ra khi lấy dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await groupsClient.patch(`${groupId}/join`, { userId: currentUserId });
      if (response.success) {
        const joinedGroup = groupsNotJoined.find((group) => group._id === groupId);
        if (joinedGroup) {
          if (currentUserId !== joinedGroup.idCreater._id) {
            try {
              await notificationsClient.create({
                senderId: currentUserId,
                receiverId: joinedGroup.idCreater._id,
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

        fetchGroups(); // Fetch lại danh sách nhóm sau khi tham gia
      } else {
        console.error("Lỗi khi gửi yêu cầu tham gia nhóm:", response.messages);
      }
    } catch (error) {
      console.error("Lỗi khi tham gia nhóm:", error);
    }
  };

  return { groupsNotJoined, loading, error, handleJoinGroup };
};