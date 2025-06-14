import { Group } from "@/src/features/newfeeds/interface/article";
import CButton from "@/src/shared/components/button/CButton";
import CIconButton from "@/src/shared/components/button/CIconButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface GroupHeaderProps {
  group: Group;
  role: "Guest" | "Member" | "Admin" | "Owner";
  onInvite: () => void;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  group,
  role,
  onInvite
}) => {
  useTheme();
  const isJoined = role === "Member" || role === "Admin" || role === "Owner";

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      <Image source={{ uri: group.avt?.url || "" }} style={styles.coverImage} />

      <View style={styles.infoContainer}>
        {/* Dòng thông tin nhóm và nút mời sẽ nằm ngang hàng trong cùng một View */}
        <View style={styles.topRow}>
          <Text style={[styles.groupDetails, { color: Color.textSecondary }]}>
            {`${group.type === "public" ? "Nhóm công khai" : "Nhóm riêng tư"} • ${
              group.members?.filter((member) => member.state === "accepted").length || 0
            } thành viên`}
          </Text>

          {role !== "Guest" && (
            <CButton
              label="Mời"
              onSubmit={onInvite}
              style={{
                width: 80, // Giảm chiều rộng để nó nằm vừa một hàng
                height: 35, // Giảm chiều cao để nó nhỏ gọn hơn
                backColor: Color.mainColor2,
                textColor: Color.textOnMain2,
                fontSize: 14, // Giảm kích thước chữ
                fontWeight: "bold",
                radius: 8,
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default GroupHeader;

const styles = StyleSheet.create({
  container: {},
  coverImage: {
    width: "100%",
    height: 300,
  },
  infoContainer: {
    padding: 10,
    // Không cần flexDirection ở đây nữa, vì đã có topRow
  },
  topRow: {
    flexDirection: 'row', // Sắp xếp các phần tử con theo hàng ngang
    justifyContent: 'space-between', // Đẩy các phần tử ra hai bên
    alignItems: 'center', // Căn giữa theo chiều dọc
    marginBottom: 5, // Khoảng cách với các nội dung khác nếu có
  },
  groupDetails: { // Đổi tên từ memberCount để phản ánh nội dung tổng thể hơn
    fontSize: 14,
    // Không cần marginVertical ở đây nữa vì đã căn chỉnh bằng alignItems
    flexShrink: 1, // Cho phép text co lại nếu dài
    marginRight: 10, // Khoảng cách giữa text và nút
  },
  // buttonRow không cần thiết nữa, logic đã được chuyển vào topRow
});