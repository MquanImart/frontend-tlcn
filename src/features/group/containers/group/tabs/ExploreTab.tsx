import GroupCard from "@/src/features/group/components/GroupCard";
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";
import getColor from "@/src/styles/Color";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useExplore } from "./useExplore";

const Color = getColor();

interface ExploreTabProps {
  userId: string;
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any } } }) => void;
}

const ExploreTab = ({ userId, handleScroll }: ExploreTabProps) => {
  const navigation = useNavigation<StackNavigationProp<GroupParamList>>();
  const { groupsNotJoined, loading, error, handleJoinGroup, loadMoreGroups, isLoadingMore, fetchGroups } =
    useExplore(userId);

  const handleViewGroup = (groupId: string) => {
    navigation.navigate("GroupDetailsScreen", {
      groupId,
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
        <TouchableOpacity onPress={() => fetchGroups(1)}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {groupsNotJoined.length > 0 ? (
        <FlatList
          data={groupsNotJoined}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              currentUserId={userId}
              onJoinGroup={() => handleJoinGroup(item._id)}
              onViewGroup={() => handleViewGroup(item._id)}
            />
          )}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={loadMoreGroups}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="large" color={Color.mainColor1} />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchGroups(1)}
              colors={[Color.mainColor1]}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có nhóm nào để khám phá!</Text>
        </View>
      )}
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
  footer: {
    padding: 10,
    alignItems: "center",
  },
  retryText: {
    fontSize: 16,
    color: Color.mainColor1,
    marginTop: 10,
    fontWeight: "bold",
  },
});