import { Page, User } from "@/src/interface/interface_reference";
import { showActionSheet } from "@/src/shared/components/showActionSheet/showActionSheet";
import getColor from "@/src/styles/Color";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MemberCard from "../../../components/MemberCard";
import usePageInvitations from "./usePageInvitations";

const Color = getColor();

interface PageInvitationsProps {
  page: Page;
  currentUserId: string;
  role: string;
  updatePage: () => void;
}

interface UserWithAvatar extends User {
  avatarUrl: string;
}

const PageInvitations: React.FC<PageInvitationsProps> = ({ page, currentUserId, role, updatePage }) => {
  const { pendingAdmins, loading, handleRemoveAdmin } = usePageInvitations(page, updatePage);

  const handleLongPress = (userId: string) => {
    const actions = [
      {
        label: "Hủy mời",
        onPress: () => handleRemoveAdmin(userId),
        destructive: true,
      },
    ];

    showActionSheet(actions);
  };

  const renderSection = (title: string, data: UserWithAvatar[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => handleLongPress(item._id)}>
            <MemberCard name={item.displayName} avatar={item.avatarUrl} description={item.aboutMe} />
          </TouchableOpacity>
        )}
      />
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color={Color.mainColor1} />;
  }

  return (
    <View style={styles.container}>
      {renderSection("Lời mời quản trị viên đang chờ", pendingAdmins)}
    </View>
  );
};

export default PageInvitations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.backGround,
    padding: 15,
    top: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Color.textColor1,
    marginBottom: 8,
  },
});
