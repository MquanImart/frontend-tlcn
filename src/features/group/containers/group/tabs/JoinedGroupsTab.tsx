import GroupCard from "@/src/features/group/components/GroupCard";
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
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
import { useJoinedGroups } from "./useJoinedGroups";

interface JoinedGroupsTabProps {
  userId: string;
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any } } }) => void;
}

const JoinedGroupsTab = ({ userId, handleScroll }: JoinedGroupsTabProps) => {
  useTheme(); // Activate theme context
  const navigation = useNavigation<StackNavigationProp<GroupParamList>>();
  const { savedGroups, loading, error, loadMoreGroups, isLoadingMore, fetchSavedGroups } =
    useJoinedGroups(userId);

  const handleViewGroup = (groupId: string) => {
    navigation.navigate("GroupDetailsScreen", {
      groupId,
      currentUserId: userId,
    });
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: Color.background }]}>
        <Text style={[styles.emptyText, { color: Color.textSecondary }]}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: Color.background }]}>
        <Text style={[styles.emptyText, { color: Color.error }]}>{error}</Text>
        <TouchableOpacity onPress={() => fetchSavedGroups(1)}>
          <Text style={[styles.retryText, { color: Color.mainColor2 }]}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      {savedGroups.length > 0 ? (
        <FlatList
          data={savedGroups}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              currentUserId={userId}
              onJoinGroup={() => {}}
              onViewGroup={() => handleViewGroup(item._id)}
              onCancelJoinRequest={() => {}}
            />
          )}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={loadMoreGroups}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="large" color={Color.mainColor2} />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchSavedGroups(1)}
              colors={[Color.mainColor2]}
            />
          }
        />
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: Color.background }]}>
          <Text style={[styles.emptyText, { color: Color.textSecondary }]}>Bạn chưa tham gia nhóm nào!</Text>
        </View>
      )}
    </View>
  );
};

export default JoinedGroupsTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    padding: 10,
    alignItems: "center",
  },
  retryText: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
});