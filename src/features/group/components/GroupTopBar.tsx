import CIconButton from "@/src/shared/components/button/CIconButton";
import { showActionSheet } from "@/src/shared/components/showActionSheet/showActionSheet";
import restClient from "@/src/shared/services/RestClient";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";

const groupsClient = restClient.apiClient.service("apis/groups");

interface GroupTopBarProps {
  groupId: string;
  groupName: string;
  groupAvatar: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
  onEditGroup: () => void;
  onDeleteGroup: () => void;
}

const GroupTopBar: React.FC<GroupTopBarProps> = ({
  groupId,
  groupName,
  groupAvatar,
  role,
  onEditGroup,
  onDeleteGroup,
}) => {
  const insets = useSafeAreaInsets();
  useTheme();
  // 🛠 Xử lý cập nhật trạng thái thành viên (chỉ dùng cho Admin/Member)
  const handleUpdateMemberStatus = async (userId: string, state: "rejected" | "remove-admin") => {
    try {
      const response = await groupsClient.patch(`${groupId}/members/${userId}`, { state });

      if (response.success) {
        Alert.alert("Thành công", `Trạng thái thành viên đã được cập nhật: ${state}`);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái thành viên");
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn rời nhóm?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xác nhận",
        onPress: () => {
          if (role === "Admin") {
            handleUpdateMemberStatus(groupId, "remove-admin");
          } else if (role === "Member") {
            handleUpdateMemberStatus(groupId, "rejected");
          }
        },
      },
    ]);
  };

  const handleMoreOptions = () => {
    const options: { label: string; onPress: () => void; destructive?: boolean }[] = [];

    if (role === "Owner") {
      options.push(
        { label: "Chỉnh sửa nhóm", onPress: onEditGroup },
        { label: "Xóa nhóm", onPress: onDeleteGroup },
        { label: "Hủy", onPress: () => console.log("Hủy"), destructive: true }
      );
    } else if (role === "Admin" || role === "Member") {
      options.push(
        { label: "Rời nhóm", onPress: handleLeaveGroup, destructive: true },
        { label: "Hủy", onPress: () => console.log("Hủy"), destructive: true }
      );
    }

    if (options.length > 0) {
      showActionSheet(options);
    }
  };

  return (
    <View style={[styles.topBar, { paddingTop: insets.top }]}>
      <View style={styles.groupInfo}>
        <Image source={{ uri: groupAvatar || "" }} style={styles.avatar} />
        <Text style={styles.groupName}>{groupName}</Text>
      </View>
      {role !== "Guest" && ( // ❌ Guest không có menu
        <View style={styles.actionButtons}>
          <CIconButton
            icon={<Icon name="more-vert" size={24} color={Color.textColor2} />}
            onSubmit={handleMoreOptions}
            style={{
              width: 60,
              height: 60,
              backColor: "transparent",
            }}
          />
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
    backgroundColor: Color.mainColor1,
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
    color: Color.textColor2,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
});
