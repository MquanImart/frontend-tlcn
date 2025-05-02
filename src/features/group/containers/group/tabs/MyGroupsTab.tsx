import React from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import GroupCard from "@/src/features/group/components/GroupCard";
import getColor from "@/src/styles/Color";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";
import { useMyGroups } from "./useMyGroups"; // Import the custom hook

const Color = getColor();

interface MyGroupsTabProps {
  userId: string;
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}

const MyGroupTab = ({ userId, handleScroll }: MyGroupsTabProps) => {
  const navigation = useNavigation<StackNavigationProp<GroupParamList>>();

  const { myGroups, loading, error } = useMyGroups(userId);

  const handleViewGroup = (groupId: string) => {
    navigation.navigate("GroupDetailsScreen", {
      groupId,
      currentUserId: userId,
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {myGroups.length > 0 ? (
        <FlatList
          data={myGroups}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              currentUserId={userId}
              onJoinGroup={() => {}}
              onViewGroup={() => handleViewGroup(item._id)}
            />
          )}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bạn chưa tạo nhóm nào!</Text>
        </View>
      )}
    </View>
  );
};

export default MyGroupTab;

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
  },
  emptyText: {
    fontSize: 16,
    color: Color.textColor3,
    fontStyle: "italic",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
