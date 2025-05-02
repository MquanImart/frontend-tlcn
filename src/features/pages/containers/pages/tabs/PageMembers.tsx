import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { showActionSheet } from "@/src/shared/components/showActionSheet/showActionSheet";
import getColor from "@/src/styles/Color";
import { Page, User } from "@/src/interface/interface_reference";
import usePageMembers from "./usePageMembers";

const Color = getColor();

interface PageMembersProps {
  page: Page;
  currentUserId: string;
  role: string;
  updatePage: () => void;
}

interface MemberCardProps {
  name: string;
  avatarUrl: string;
  description?: string;
}

interface UserWithAvatar extends User {
  avatarUrl: string;
}

const MemberCard: React.FC<MemberCardProps> = ({ name, avatarUrl, description }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </View>
  );
};

const PageMembers: React.FC<PageMembersProps> = ({ page, currentUserId, role, updatePage }) => {
  const { owner, admins, followers, loading, handleLongPress } = usePageMembers(page, role, updatePage);

  const renderSection = (title: string, data: UserWithAvatar[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => handleLongPress(item._id, title)}>
            <MemberCard name={item.displayName} avatarUrl={item.avatarUrl} description={item.aboutMe} />
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
      {owner && renderSection("Người tạo trang", [owner])}
      {renderSection("Quản trị viên", admins)}
      {renderSection("Người theo dõi", followers)}
    </View>
  );
};

export default PageMembers;

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
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000", // Màu bóng
    shadowOpacity: 0.1, // Độ mờ của bóng
    shadowOffset: { width: 0, height: 5 }, // Độ lệch bóng
    shadowRadius: 10, // Bán kính bóng
    elevation: 3, // Độ nổi trên Android
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textContainer: {
    flex: 1, // Để text chiếm không gian còn lại
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Color.textColor1,
  },
  description: {
    fontSize: 14,
    color: Color.textColor2,
  },
});