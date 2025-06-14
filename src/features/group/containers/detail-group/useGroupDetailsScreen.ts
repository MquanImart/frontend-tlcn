import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";
import restClient from "@/src/shared/services/RestClient";
import usePostDialog from "@/src/features/newfeeds/components/PostDialog/usePostDialog";
import { Group } from "@/src/features/newfeeds/interface/article";

const groupsClient = restClient.apiClient.service("apis/groups");

// Đảm bảo interface Member đã bao gồm joinDate
interface Member {
  id: string;
  name: string;
  avatar: string;
  description?: string;
  joinDate?: number; // Unix timestamp
  state?: string; // T
}

interface GroupData {
  idCreater: Member;
  Administrators: Member[];
  members: Member[];
}

export const useGroupDetailsScreen = (groupId: string, currentUserId: string) => {
  const navigation = useNavigation<StackNavigationProp<GroupParamList>>();
  const [selectedTab, setSelectedTab] = useState<string>("Trang chủ");
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [groupState, setGroupState] = useState<Group | null>(null);
  const [groupData, setGroupData] = useState<GroupData | null>(null);

  const {
    isModalVisible: isPostDialogVisible,
    postContent,
    setPostContent,
    toggleModal: togglePostDialog,
    handlePost,
    privacy,
    setPrivacy,
    handlePickImage,
    handleTakePhoto,
    handleRemoveImage,
    selectedImages,
    hashtags,
    setHashtagInput,
    handleAddHashtag,
    handleRemoveHashtag,
    hashtagInput,
    isLoading,
    location,
    getCurrentLocation,
    handleMapPointSelect,
    clearLocation,
    openMapPicker,
    isLocationLoading,
    setPageID,
    setGroupID,
    MapPickerDialog,
    isMapPickerVisible,
    setMapPickerVisible,
  } = usePostDialog(currentUserId);

  useEffect(() => {
    setGroupID(groupId);
  }, [groupId]);

  const fetchGroupMembers = useCallback(async () => {
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
    }
  }, [groupId]);

  const deleteGroup = useCallback(async () => {
    try {
      await groupsClient.remove(groupId);
      Alert.alert("Thông báo", "Xóa nhóm thành công", [
        {
          text: "OK",
          onPress: () => navigation.navigate("GroupScreen"),
        },
      ]);
    } catch (error) {
      console.error("Lỗi khi xóa nhóm:", error);
      Alert.alert("Lỗi", "Không thể xóa nhóm");
    }
  }, [groupId, navigation]);

  const fetchGroupDetails = useCallback(async () => {
    try {
      const response = await groupsClient.get(groupId);
      if (response.success) {
        setGroupState(response.data);
      } else {
        console.error("Không thể lấy chi tiết nhóm:", response.messages);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API lấy chi tiết nhóm:", error);
    }
  }, [groupId]);

  const handleRoleUpdate = useCallback(async () => {
    await fetchGroupDetails();
    await fetchGroupMembers();
  }, [fetchGroupDetails, fetchGroupMembers]);

  useEffect(() => {
    handleRoleUpdate();
  }, [handleRoleUpdate]);

  const getRole = useCallback(
    (groupData: GroupData | null, currentUserId: string): string => {
      if (!groupData) return "Guest";
      if (currentUserId === groupData?.idCreater?.id) return "Owner";
      if (groupData?.Administrators?.some((admin) => admin.id === currentUserId)) return "Admin";
      if (groupData?.members?.some((member) => member.id === currentUserId)) return "Member";
      return "Guest";
    },
    []
  );

  const userRole = getRole(groupData, currentUserId) as "Guest" | "Member" | "Admin" | "Owner";

  // Lấy joinDate của người dùng hiện tại (nếu là thành viên đã chấp nhận)
  const currentUserJoinDate = groupData?.idCreater?.joinDate


  const handleEditGroup = () => setIsEditingGroup(true);
  const handleInvite = () => setInviteModalVisible(true);
  const handleSaveGroup = (updatedGroup: Group) => {
    setGroupState(updatedGroup);
    setIsEditingGroup(false);
  };

  return {
    selectedTab,
    setSelectedTab,
    inviteModalVisible,
    setInviteModalVisible,
    isEditingGroup,
    setIsEditingGroup,
    groupState,
    setGroupState,
    groupData,
    setGroupData,
    userRole,
    handleEditGroup,
    handleInvite,
    handleSaveGroup,
    deleteGroup,
    isPostDialogVisible,
    postContent,
    setPostContent,
    togglePostDialog,
    handlePost,
    privacy,
    setPrivacy,
    handlePickImage,
    handleTakePhoto,
    handleRemoveImage,
    selectedImages,
    hashtags,
    setHashtagInput,
    handleAddHashtag,
    handleRemoveHashtag,
    hashtagInput,
    handleRoleUpdate,
    isLoading,
    location,
    getCurrentLocation,
    handleMapPointSelect,
    clearLocation,
    isLocationLoading,
    MapPickerDialog,
    isMapPickerVisible,
    setMapPickerVisible,
    setPageID,
    openMapPicker,
    currentUserJoinDate
  };
};