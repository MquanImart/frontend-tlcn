import { Page, User } from "@/src/interface/interface_reference";
import { showActionSheet } from "@/src/shared/components/showActionSheet/showActionSheet";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MemberCard from "../../../components/MemberCard";
import usePageInvitations from "./usePageInvitations";

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
  useTheme();
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
      <Text style={[styles.sectionTitle, { color: Color.textPrimary }]}>{title}</Text>
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
    return <ActivityIndicator size="large" color={Color.mainColor2} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      {renderSection("Lời mời quản trị viên đang chờ", pendingAdmins)}
    </View>
  );
};

export default PageInvitations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    top: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
});