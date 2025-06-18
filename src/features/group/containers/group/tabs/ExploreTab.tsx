import GroupCard from "@/src/features/group/components/GroupCard";
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors'; // Đảm bảo import đúng
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

interface ExploreTabProps {
  userId: string;
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any } } }) => void;
}

const ExploreTab = ({ userId, handleScroll }: ExploreTabProps) => {
  useTheme(); // Kích hoạt theme context
  const navigation = useNavigation<StackNavigationProp<GroupParamList>>();
  const { groupsNotJoined, loading, error, handleJoinGroup, loadMoreGroups, isLoadingMore, fetchGroups, handleCancelJoinRequest } =
    useExplore(userId);

  const handleViewGroup = (groupId: string) => {
    navigation.navigate("GroupDetailsScreen", {
      groupId,
      currentUserId: userId,
    });
  };

  if (loading) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: Color.background }]}>
        <Text style={[styles.emptyText, { color: Color.textSecondary }]}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: Color.background }]}>
        <Text style={[styles.emptyText, { color: Color.error }]}>{error}</Text>
        <TouchableOpacity onPress={() => fetchGroups(1)}>
          <Text style={[styles.retryText, { color: Color.mainColor2 }]}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
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
              onCancelJoinRequest={() => handleCancelJoinRequest(item._id)} 
            />
          )}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={loadMoreGroups}
          onEndReachedThreshold={0.8}
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
              onRefresh={() => fetchGroups(1)}
              colors={[Color.mainColor2]}
            />
          }
        />
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: Color.background }]}>
          <Text style={[styles.emptyText, { color: Color.textSecondary }]}>Không có nhóm nào để khám phá!</Text>
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
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