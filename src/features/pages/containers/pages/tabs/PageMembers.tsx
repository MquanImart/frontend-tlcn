import { Page, User } from "@/src/interface/interface_reference";
import { PageStackParamList } from "@/src/shared/routes/PageNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import usePageMembers from "./usePageMembers";

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
  userId: string;
  currentUserId: string;
  role: string;
  section: string;
  navigation: StackNavigationProp<PageStackParamList>;
  onLongPress: (userId: string, section: string) => void;
}

interface UserWithAvatar extends User {
  avatarUrl: string;
}

const MemberCard: React.FC<MemberCardProps> = ({
  name,
  avatarUrl,
  description,
  userId,
  currentUserId,
  role,
  section,
  navigation,
  onLongPress,
}) => {
  useTheme();
  const handlePress = () => {
    console.log(`Navigating to profile for user: ${userId}`);
    if (userId === currentUserId) {
      navigation.navigate("ProfileNavigation", {
        screen: "MyProfile",
        params: undefined,
      });
    } else {
      navigation.navigate("ProfileNavigation", {
        screen: "Profile",
        params: { userId: userId },
      });
    }
  };

  const handleLongPressAction = () => {
    if (role !== "isOwner" && role !== "isAdmin") {
      console.log(`Long-press disabled for role: ${role}`);
      return;
    }
    console.log(`Long-press triggered for user: ${userId} in section: ${section}`);
    onLongPress(userId, section);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPressAction}
      delayLongPress={300}
      style={[styles.card, { backgroundColor: Color.backgroundSecondary, shadowColor: Color.shadow }]}
      activeOpacity={0.8}
    >
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={[styles.name, { color: Color.textPrimary }]}>{name}</Text>
        {description && <Text style={[styles.description, { color: Color.textSecondary }]}>{description}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const PageMembers: React.FC<PageMembersProps> = ({ page, currentUserId, role, updatePage }) => {
  const { owner, admins, followers, loading, handleLongPress } = usePageMembers(page, role, updatePage);
  const navigation = useNavigation<StackNavigationProp<PageStackParamList>>();

  const renderSection = (title: string, data: UserWithAvatar[]) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Color.textPrimary }]}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MemberCard
            name={item.displayName}
            avatarUrl={item.avatarUrl}
            description={item.aboutMe}
            userId={item._id}
            currentUserId={currentUserId}
            role={role}
            section={title}
            navigation={navigation}
            onLongPress={handleLongPress}
          />
        )}
      />
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color={Color.mainColor2} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
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
    padding: 15,
    top: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    // color applied inline
    marginBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
  },
});