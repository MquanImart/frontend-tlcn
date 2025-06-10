import MemberCard from "@/src/features/group/components/MemberCard";
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useGroupMembers } from "./useGroupMembers";

interface GroupMembersProps {
  groupId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
}

// Assuming the structure of Member from useGroupMembers or API
interface Member {
  id: string;
  name: string;
  avatar: string;
  description?: string;
}

const GroupMembers: React.FC<GroupMembersProps> = ({ currentUserId, groupId, role }) => {
  useTheme();
  const navigation = useNavigation<StackNavigationProp<GroupParamList>>();
  const { loading, groupData, handleLongPress } = useGroupMembers(groupId, currentUserId, role);

  const renderSection = (title: string, data: Member[]) => (
    <View style={styles.section}>
      {/* Ensure title is always wrapped in Text */}
      <Text style={[styles.sectionTitle, { color: Color.textPrimary }]}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MemberCard
            name={item.name}
            avatar={item.avatar}
            // Ensure this description prop is handled correctly *inside* MemberCard with a <Text> component
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
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      {loading ? (
        <ActivityIndicator size="large" color={Color.mainColor2} />
      ) : groupData ? (
        <>
          {/* Ensure groupData.idCreater.name or whatever property is rendered is wrapped in <Text> in MemberCard */}
          {renderSection("Người tạo nhóm", [groupData.idCreater])}
          {renderSection("Quản trị viên", groupData.Administrators || [])}
          {renderSection("Thành viên khác", groupData.members || [])}
        </>
      ) : (
        // Ensure this error message is always wrapped in Text
        <Text style={[styles.errorText, { color: Color.error }]}>Không thể tải danh sách thành viên</Text>
      )}
    </View>
  );
};

export default GroupMembers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
  },
});