import { Address, MyPhoto, Page } from "@/src/interface/interface_reference";
import { showActionSheet } from "@/src/shared/components/showActionSheet/showActionSheet";
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { getUserRole } from "../../utils/test";

const myPhotosClient = restClient.apiClient.service("apis/myphotos");
const addressesClient = restClient.apiClient.service("apis/addresses");
const pagesClient = restClient.apiClient.service("apis/pages");
const notificationsClient = restClient.apiClient.service("apis/notifications");
const historyViewPagesClient = restClient.apiClient.service("apis/history-page");

type NavigationPropType = NavigationProp<ExploreStackParamList>;

const usePageScreen = (pageId: string, navigation: NavigationPropType) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("Trang chủ");
  const [avatar, setAvatar] = useState<MyPhoto | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string | null>(null);

  const getUserId = async () => {
    try {
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("displayName");
      setCurrentUserId(id);
      setCurrentUserDisplayName(name);
    } catch (error) {
      console.error("Error fetching userId or displayName:", error);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchPage();
      recordPageView();
    }
  }, [currentUserId, pageId]);

  const role = page ? getUserRole(page, currentUserId || "") : "isViewer";
  const pendingInvites = page?.listAdmin?.filter(
    (admin) => admin.state === "pending" && admin.idUser === currentUserId
  ) || [];

  const fetchPage = async () => {
    try {
      const response = await pagesClient.get(pageId);
      if (response.success) {
        setPage(response.data);
        fetchAvatar(response.data.avt || "");
        fetchAddress(response.data.address || "");
        setError(null);
      } else {
        setError(response.message || "Không thể tải trang");
      }
    } catch (error) {
      setError("Lỗi khi lấy dữ liệu trang");
      console.error("❌ API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const recordPageView = async () => {
    if (!currentUserId || !pageId) {
      console.warn("Không đủ thông tin để ghi lại lịch sử xem trang.");
      return;
    }
    try {
      const historyData = {
        idUser: currentUserId,
        idPage: pageId,
      };
      const response = await historyViewPagesClient.create(historyData);
      if (!response.success) {
        console.error("❌ Lỗi khi ghi lại lịch sử xem trang:", response.message);
      }
    } catch (error) {
      console.error("❌ Lỗi API khi ghi lại lịch sử xem trang:", error);
    }
  };

  useEffect(() => {
    getUserId();
  }, []);

  const fetchAvatar = async (avatarId: string) => {
    try {
      const response = await myPhotosClient.get(avatarId);
      if (response.success) {
        setAvatar(response.data);
      } else {
        setAvatar(null);
      }
    } catch (error) {
      setError("Lỗi khi lấy dữ liệu ảnh đại diện");
      console.error("Error fetching avatar:", error);
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
    } catch (error) {
      setError("Lỗi khi lấy dữ liệu địa chỉ");
      console.error("Error fetching address:", error);
    }
  };

  const addFollower = async (userId: string) => {
    try {
      if (!page?._id || !userId) {
        Alert.alert("Lỗi", "Thiếu thông tin trang hoặc người dùng.");
        return;
      }

      const response = await pagesClient.patch(`${page._id}`, { follower: userId });
      console.log("Add follower response:", response);

      if (response.success) {
        Alert.alert("Thành công", "Đã thêm bạn vào danh sách người theo dõi.");
        fetchPage();
      } else {
        Alert.alert("Lỗi", response.message || "Không thể thêm người theo dõi.");
        console.error("❌ Error adding follower:", response.message);
      }
    } catch (error) {
      console.error("❌ Error adding follower:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi thêm người theo dõi. Vui lòng thử lại.");
    }
  };

  const leaveGroup = async (userId: string) => {
    try {
      if (!page?._id || !userId) {
        Alert.alert("Lỗi", "Thiếu thông tin trang hoặc người dùng.");
        return;
      }

      const isPendingAdmin = page?.listAdmin?.some(
        (admin) => admin.idUser === userId && admin.state === "pending"
      );

      const data: any = { removeFollower: userId };
      if (isPendingAdmin) {
        data.declineAdmin = userId;
      }

      const response = await pagesClient.patch(`${page._id}`, data);
      if (response.success) {
        Alert.alert("Thành công", "Bạn đã rời khỏi trang.");
        fetchPage();
      } else {
        Alert.alert("Lỗi", response.message || "Không thể rời khỏi trang.");
        console.error("❌ Error leaving page:", response.message);
      }
    } catch (error) {
      console.error("❌ Error leaving page:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi rời khỏi trang.");
    }
  };

  const deleteRightAdmin = async (userId: string) => {
    try {
      if (!page?._id || !userId) {
        Alert.alert("Lỗi", "Thiếu thông tin trang hoặc người dùng.");
        return;
      }

      const response = await pagesClient.patch(`${page._id}`, {
        removeAdmin: userId,
        addFollower: userId,
      });

      if (response.success) {
        Alert.alert("Thành công", "Đã xóa quyền quản trị viên.");
        fetchPage();
      } else {
        Alert.alert("Lỗi", response.message || "Không thể xóa quyền quản trị viên.");
        console.error("❌ Error deleting admin rights:", response.message);
      }
    } catch (error) {
      console.error("❌ Error deleting admin rights:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi xóa quyền quản trị viên.");
    }
  };

  const acceptAdminInvite = async (userId: string) => {
    try {
      if (!page?._id || !userId) {
        Alert.alert("Lỗi", "Thiếu thông tin trang hoặc người dùng.");
        return;
      }

      const response = await pagesClient.patch(`${page._id}`, {
        acceptAdmin: userId,
        removeFollower: userId,
      });

      if (response.success) {
        if (page?.idCreater && page.idCreater !== userId) {
          try {
            await notificationsClient.create({
              senderId: userId,
              receiverId: page.idCreater,
              message: `${currentUserDisplayName || "Một quản trị viên"} đã chấp nhận lời mời làm quản trị viên của trang ${page.name}`,
              status: "unread",
              pageId: page._id,
              relatedEntityType: "Page",
            });
          } catch (notificationError) {
            console.error("🔴 Error sending admin accept notification:", notificationError);
          }
        }

        Alert.alert("Thành công", "Bạn đã chấp nhận lời mời làm quản trị viên.");
        setModalVisible(false);
        fetchPage();
      } else {
        Alert.alert("Lỗi", response.message || "Không thể chấp nhận lời mời.");
        console.error("❌ Error accepting admin invite:", response.message);
      }
    } catch (error) {
      console.error("❌ Error accepting admin invite:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chấp nhận lời mời.");
    }
  };

  const declineAdminInvite = async (userId: string) => {
    try {
      if (!page?._id || !userId) {
        Alert.alert("Lỗi", "Thiếu thông tin trang hoặc người dùng.");
        return;
      }

      const response = await pagesClient.patch(`${page._id}`, {
        declineAdmin: userId,
      });

      if (response.success) {
        Alert.alert("Thành công", "Bạn đã từ chối lời mời làm quản trị viên.");
        setModalVisible(false);
        fetchPage();
      } else {
        Alert.alert("Lỗi", response.message || "Không thể từ chối lời mời.");
        console.error("❌ Error declining admin invite:", response.message);
      }
    } catch (error) {
      console.error("❌ Error declining admin invite:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi từ chối lời mời.");
    }
  };

  const handleShowInvites = () => {
    if (pendingInvites.length > 0) {
      setModalVisible(true);
    } else {
      Alert.alert("Không có lời mời", "Bạn không có lời mời làm quản trị viên.");
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
        label: "Rời khỏi trang",
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
        onPress: () => deleteRightAdmin(currentUserId || ""),
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
      { label: "Dịch vụ", icon: "confirmation-number" },
    ];

    const nonOwnerTabs = [
      { label: "Trang chủ", icon: "home" },
      { label: "Bài viết", icon: "article" },
      { label: "Quản trị viên", icon: "admin-panel-settings" },
      { label: "Dịch vụ", icon: "confirmation-number" },
    ];

    return role === "isOwner" ? ownerTabs : nonOwnerTabs;
  };

  const handlePressMessage = async () => {
    if (!page){
      Alert.alert("Thông báo", "Trang không xác định!");
      return;
    }
    if (currentUserId){
      if(currentUserId === page.idCreater) {
        Alert.alert("Thông báo", "Bạn không thể nhắn tin với trang của mình!");
        return;
      }
      
      const conversationAPI = restClient.apiClient.service(`apis/conversations`);
      const participants = [currentUserId]
      
      const result = await conversationAPI.create({
          creatorId: currentUserId,
          participants: participants,
          lastMessage: {
              sender: currentUserId,
              contentType: "text",
              message: "Xin chào",
          },
          type: 'page',
          pageId: page._id
      });

      if (result.success){
        navigation.navigate('BoxChat', {conversationId: result.data._id})
      }
    } else {
      Alert.alert("Thông báo", "Bạn chưa đăng nhập!");
    }
  }

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
    currentUserId,
    handlePressMessage
  };
};

export default usePageScreen;