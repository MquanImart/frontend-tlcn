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
        <Text style={[styles.memberCount, { color: Color.textSecondary }]}>
          {`${group.type === "public" ? "Nhóm công khai" : "Nhóm riêng tư"} • ${
            group.members?.filter((member) => member.state === "accepted").length || 0
          } thành viên`}
        </Text>
      </View>

      {role !== "Guest" && (
        <View style={styles.buttonRow}>
          <CIconButton
            label={isJoined ? "Đã tham gia" : "Tham gia"}
            icon={
              <Icon
                name={isJoined ? "check-circle" : "group-add"}
                size={20}
                color={Color.textOnMain1}
                style={{ marginRight: 10 }}
              />
            }
            onSubmit={isJoined ? () => {} : () => {}}
            style={{
              width: "48%",
              height: 45,
              backColor: Color.mainColor1,
              textColor: Color.textOnMain1,
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
              textColor: Color.textOnMain1,
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
  container: {},
  coverImage: {
    width: "100%",
    height: 300,
  },
  infoContainer: {
    padding: 10,
  },
  memberCount: {
    fontSize: 14,
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
});