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
}

const GroupCard: React.FC<GroupCardProps> = ({ group, currentUserId, onJoinGroup, onViewGroup }) => {
  useTheme();
  const isGroupCreator = group.idCreater === currentUserId;
  const currentUserMember = group.members?.find((member) => member.idUser._id === currentUserId);

  const isMemberAccepted = currentUserMember?.state === 'accepted';
  const isMemberPending = currentUserMember?.state === 'pending';

  return (
    <View style={styles.container}>
      <Image source={{ uri: group.avt?.url || "" }} style={styles.avatar} />
      <View style={styles.content}>
        <Text style={styles.groupName}>{group.groupName}</Text>
        <Text style={styles.groupType}>
          {group.type === "public" ? "Nhóm công khai" : "Nhóm riêng tư"}
        </Text>
        {group.introduction && <Text style={styles.introduction}>{group.introduction}</Text>}

        <View style={styles.buttonContainer}>
          {isGroupCreator ? (
            // Người tạo nhóm
            <TouchableOpacity
              style={[styles.button, styles.viewButton]}
              onPress={() => onViewGroup(group._id)}
            >
              <Text style={styles.buttonText}>Xem nhóm</Text>
            </TouchableOpacity>
          ) : isMemberAccepted ? (
            // Người đã tham gia nhóm và được chấp nhận
            <TouchableOpacity
              style={[styles.button, styles.viewButton]}
              onPress={() => onViewGroup(group._id)}
            >
              <Text style={styles.buttonText}>Xem nhóm</Text>
            </TouchableOpacity>
          ) : isMemberPending ? (
            // Người đã gửi yêu cầu tham gia nhóm nhưng chưa được chấp nhận
            <>
              <TouchableOpacity
                style={[styles.button, styles.pendingButton]}
                onPress={() => onJoinGroup(group._id)}
              >
                <Text style={styles.buttonText}>Đã gửi yêu cầu</Text>
              </TouchableOpacity>
              {group.type === "public" && (
                <TouchableOpacity
                  style={[styles.button, styles.viewButton]}
                  onPress={() => onViewGroup(group._id)}
                >
                  <Text style={styles.buttonText}>Xem nhóm</Text>
                </TouchableOpacity>
              )}
            </>
          ) : group.type === "public" ? (
            // Nhóm công khai (chưa tham gia)
            <>
              <TouchableOpacity
                style={[styles.button, styles.joinButton]}
                onPress={() => onJoinGroup(group._id)}
              >
                <Text style={styles.buttonText}>Tham gia nhóm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.viewButton]}
                onPress={() => onViewGroup(group._id)}
              >
                <Text style={styles.buttonText}>Xem nhóm</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Nhóm riêng tư (chưa tham gia)
            <TouchableOpacity
              style={[styles.button, styles.joinButton]}
              onPress={() => onJoinGroup(group._id)}
            >
              <Text style={styles.buttonText}>Tham gia nhóm</Text>
            </TouchableOpacity>
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
    backgroundColor: Color.backGround,
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
    color: Color.textColor1,
    marginBottom: 5,
  },
  groupType: {
    fontSize: 12,
    color: Color.textColor3,
    marginBottom: 5,
  },
  introduction: {
    fontSize: 12,
    color: Color.textColor1,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  joinButton: {
    backgroundColor: Color.mainColor1,
  },
  viewButton: {
    backgroundColor: Color.mainColor1,
  },
  pendingButton: {
    backgroundColor: Color.mainColor1,  
  },
  buttonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
});