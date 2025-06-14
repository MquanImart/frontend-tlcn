// @/src/features/group/components/GroupCard.tsx

import { Group } from "@/src/features/newfeeds/interface/article";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GroupCardProps {
  group: Group;
  currentUserId: string;
  onJoinGroup: (groupId: string) => void;
  onViewGroup: (groupId: string) => void;
  onCancelJoinRequest: (groupId: string) => void; // New prop
}

const GroupCard: React.FC<GroupCardProps> = ({ group, currentUserId, onJoinGroup, onViewGroup, onCancelJoinRequest }) => {
  useTheme();
  const isGroupCreator = group.idCreater === currentUserId;
  const currentUserMember = group.members?.find((member) => member.idUser._id === currentUserId);

  const isMemberAccepted = currentUserMember?.state === 'accepted';
  const isMemberPending = currentUserMember?.state === 'pending';

  return (
    <View style={[styles.container, { backgroundColor: Color.backgroundSecondary }]}>
      <Image source={{ uri: group.avt?.url || "" }} style={styles.avatar} />
      <View style={styles.content}>
        <Text style={[styles.groupName, { color: Color.textPrimary }]}>{group.groupName}</Text>
        <Text style={[styles.groupType, { color: Color.textSecondary }]}>
          {group.type === "public" ? "Nhóm công khai" : "Nhóm riêng tư"}
        </Text>
        {group.introduction && <Text style={[styles.introduction, { color: Color.textPrimary }]}>{group.introduction}</Text>}

        <View style={[styles.buttonContainer, { gap: 10 }]}>
          {isGroupCreator || isMemberAccepted ? (
            // Case 1: User is the Group Creator or an Accepted Member
            <TouchableOpacity
              style={[styles.button, { backgroundColor: Color.mainColor2 }]}
              onPress={() => onViewGroup(group._id)}
            >
              <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Xem nhóm</Text>
            </TouchableOpacity>
          ) : isMemberPending ? (
            // Case 2: User has a pending request - Show "Hủy yêu cầu" or "Đã gửi yêu cầu"
            <>
              {/* This button will now call onCancelJoinRequest */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: Color.backgroundTertiary }]}
                onPress={() => onCancelJoinRequest(group._id)} // Call cancel function
              >
                <Text style={[styles.buttonText, { color: Color.textSecondary }]}>Hủy yêu cầu</Text>
              </TouchableOpacity>
              {group.type === "public" && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: Color.mainColor2 }]}
                  onPress={() => onViewGroup(group._id)}
                >
                  <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Xem nhóm</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            // Case 3: User is not creator, not accepted, not pending - Show "Tham gia nhóm" or "Xem nhóm"
            <>
              {group.type === "public" && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: Color.mainColor2 }]}
                  onPress={() => onJoinGroup(group._id)}
                >
                  <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Tham gia nhóm</Text>
                </TouchableOpacity>
              )}
              {/* For private groups, if not member/pending, only Join button is shown */}
              {group.type === "private" ? (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: Color.mainColor2 }]}
                  onPress={() => onJoinGroup(group._id)}
                >
                  <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Tham gia nhóm</Text>
                </TouchableOpacity>
              ) : ( // Public groups also have View button
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: Color.mainColor2 }]}
                  onPress={() => onViewGroup(group._id)}
                >
                  <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Xem nhóm</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default GroupCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  groupType: {
    fontSize: 12,
    marginBottom: 5,
  },
  introduction: {
    fontSize: 12,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});