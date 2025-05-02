import { useState, useEffect } from "react";
import { User, Page } from "@/src/interface/interface_reference";
import restClient from "@/src/shared/services/RestClient";
import { showActionSheet } from "@/src/shared/components/showActionSheet/showActionSheet";
import AsyncStorage from "@react-native-async-storage/async-storage";

const usersClient = restClient.apiClient.service("apis/users");
const pagesClient = restClient.apiClient.service("apis/pages");
const myphotosClient = restClient.apiClient.service("apis/myphotos");
const notificationsClient = restClient.apiClient.service("apis/notifications");
const DEFAULT_AVATAR = "https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png";

interface UserWithAvatar extends User {
  avatarUrl: string;
}

const usePageMembers = (page: Page, role: string, updatePage: () => void) => {
  const [owner, setOwner] = useState<UserWithAvatar | null>(null);
  const [admins, setAdmins] = useState<UserWithAvatar[]>([]);
  const [followers, setFollowers] = useState<UserWithAvatar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); 
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string | null>(null);

  const getCurrentUserInfo = async () => {
    const id = await AsyncStorage.getItem("userId");
    const name = await AsyncStorage.getItem("displayName");
    setCurrentUserId(id);
    setCurrentUserDisplayName(name);
  };

  const fetchAvatarUrl = async (photoId: string) => {
    try {
      const response = await myphotosClient.get(photoId);
      if (response.success && response.data) {
        return response.data.url;
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu ảnh:", error);
    }
    return DEFAULT_AVATAR;
  };

  const fetchMembers = async () => {
    try {
      const ownerResponse = await usersClient.get(page.idCreater);
      const ownerData = ownerResponse.success ? ownerResponse.data : null;
      if (ownerData) {
        const avatarUrl = await fetchAvatarUrl(ownerData.avt[ownerData.avt.length - 1]);
        setOwner({ ...ownerData, avatarUrl });
      }

      const adminResponses = await Promise.all(
        (page.listAdmin?.filter((admin) => admin.state === "accepted") || []).map(async (admin) => {
          const response = await usersClient.get(admin.idUser);
          if (response.success) {
            const userData = response.data;
            const avatarUrl = await fetchAvatarUrl(userData.avt[userData.avt.length - 1]);
            return { ...userData, avatarUrl };
          }
          return null;
        })
      );
      setAdmins(adminResponses.filter((user) => user !== null));

      const followerResponses = await Promise.all(
        (page.follower || []).map(async (followerId) => {
          const response = await usersClient.get(followerId);
          if (response.success) {
            const userData = response.data;
            const avatarUrl = await fetchAvatarUrl(userData.avt[userData.avt.length - 1]);
            return { ...userData, avatarUrl };
          }
          return null;
        })
      );
      setFollowers(followerResponses.filter((user) => user !== null));
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu thành viên:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      const response = await pagesClient.patch(`${page._id}`, {
        listAdmin: page.listAdmin?.filter((admin) => admin.idUser !== userId),
      });

      if (response.success) {
        setAdmins((prevState) => prevState.filter((admin) => admin._id !== userId));
      } else {
        console.error("❌ Lỗi khi xóa quản trị viên");
      }
    } catch (error) {
      console.error("❌ Lỗi khi xóa quản trị viên:", error);
    }
  };

  const handleInviteAdmin = async (userId: string) => {
    try {
      const response = await pagesClient.patch(`${page._id}`, {
        listAdmin: [
          ...(page.listAdmin || []),
          { idUser: userId, state: "pending", joinDate: new Date().getTime() },
        ],
      });

      if (response.success) {
        if (userId !== currentUserId) {
          try {
            await notificationsClient.create({
              senderId: currentUserId || "", 
              receiverId: userId,
              message: `${currentUserDisplayName || "Quản trị viên"} đã mời bạn làm quản trị viên của trang ${page.name}`,
              status: "unread",
            });
          } catch (notificationError) {
            console.error("🔴 Lỗi khi gửi thông báo mời làm quản trị viên:", notificationError);
          }
        }

        updatePage();
      } else {
        console.error("❌ Lỗi khi mời làm quản trị viên");
      }
    } catch (error) {
      console.error("❌ Lỗi khi mời làm quản trị viên:", error);
    }
  };

  const handleRemoveFollower = async (userId: string) => {
    try {
      const isPendingAdmin = page.listAdmin?.some((admin) => admin.idUser === userId && admin.state === "pending");
      if (isPendingAdmin) {
        handleRemoveAdmin(userId);
      }

      const response = await pagesClient.patch(`${page._id}`, {
        follower: page.follower?.filter((followerId) => followerId !== userId),
      });

      if (response.success) {
        updatePage();
      } else {
        console.error("❌ Lỗi khi xóa khỏi danh sách người theo dõi");
      }
    } catch (error) {
      console.error("❌ Lỗi khi xóa khỏi danh sách người theo dõi:", error);
    }
  };

  const handleLongPress = (userId: string, section: string) => {
    const actions: any[] = [];

    if (role === "isOwner") {
      if (section === "Quản trị viên" && userId !== page.idCreater) {
        actions.push({
          label: "Xóa Quản Trị Viên",
          onPress: () => handleRemoveAdmin(userId),
          destructive: true,
        });
      }

      if (section === "Người theo dõi") {
        actions.push(
          { label: "Mời làm quản trị viên", onPress: () => handleInviteAdmin(userId) },
          {
            label: "Xóa khỏi danh sách",
            onPress: () => handleRemoveFollower(userId),
            destructive: true,
          }
        );
      }
    } else if (role === "isAdmin") {
      if (section === "Người theo dõi") {
        actions.push(
          { label: "Mời làm quản trị viên", onPress: () => handleInviteAdmin(userId) },
          {
            label: "Xóa khỏi danh sách",
            onPress: () => handleRemoveFollower(userId),
            destructive: true,
          }
        );
      }
    }

    if (actions.length > 0) {
      showActionSheet(actions);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page]);

  return {
    owner,
    admins,
    followers,
    loading,
    handleRemoveAdmin,
    handleInviteAdmin,
    handleRemoveFollower,
    handleLongPress
  };
};

export default usePageMembers;
