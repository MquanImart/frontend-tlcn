import { showActionSheet } from "@/src/shared/components/showActionSheet/showActionSheet";
import restClient from "@/src/shared/services/RestClient";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import React from "react";
import { Alert, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";

const groupsClient = restClient.apiClient.service("apis/groups");

interface GroupTopBarProps {
  groupId: string;
  groupName: string;
  groupAvatar: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
  currentUserId: string;
  onEditGroup: () => void;
  onDeleteGroup: () => void;
  hasAdminInvite?: boolean;
  adminInviteData?: {
    groupName: string;
    inviterName: string;
    inviteDate: string;
    inviterAvatar: string;
    inviterId: string;
    hasInvite: boolean;
  } | null;
  onShowAdminInviteModal: () => void;
  onAcceptAdminInvite: () => void;
  onRejectAdminInvite: () => void;
}

const GroupTopBar: React.FC<GroupTopBarProps> = ({
  groupId,
  groupName,
  groupAvatar,
  role,
  currentUserId,
  onEditGroup,
  onDeleteGroup,
  hasAdminInvite = false,
  adminInviteData,
  onShowAdminInviteModal,
  onAcceptAdminInvite,
  onRejectAdminInvite,
}) => {
  const insets = useSafeAreaInsets();
  useTheme();
  const navigation = useNavigation<NavigationProp<GroupParamList>>();

  const handleUpdateMemberStatus = async (userId: string, state: "rejected" | "remove-admin" | "admin-and-rejected") => {
    try {
      let successMessage = "";
      let isSuccess = false;

      if (state === "admin-and-rejected") {
        const removeAdminResponse = await groupsClient.patch(`${groupId}/members/${userId}`, { state: "remove-admin" });
        if (!removeAdminResponse.success) {
          Alert.alert("Lỗi", removeAdminResponse.message || "Không thể xóa quyền quản trị viên");
          return;
        }
        const rejectedResponse = await groupsClient.patch(`${groupId}/members/${userId}`, { state: "rejected" });
        if (!rejectedResponse.success) {
          Alert.alert("Lỗi", rejectedResponse.message || "Không thể rời nhóm");
          return;
        }
        successMessage = "Bạn đã rời nhóm và quyền quản trị viên đã bị gỡ bỏ.";
        isSuccess = true;
      } else {
        const response = await groupsClient.patch(`${groupId}/members/${userId}`, { state });
        if (!response.success) {
          Alert.alert("Lỗi", response.message || "Không thể cập nhật trạng thái");
          return;
        }
        successMessage = `Trạng thái thành viên đã được cập nhật: ${state}`;
        if (state === "rejected" || state === "remove-admin") {
            isSuccess = true;
        }
      }

      Alert.alert("Thành công", successMessage, [
        {
          text: "OK",
          onPress: () => {
            if (isSuccess) {
              navigation.navigate('GroupScreen');
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái thành viên");
    }
  };

  const handleLeaveGroup = (actionType: "leave-group" | "remove-admin-only" | "admin-leave-group") => {
    let confirmationMessage = "Bạn có chắc chắn muốn thực hiện hành động này?";
    if (actionType === "admin-leave-group") {
        confirmationMessage = "Bạn có chắc chắn muốn rời nhóm và gỡ bỏ quyền quản trị viên?";
    } else if (actionType === "remove-admin-only") {
        confirmationMessage = "Bạn có chắc chắn muốn xóa quyền làm quản trị viên?";
    } else if (actionType === "leave-group") {
        confirmationMessage = "Bạn có chắc chắn muốn rời nhóm?";
    }

    Alert.alert("Xác nhận", confirmationMessage, [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xác nhận",
        onPress: () => {
          if (actionType === "admin-leave-group") {
            handleUpdateMemberStatus(currentUserId, "admin-and-rejected");
          } else if (actionType === "remove-admin-only") {
            handleUpdateMemberStatus(currentUserId, "remove-admin");
          } else if (actionType === "leave-group") {
            handleUpdateMemberStatus(currentUserId, "rejected");
          }
        },
      },
    ]);
  };

  const handleMorePress = () => {
    const options: { label: string; onPress: () => void; destructive?: boolean }[] = [];

    if (hasAdminInvite) {
      options.push({ label: "Xem lời mời làm quản trị viên", onPress: onShowAdminInviteModal });
    }

    if (role === "Owner") {
      options.push(
        { label: "Chỉnh sửa nhóm", onPress: onEditGroup },
        { label: "Xóa nhóm", onPress: onDeleteGroup, destructive: true },
      );
    } else if (role === "Admin") {
      options.push(
        { label: "Xóa quyền làm quản trị viên", onPress: () => handleLeaveGroup("remove-admin-only"), destructive: true },
        { label: "Rời nhóm (Admin)", onPress: () => handleLeaveGroup("admin-leave-group"), destructive: true },
      );
    } else if (role === "Member") {
      options.push(
        { label: "Rời nhóm", onPress: () => handleLeaveGroup("leave-group"), destructive: true },
      );
    }

    if (options.length > 0) {
      showActionSheet(options);
    }
  };

  return (
    <View style={[styles.topBar, { paddingTop: insets.top, backgroundColor: Color.mainColor2 }]}>
      <View style={styles.groupInfo}>
        <Image source={{ uri: groupAvatar || "" }} style={styles.avatar} />
        <Text style={[styles.groupName, { color: Color.textOnMain2 }]}>{groupName}</Text>
      </View>
      {role !== "Guest" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
            <MaterialCommunityIcons name="dots-vertical" size={30} color={Color.textOnMain2} />
            {hasAdminInvite && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default GroupTopBar;

const styles = StyleSheet.create({
  topBar: {
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  groupInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    marginLeft: 10,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  moreButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    zIndex: 2,
  },
});