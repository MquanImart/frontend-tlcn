import InviteAdminModal from "@/src/features/group/components/InviteAdminModal";
import UserInfo from "@/src/features/group/components/UserInfo";
import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import Post from "@/src/features/newfeeds/components/post/Post";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import getColor from "@/src/styles/Color";
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

const colors = getColor();

interface GroupMySelfProps {
  groupId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
  onRoleUpdated: () => void;
}

const GroupMySelf: React.FC<GroupMySelfProps> = ({ groupId, currentUserId, role, onRoleUpdated }) => {
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
    <View style={styles.container}>
      <Text style={styles.infoText}>Thông tin</Text>

      {/* Hiển thị thông tin người dùng */}
      {adminInvite ? (
        <UserInfo
          groupName={adminInvite.groupName || ""}
          role={role}
          joinDate={Date.now()}
          inviterAvatar={adminInvite.inviterAvatar || ""}
          onPress={() => adminInvite.hasInvite && setModalVisible(true)}
        />
      ) : (
        <Text style={styles.noInviteText}>Không có lời mời làm quản trị viên</Text>
      )}

      {/* Hiển thị modal lời mời làm quản trị viên nếu có */}
      {adminInvite && modalVisible && (
        <InviteAdminModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onAccept={handleAcceptInviteWithRoleUpdate}
          onReject={handleRejectInviteWithRoleUpdate}
          groupName={adminInvite.groupName}
          inviterName={adminInvite.inviterName}
          inviteDate={new Date(adminInvite.inviteDate).toLocaleDateString("vi-VN")}
          inviterAvatar={adminInvite.inviterAvatar}
        />
      )}

      <Text style={styles.infoText}>Bài viết trong nhóm</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.mainColor1} style={styles.loading} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchUserArticles(1)}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : articles.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Post
              article={item}
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
              colors={[colors.mainColor1]}
            />
          }
          onEndReached={loadMoreArticles}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="large" color={colors.mainColor1} />
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
        <View style={[styles.commentContainer, { backgroundColor: colors.backGround }]}>
          <View style={styles.commentHeader}>
            <Text style={[styles.commentTitle, { color: colors.textColor1 }]}>
              {calculateTotalComments(currentArticle?.comments || [])} bình luận
            </Text>
            <TouchableOpacity onPress={closeComments}>
              <Ionicons name="close" size={24} color={colors.textColor1} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={currentArticle?.comments || []}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <CommentItem
                userId={currentUserId}
                comment={item}
                onLike={likeComment}
                onReply={replyToComment}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.commentList}
          />

          <View style={styles.commentInputContainer}>
            <TextInput
              style={[
                styles.commentInput,
                {
                  borderColor: colors.borderColor1,
                  color: colors.textColor1,
                  backgroundColor: colors.backGround,
                },
              ]}
              placeholder="Viết bình luận..."
              placeholderTextColor={colors.textColor3}
              value={newReply}
              onChangeText={setNewReply}
            />
            <TouchableOpacity onPress={handleAddComment}>
              <Ionicons name="send" size={20} color={colors.mainColor1} />
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
    backgroundColor: colors.backGround,
  },
  infoText: {
    fontSize: 18,
    color: colors.textColor1,
    marginBottom: 10,
    fontWeight: "bold",
  },
  noInviteText: {
    fontSize: 16,
    color: colors.textColor3,
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
    borderBottomColor: colors.borderColor1,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderColor1,
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
    color: "red",
    textAlign: "center",
  },
  retryText: {
    fontSize: 16,
    color: colors.mainColor1,
    marginTop: 10,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textColor3,
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