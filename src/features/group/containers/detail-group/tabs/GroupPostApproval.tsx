// GroupPostApproval.tsx
import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import PostApproval from "@/src/features/group/components/PostApproval";
import { useGroupPostApproval } from "./useGroupPostApproval"; 
import getColor from "@/src/styles/Color";

const Color = getColor();

interface GroupPostApprovalProps {
  groupId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner"; 
}

const GroupPostApproval: React.FC<GroupPostApprovalProps> = ({ groupId, role }) => {
  const { pendingPosts, loading, handleApprove, handleReject } = useGroupPostApproval(groupId); 

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách bài viết cần duyệt</Text>
      {loading ? (
        <Text style={styles.loadingText}>Đang tải...</Text>
      ) : (
        <FlatList
          data={pendingPosts}
          keyExtractor={  (item) => item._id}
          renderItem={({ item }) => (
            <PostApproval
              article={item}
              onAccept={() => handleApprove(item._id)}
              onReject={() => handleReject(item._id)}
            />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Không có bài viết nào cần duyệt</Text>}
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
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: Color.textColor3,
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: Color.textColor3,
    marginTop: 20,
  },
});
