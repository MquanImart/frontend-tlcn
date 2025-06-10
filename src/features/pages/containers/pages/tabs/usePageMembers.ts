import { Page, User } from "@/src/interface/interface_reference";
import { showActionSheet } from "@/src/shared/components/showActionSheet/showActionSheet";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

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
    try {
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("displayName");
      setCurrentUserId(id);
      setCurrentUserDisplayName(name);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchAvatarUrl = async (photoId: string) => {
    try {
      const response = await myphotosClient.get(photoId);
      if (response.success && response.data) {
        return response.data.url;
      }
    } catch (error) {
      console.error("❌ Error fetching avatar:", error);
    }
    return DEFAULT_AVATAR;
  };

  const fetchMembers = async () => {
    try {
      const ownerResponse = await usersClient.get(page.idCreater);
      const ownerData = ownerResponse.success ? ownerResponse.data : null;
      if (ownerData) {
        const avatarUrl = ownerData.avt?.length
          ? await fetchAvatarUrl(ownerData.avt[ownerData.avt.length - 1])
          : DEFAULT_AVATAR;
        setOwner({ ...ownerData, avatarUrl });
      }

      const adminResponses = await Promise.all(
        (page.listAdmin?.filter((admin) => admin.state === "accepted") || []).map(async (admin) => {
          const response = await usersClient.get(admin.idUser);
          if (response.success) {
            const userData = response.data;
            const avatarUrl = userData.avt?.length
              ? await fetchAvatarUrl(userData.avt[userData.avt.length - 1])
              : DEFAULT_AVATAR;
            return { ...userData, avatarUrl };
          }
          return null;
        })
      );
      setAdmins(adminResponses.filter((user): user is UserWithAvatar => user !== null));

      const followerResponses = await Promise.all(
        (page.follower || []).map(async (followerId) => {
          const response = await usersClient.get(followerId);
          if (response.success) {
            const userData = response.data;
            const avatarUrl = userData.avt?.length
              ? await fetchAvatarUrl(userData.avt[userData.avt.length - 1])
              : DEFAULT_AVATAR;
            return { ...userData, avatarUrl };
          }
          return null;
        })
      );
      setFollowers(followerResponses.filter((user): user is UserWithAvatar => user !== null));
    } catch (error) {
      console.error("❌ Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      const response = await pagesClient.patch(`${page._id}`, {
        removeAdmin: userId,
        addFollower: userId,
      });

      if (response.success) {
        setAdmins((prev) => prev.filter((admin) => admin._id !== userId));
        setFollowers((prev) => {
          const admin = admins.find((a) => a._id === userId);
          return admin ? [...prev, admin] : prev;
        });
        updatePage();
        Alert.alert("Thành công", "Đã xóa quyền quản trị viên.");
      } else {
        Alert.alert("Lỗi", response.message || "Không thể xóa quản trị viên.");
        console.error("❌ Error removing admin:", response.message);
      }
    } catch (error) {
      console.error("❌ Error removing admin:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi xóa quản trị viên.");
    }
  };

  const handleInviteAdmin = async (userId: string) => {
    try {
      const response = await pagesClient.patch(`${page._id}`, {
        addAdmin: {
          idUser: userId,
          state: "pending",
          joinDate: Date.now(),
        },
      });

      if (response.success) {
        if (userId !== currentUserId) {
          try {
            await notificationsClient.create({
              senderId: currentUserId || "",
              receiverId: userId,
              message: `${currentUserDisplayName || "Quản trị viên"} đã mời bạn làm quản trị viên của trang ${page.name}`,
              status: "unread",
              pageId: page._id,
              relatedEntityType: "Page",
            });
          } catch (notificationError) {
            console.error("🔴 Error sending admin invite notification:", notificationError);
          }
        }
        updatePage();
        Alert.alert("Thành công", "Đã gửi lời mời làm quản trị viên.");
      } else {
        if (response.message === undefined) {
          Alert.alert("Thông báo", "Đã có lời mời người này làm quản trị viên rồi.");
        } else {
          Alert.alert("Lỗi", response.message || "Không thể mời làm quản trị viên.");
        }
      }
    } catch (error: any) { // Cần cast error sang `any` để truy cập thuộc tính `message`
      if (error.message && error.message.includes("duplicate")) { // Kiểm tra thông báo lỗi từ phía client nếu có
        Alert.alert("Thông báo", "Đã có lời mời người này làm quản trị viên rồi.");
      } else {
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi mời làm quản trị viên.");
      }
    }
  };

  const handleRemoveFollower = async (userId: string) => {
    try {
      const isPendingAdmin = page.listAdmin?.some((admin) => admin.idUser === userId && admin.state === "pending");
      const data: any = { removeFollower: userId };
      if (isPendingAdmin) {
        data.declineAdmin = userId;
      }

      const response = await pagesClient.patch(`${page._id}`, data);

      if (response.success) {
        setFollowers((prev) => prev.filter((f) => f._id !== userId));
        updatePage();
        Alert.alert("Thành công", "Đã xóa khỏi danh sách người theo dõi.");
      } else {
        Alert.alert("Lỗi", response.message || "Không thể xóa người theo dõi.");
        console.error("❌ Error removing follower:", response.message);
      }
    } catch (error) {
      console.error("❌ Error removing follower:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi xóa người theo dõi.");
    }
  };

  const handleLongPress = (userId: string, section: string) => {
    console.log("handleLongPress:", { userId, section, role, creatorId: page.idCreater });
    const actions: { label: string; onPress: () => void; destructive?: boolean }[] = [];

    if (role === "isOwner") {
      if (section === "Quản trị viên" && userId !== page.idCreater) {
        actions.push({
          label: "Xóa Quản Trị Viên",
          onPress: () => handleRemoveAdmin(userId),
          destructive: true,
        });
      } else if (section === "Người theo dõi") {
        actions.push(
          { label: "Mời làm quản trị viên", onPress: () => handleInviteAdmin(userId) },
          {
            label: "Xóa khỏi danh sách",
            onPress: () => handleRemoveFollower(userId),
            destructive: true,
          }
        );
      }
    } else if (role === "isAdmin" && section === "Người theo dõi") {
      actions.push(
        { label: "Mời làm quản trị viên", onPress: () => handleInviteAdmin(userId) },
        {
          label: "Xóa khỏi danh sách",
          onPress: () => handleRemoveFollower(userId),
          destructive: true,
        }
      );
    }

    if (actions.length > 0) {
      console.log("Showing action sheet with actions:", actions.map((a) => a.label));
      showActionSheet(actions);
    } else {
      console.log("No actions available for long-press");
    }
  };

  useEffect(() => {
    getCurrentUserInfo();
    fetchMembers();
  }, [page]);

  return {
    owner,
    admins,
    followers,
    loading,
    handleLongPress,
  };
};

export default usePageMembers;