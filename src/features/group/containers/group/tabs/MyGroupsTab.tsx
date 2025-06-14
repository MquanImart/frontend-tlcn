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
import { useMyGroups } from "./useMyGroups";


interface MyGroupsTabProps {
  userId: string;
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any } } }) => void;
}

const MyGroupTab = ({ userId, handleScroll }: MyGroupsTabProps) => {
  useTheme(); // Kích hoạt theme context
  const navigation = useNavigation<StackNavigationProp<GroupParamList>>();
  const { myGroups, loading, error, loadMoreGroups, isLoadingMore, fetchMyGroups } = useMyGroups(userId);

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
        <TouchableOpacity onPress={() => fetchMyGroups(1)}>
          <Text style={[styles.retryText, { color: Color.mainColor2 }]}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
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
              onRefresh={() => fetchMyGroups(1)}
              colors={[Color.mainColor2]}
            />
          }
        />
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: Color.background }]}>
          <Text style={[styles.emptyText, { color: Color.textSecondary }]}>Bạn chưa tạo nhóm nào!</Text>
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