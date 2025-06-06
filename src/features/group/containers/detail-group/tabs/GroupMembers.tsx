import MemberCard from "@/src/features/group/components/MemberCard";
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";
import getColor from "@/src/styles/Color";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useGroupMembers } from "./useGroupMembers";

const Color = getColor();

interface GroupMembersProps {
  groupId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  description?: string;
}

const GroupMembers: React.FC<GroupMembersProps> = ({ currentUserId, groupId, role }) => {
  const navigation = useNavigation<StackNavigationProp<GroupParamList>>();
  const { loading, groupData, handleLongPress } = useGroupMembers(groupId, currentUserId, role);

  const renderSection = (title: string, data: Member[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MemberCard
            name={item.name}
            avatar={item.avatar}
            description={item.description || "Thành viên nhóm"}
            memberUserId={item.id}
            currentUserId={currentUserId}
            role={role} // Pass role
            section={title} // Pass section title
            navigation={navigation}
            onLongPress={handleLongPress} // Pass handleLongPress
          />
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={Color.mainColor1} />
      ) : groupData ? (
        <>
          {renderSection("Người tạo nhóm", [groupData.idCreater])}
          {renderSection("Quản trị viên", groupData.Administrators || [])}
          {renderSection("Thành viên khác", groupData.members || [])}
        </>
      ) : (
        <Text style={styles.errorText}>Không thể tải danh sách thành viên</Text>
      )}
    </View>
  );
};

export default GroupMembers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.backGround, // Fixed from backGround
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color.textColor1,
    marginBottom: 10,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "red",
    marginTop: 20,
  },
});