import React from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import GroupCard from "@/src/features/group/components/GroupCard";
import { useExplore } from "./useExplore";
import getColor from "@/src/styles/Color";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";

const Color = getColor();

interface ExploreTabProps {
  userId: string;
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}

const ExploreTab = ({ userId, handleScroll }: ExploreTabProps) => {
  const navigation = useNavigation<StackNavigationProp<GroupParamList>>();

  // Use the custom hook
  const { groupsNotJoined, loading, error, handleJoinGroup } = useExplore(userId);

  const handleViewGroup = (groupId: string) => {
    navigation.navigate("GroupDetailsScreen", {
      groupId: groupId,
      currentUserId: userId,
    });
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groupsNotJoined}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            currentUserId={userId}
            onJoinGroup={() => handleJoinGroup(item._id)} // Join the group
            onViewGroup={() => handleViewGroup(item._id)} // View group details
          />
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};

export default ExploreTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: Color.backGround,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: Color.textColor3,
    fontStyle: "italic",
  },
});
