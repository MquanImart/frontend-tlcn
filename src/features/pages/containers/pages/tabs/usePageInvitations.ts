import { useState, useEffect } from "react";
import restClient from "@/src/shared/services/RestClient";
import { User, Page } from "@/src/interface/interface_reference";

const usersClient = restClient.apiClient.service("apis/users");
const pagesClient = restClient.apiClient.service("apis/pages");
const myphotosClient = restClient.apiClient.service("apis/myphotos");
const DEFAULT_AVATAR = "https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png";

interface UserWithAvatar extends User {
  avatarUrl: string;
}

const usePageInvitations = (page: Page, updatePage: () => void) => {
  const [pendingAdmins, setPendingAdmins] = useState<UserWithAvatar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  const fetchPendingAdmins = async () => {
    try {
      const pendingResponses = await Promise.all(
        (page.listAdmin?.filter((admin) => admin.state === "pending") || []).map(async (admin) => {
          const response = await usersClient.get(admin.idUser);
          if (response.success) {
            const userData = response.data;
            const avatarUrl = await fetchAvatarUrl(userData.avt[userData.avt.length - 1]);
            return { ...userData, avatarUrl };
          }
          return null;
        })
      );
      setPendingAdmins(pendingResponses.filter((user) => user !== null));
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu lời mời:", error);
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
        setPendingAdmins((prevState) => prevState.filter((admin) => admin._id !== userId));
      } else {
        console.error("❌ Lỗi khi xóa quản trị viên");
      }
    } catch (error) {
      console.error("❌ Lỗi khi xóa quản trị viên:", error);
    }
  };

  useEffect(() => {
    fetchPendingAdmins();
  }, [page]);

  return {
    pendingAdmins,
    loading,
    handleRemoveAdmin,
  };
};

export default usePageInvitations;