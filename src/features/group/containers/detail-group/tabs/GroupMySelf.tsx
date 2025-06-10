import InviteAdminModal from "@/src/features/group/components/InviteAdminModal";
import UserInfo from "@/src/features/group/components/UserInfo";
import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import Post from "@/src/features/newfeeds/components/post/Post";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { useGroupMySelf } from "./useGroupMySelf";

interface GroupMySelfProps {
  groupId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
  onRoleUpdated: () => void;
}

const GroupMySelf: React.FC<GroupMySelfProps> = ({ groupId, currentUserId, role, onRoleUpdated }) => {
  useTheme();
  const {
    articles,
    setArticles,
    loading,
    error,
    modalVisible,
    setModalVisible,
    adminInvite,
    handleAcceptInvite,
    handleRejectInvite,
    loadMoreArticles,
    isLoadingMore,
    fetchUserArticles,
  } = useGroupMySelf(groupId, currentUserId);

  const {
    isModalVisible,
    currentArticle,
    newReply,
    openComments,
    closeComments,
    likeComment,
    replyToComment,
    setNewReply,
    likeArticle,
    calculateTotalComments,
    handleAddComment,
    deleteArticle,
    editArticle,
  } = useNewFeed(articles, setArticles);

  const handleAcceptInviteWithRoleUpdate = async () => {
    await handleAcceptInvite();
    onRoleUpdated();
  };

  const handleRejectInviteWithRoleUpdate = async () => {
    await handleRejectInvite();
    onRoleUpdated();
  };

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      <Text style={[styles.infoText, { color: Color.textPrimary }]}>Thông tin</Text>

      {/* Hiển thị thông tin người dùng */}
      {adminInvite ? (
        <UserInfo
          groupName={adminInvite.groupName || ""} // Ensure UserInfo wraps this in <Text>
          role={role} // Ensure UserInfo wraps this in <Text> if displayed directly
          joinDate={Date.now()} // Ensure UserInfo handles dates correctly for display
          inviterAvatar={adminInvite.inviterAvatar || ""} // Ensure UserInfo handles this for display (e.g., as part of Image source)
          onPress={() => adminInvite.hasInvite && setModalVisible(true)}
        />
      ) : (
        <Text style={[styles.noInviteText, { color: Color.textSecondary }]}>Không có lời mời làm quản trị viên</Text>
      )}

      {/* Hiển thị modal lời mời làm quản trị viên nếu có */}
      {adminInvite && modalVisible && (
        <InviteAdminModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onAccept={handleAcceptInviteWithRoleUpdate}
          onReject={handleRejectInviteWithRoleUpdate}
          groupName={adminInvite.groupName} // Ensure InviteAdminModal wraps this in <Text>
          inviterName={adminInvite.inviterName} // Ensure InviteAdminModal wraps this in <Text>
          inviteDate={new Date(adminInvite.inviteDate).toLocaleDateString("vi-VN")} // Ensure InviteAdminModal wraps this in <Text>
          inviterAvatar={adminInvite.inviterAvatar} // Ensure InviteAdminModal handles this for display
        />
      )}

      <Text style={[styles.infoText, { color: Color.textPrimary }]}>Bài viết trong nhóm</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Color.mainColor1} style={styles.loading} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Color.error }]}>{error}</Text>
          <TouchableOpacity onPress={() => fetchUserArticles(1)}>
            <Text style={[styles.retryText, { color: Color.mainColor1 }]}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : articles.length === 0 ? (
        <Text style={[styles.emptyText, { color: Color.textSecondary }]}>Chưa có bài viết nào</Text>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Post
              article={item} // Ensure Post component wraps all its text content in <Text>
              userId={currentUserId}
              onCommentPress={() => openComments(item)}
              onLike={() => likeArticle(item._id, item.createdBy._id)}
              deleteArticle={deleteArticle}
              editArticle={editArticle}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchUserArticles(1)}
              colors={[Color.mainColor1]}
            />
          }
          onEndReached={loadMoreArticles}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="large" color={Color.mainColor1} />
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal bình luận */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeComments}
        style={styles.modal}
        backdropOpacity={0.5}
        swipeDirection="down"
        onSwipeComplete={closeComments}
      >
        <View style={[styles.commentContainer, { backgroundColor: Color.backgroundSecondary }]}>
          <View style={[styles.commentHeader, { borderBottomColor: Color.border }]}>
            <Text style={[styles.commentTitle, { color: Color.textPrimary }]}>
              {calculateTotalComments(currentArticle?.comments || [])} bình luận
            </Text>
            <TouchableOpacity onPress={closeComments}>
              <Ionicons name="close" size={24} color={Color.mainColor1} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={currentArticle?.comments || []}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <CommentItem
                userId={currentUserId}
                comment={item} // Ensure CommentItem wraps all its text content in <Text>
                onLike={likeComment}
                onReply={replyToComment}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.commentList}
          />

          <View style={[styles.commentInputContainer, { borderTopColor: Color.border }]}>
            <TextInput
              style={[
                styles.commentInput,
                {
                  borderColor: Color.border,
                  color: Color.textPrimary,
                  backgroundColor: Color.background,
                },
              ]}
              placeholder="Viết bình luận..."
              placeholderTextColor={Color.textTertiary}
              value={newReply}
              onChangeText={setNewReply}
            />
            <TouchableOpacity onPress={handleAddComment}>
              <Ionicons name="send" size={20} color={Color.mainColor1} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GroupMySelf;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  noInviteText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  commentContainer: {
    height: 400,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 10,
  },
  commentList: {
    flexGrow: 1,
    paddingBottom: 20,
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
    textAlign: "center",
  },
  retryText: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  footer: {
    padding: 10,
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
});