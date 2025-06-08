import { Group } from "@/src/features/newfeeds/interface/article";
import CButton from "@/src/shared/components/button/CButton";
import CIconButton from "@/src/shared/components/button/CIconButton";
import getColor from "@/src/styles/Color";
import { Image } from 'expo-image';
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const Color = getColor();

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
  const isJoined = role === "Member" || role === "Admin" || role === "Owner";

  return (
    <View style={styles.container}>
      {/* Ảnh bìa nhóm */}
      <Image source={{ uri: group.avt?.url || "" }} style={styles.coverImage} />

      {/* Thông tin nhóm */}
      <View style={styles.infoContainer}>
        <Text style={styles.memberCount}>
          {`${group.type === "public" ? "Nhóm công khai" : "Nhóm riêng tư"} • ${
            group.members?.filter((member) => member.state === "accepted").length || 0
          } thành viên`}
        </Text>
      </View>

      {/* Hiển thị button nếu không phải Guest */}
      {role !== "Guest" && (
        <View style={styles.buttonRow}>
          <CIconButton
            label={isJoined ? "Đã tham gia" : "Tham gia"}
            icon={
              <Icon
                name={isJoined ? "check-circle" : "group-add"}
                size={20}
                color={Color.textColor2}
                style={{ marginRight: 10 }}
              />
            }
            onSubmit={isJoined ? () => {} : () => {}}
            style={{
              width: "48%",
              height: 45,
              backColor: Color.mainColor1,
              textColor: Color.textColor2,
              fontSize: 16,
              fontWeight: "bold",
              radius: 8,
              flex_direction: "row",
              justifyContent: "center",
            }}
          />
          <CButton
            label="Mời"
            onSubmit={onInvite}
            style={{
              width: "48%",
              height: 45,
              backColor: Color.mainColor1,
              textColor: Color.textColor2,
              fontSize: 16,
              fontWeight: "bold",
              radius: 8,
            }}
          />
        </View>
      )}
    </View>
  );
};

export default GroupHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.backGround,
  },
  coverImage: {
    width: "100%",
    height: 300,
  },
  infoContainer: {
    padding: 10,
  },
  memberCount: {
    fontSize: 14,
    color: Color.textColor3,
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
});
