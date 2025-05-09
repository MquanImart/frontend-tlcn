import PostApproval from "@/src/features/group/components/PostApproval";
import getColor from "@/src/styles/Color";
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
import { useGroupPostApproval } from "./useGroupPostApproval";

const Color = getColor();

interface GroupPostApprovalProps {
  groupId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
}

const GroupPostApproval: React.FC<GroupPostApprovalProps> = ({ groupId, role }) => {
  const {
    pendingPosts,
    loading,
    error,
    handleApprove,
    handleReject,
    loadMorePosts,
    isLoadingMore,
    fetchPendingArticles,
  } = useGroupPostApproval(groupId);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách bài viết cần duyệt</Text>
      {loading ? (
        <ActivityIndicator size="large" color={Color.mainColor1} style={styles.loading} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchPendingArticles(1)}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pendingPosts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostApproval
              article={item}
              onAccept={() => handleApprove(item._id)}
              onReject={() => handleReject(item._id)}
            />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Không có bài viết nào cần duyệt</Text>}
          onEndReached={loadMorePosts}
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
              onRefresh={() => fetchPendingArticles(1)}
              colors={[Color.mainColor1]}
            />
          }
        />
      )}
    </View>
  );
};

export default GroupPostApproval;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: Color.backGround,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color.textColor1,
    marginBottom: 10,
  },
  loading: {
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  retryText: {
    fontSize: 16,
    color: Color.mainColor1,
    marginTop: 10,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: Color.textColor3,
    marginTop: 20,
  },
  footer: {
    padding: 10,
    alignItems: "center",
  },
});