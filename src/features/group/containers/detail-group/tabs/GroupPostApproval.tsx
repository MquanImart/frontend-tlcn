import PostApproval from "@/src/features/group/components/PostApproval";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
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

interface GroupPostApprovalProps {
  groupId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
}

const GroupPostApproval: React.FC<GroupPostApprovalProps> = ({ groupId, role }) => {
  useTheme();
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
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      <Text style={[styles.header, { color: Color.textPrimary }]}>Danh sách bài viết cần duyệt</Text>
      {loading ? (
        <ActivityIndicator size="large" color={Color.mainColor2} style={styles.loading} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Color.error }]}>{error}</Text>
          <TouchableOpacity onPress={() => fetchPendingArticles(1)}>
            <Text style={[styles.retryText, { color: Color.mainColor2 }]}>Thử lại</Text>
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
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: Color.textSecondary }]}>Không có bài viết nào cần duyệt</Text>
          }
          onEndReached={loadMorePosts}
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
              onRefresh={() => fetchPendingArticles(1)}
              colors={[Color.mainColor2]}
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
    // backgroundColor: Color.backGround, // Moved to inline style
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    // color: Color.textColor1, // Moved to inline style
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
    // color: "red", // Moved to inline style
    textAlign: "center",
  },
  retryText: {
    fontSize: 16,
    // color: Color.mainColor2, // Moved to inline style
    marginTop: 10,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    // color: Color.textColor3, // Moved to inline style
    marginTop: 20,
  },
  footer: {
    padding: 10,
    alignItems: "center",
  },
});