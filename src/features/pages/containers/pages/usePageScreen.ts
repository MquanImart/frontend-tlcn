// usePageScreen.tsx
import { useState, useEffect, useCallback } from "react";
import { MyPhoto, Page, Address } from "@/src/interface/interface_reference";
import restClient from "@/src/shared/services/RestClient";
import { showActionSheet } from "@/src/shared/components/showActionSheet/showActionSheet";
import { Alert } from "react-native";
import { getUserRole } from "../../utils/test";
import { NavigationProp } from "@react-navigation/native"; 
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

const myPhotosClient = restClient.apiClient.service("apis/myphotos");
const addressesClient = restClient.apiClient.service("apis/addresses");
const pagesClient = restClient.apiClient.service("apis/pages");
const notificationsClient = restClient.apiClient.service("apis/notifications");

type NavigationPropType = NavigationProp<ExploreStackParamList>; 

const usePageScreen = (pageId: string, navigation: NavigationPropType) => {
  const [currentUserId, setCurrentUserId] = useState<string | null> (null);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("Trang chủ");
  const [avatar, setAvatar] = useState<MyPhoto | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string | null>(null);


  const getUserId = async () => {
    const id = await AsyncStorage.getItem("userId");
    const name = await AsyncStorage.getItem("displayName");
    setCurrentUserId(id);
    setCurrentUserDisplayName(name); // Lưu displayName
  };

  useEffect(() => {
    if (currentUserId){
      fetchPage()
    }
  }, [currentUserId]);

  const role = page ? getUserRole(page, currentUserId || "") : "isViewer";
  const pendingInvites = page?.listAdmin?.filter(
    (admin) => admin.state === "pending" && admin.idUser === currentUserId
  ) || [];

  const fetchPage = useCallback(async () => {
    try {
      const response = await pagesClient.get(pageId);
      if (response.success) {
        setPage(response.data);
        fetchAvatar(response.data.avt || "");
        fetchAddress(response.data.address || "");
        setError(null);
      } else {
        setError(response.messages || "Không thể tải trang");
      }
    } catch (err) {
      setError("Lỗi khi lấy dữ liệu trang");
      console.error("❌ API Error:", err);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const fetchAvatar = async (avatarId: string) => {
    try {
      const response = await myPhotosClient.get(avatarId);
      if (response.success) {
        setAvatar(response.data);
      } else {
        setAvatar(null);
      }
    } catch (err) {
      setError("Lỗi khi lấy dữ liệu ảnh đại diện");
    }
  };

  const fetchAddress = async (addressId: string) => {
    try {
      const response = await addressesClient.get(addressId);
      if (response.success) {
        setAddress(response.data);
      } else {
        setAddress(null);
      }
    } catch (err) {
      setError("Lỗi khi lấy dữ liệu địa chỉ");
    }
  };

  const leaveGroup = async (userId: string) => {
    const isPendingAdmin = page?.listAdmin?.some((admin) => admin.idUser === userId && admin.state === "pending");
    await pagesClient.patch(`${page?._id}`, {
      follower: page?.follower?.filter((followerId) => followerId !== userId),
    });
    if (isPendingAdmin) {
      await pagesClient.patch(`${page?._id}`, {
        listAdmin: page?.listAdmin?.filter((admin) => admin.idUser !== userId),
      });
    }
    fetchPage();
  };

  const deleteRightAdmin = async (userId: string) => {
    const isAcceptedAdmin = page?.listAdmin?.some((admin) => admin.idUser === userId && admin.state === "accepted");
    if (isAcceptedAdmin) {
      await pagesClient.patch(`${page?._id}`, {
        listAdmin: page?.listAdmin?.filter((admin) => admin.idUser !== userId),
      });
      addFollower(userId);
      fetchPage();
    }
  };

  const addFollower = async (userId: string) => {
    try {
      const updatedFollowers = [...(page?.follower ?? []), userId];
      const response = await pagesClient.patch(`${page?._id}`, {
        follower: updatedFollowers,
      });
      if (response.success) {
        Alert.alert("Thành công", "Đã thêm bạn vào danh sách người theo dõi.");
        fetchPage();
      } else {
        console.error("❌ Lỗi khi thêm vào người theo dõi", response.message);
      }
    } catch (error) {
      console.error("❌ Lỗi khi thêm vào người theo dõi:", error);
    }
  };

  const acceptAdminInvite = async (userId: string) => {
    try {
      const updatedAdmins = page?.listAdmin?.map((admin) =>
        admin.idUser === userId && admin.state === "pending"
          ? { ...admin, state: "accepted" }
          : admin
      );
      const response = await pagesClient.patch(`${page?._id}`, {
        listAdmin: updatedAdmins,
        follower: page?.follower?.filter((followerId) => followerId !== userId),
      });
      if (response.success) {
        if (page?.idCreater && page.idCreater !== currentUserId) {
          try {
            await notificationsClient.create({
              senderId: currentUserId || "", 
              receiverId: page.idCreater,
              message: `đã chấp nhận lời mời làm quản trị viên của trang ${page.name}`,
              status: "unread",
            });
          } catch (notificationError) {
            console.error("🔴 Lỗi khi gửi thông báo chấp nhận lời mời quản trị viên:", notificationError);
          }
        }

        Alert.alert("Thành công", "Bạn đã chấp nhận lời mời làm quản trị viên.");
        setModalVisible(false);
        fetchPage();
      }
    } catch (error) {
      console.error("❌ Lỗi khi chấp nhận lời mời:", error);
    }
  };

  const declineAdminInvite = async (userId: string) => {
    try {
      const updatedAdmins = page?.listAdmin?.filter(
        (admin) => !(admin.idUser === userId && admin.state === "pending")
      );
      const response = await pagesClient.patch(`${page?._id}`, {
        listAdmin: updatedAdmins,
      });
      if (response.success) {
        Alert.alert("Thành công", "Bạn đã từ chối lời mời làm quản trị viên.");
        setModalVisible(false);
        fetchPage();
      }
    } catch (error) {
      console.error("❌ Lỗi khi từ chối lời mời:", error);
    }
  };

  const handleShowInvites = () => {
    if (pendingInvites.length > 0) {
      setModalVisible(true);
    } else {
      Alert.alert("Thông báo", "Bạn không có lời mời làm quản trị viên.");
    }
  };

  const handleMorePress = () => {
    const options = [];

    if (role === "isOwner" && page) {
      options.push({
        label: "Chỉnh sửa trang",
        onPress: () => navigation.navigate("EditPage", { page }), 
      });
    }

    if (role === "isViewer") {
      options.push({
        label: "Theo dõi",
        onPress: () => addFollower(currentUserId || ""),
      });
    }

    if (role === "isFollower") {
      options.push({
        label: "Rời khỏi nhóm",
        onPress: () => leaveGroup(currentUserId || ""),
        destructive: true,
      });

      if (pendingInvites.length > 0) {
        options.push({
          label: "Xem lời mời quản trị viên",
          onPress: () => handleShowInvites(),
        });
      }
    }

    if (role === "isAdmin") {
      options.push({
        label: "Xóa quyền quản trị viên",
        onPress: () => {
          deleteRightAdmin(currentUserId || "");
          Alert.alert("Thành công", "Đã xóa quyền quản trị viên.");
        },
      });
    }

    if (options.length > 0) {
      showActionSheet(options);
    }
  };

  const getTabs = (role: string) => {
    const ownerTabs = [
      { label: "Trang chủ", icon: "home" },
      { label: "Bài viết", icon: "article" },
      { label: "Quản lý lời mời", icon: "admin-panel-settings" },
      { label: "Quản trị viên", icon: "admin-panel-settings" },
      { label: "Vé", icon: "confirmation-number" },
    ];

    const nonOwnerTabs = [
      { label: "Trang chủ", icon: "home" },
      { label: "Bài viết", icon: "article" },
      { label: "Quản trị viên", icon: "admin-panel-settings" },
      { label: "Vé", icon: "confirmation-number" },
    ];

    return role === "isOwner" ? ownerTabs : nonOwnerTabs;
  };

  const filteredTabs = getTabs(role);

  return {
    page,
    loading,
    error,
    selectedTab,
    setSelectedTab,
    filteredTabs,
    fetchPage,
    role,
    avatar,
    address,
    modalVisible,
    setModalVisible,
    handleMorePress,
    pendingInvites,
    acceptAdminInvite,
    declineAdminInvite,
    getUserId,
    currentUserId, setCurrentUserId
  };
};

export default usePageScreen;