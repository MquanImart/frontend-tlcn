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
  Keyboard,
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
  currentUserJoinDate: number;
  groupName: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
  onRoleUpdated: () => void;
}

const GroupMySelf: React.FC<GroupMySelfProps> = ({ groupId, currentUserId, currentUserJoinDate, role, groupName, onRoleUpdated }) => {
  useTheme();
  const {
    articles,
    setArticles,
    loading,
    error,
    loadMoreArticles,
    isLoadingMore,
    fetchUserArticles,
    adminInvite,
    modalVisible: adminInviteModalVisible,
    setModalVisible: setAdminInviteModalVisibility,
    handleAcceptInvite,
    handleRejectInvite,
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

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      <UserInfo
        groupName={groupName}
        role={role}
        joinDate={currentUserJoinDate}
      />

      <Text style={[styles.infoText, { color: Color.textPrimary }]}>Bài viết trong nhóm</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Color.mainColor2} style={styles.loading} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Color.error }]}>{error}</Text>
          <TouchableOpacity onPress={() => fetchUserArticles(1)}>
            <Text style={[styles.retryText, { color: Color.mainColor2 }]}>Thử lại</Text>
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
              colors={[Color.mainColor2]}
            />
          }
          onEndReached={loadMoreArticles}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="large" color={Color.mainColor2} />
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeComments}
        style={styles.modal}
        backdropOpacity={0.5}
        onSwipeComplete={closeComments}
      >
        <View style={[styles.commentContainer, { backgroundColor: Color.backgroundSecondary }]}>
          <View style={[styles.commentHeader, { borderBottomColor: Color.border }]}>
            <Text style={[styles.commentTitle, { color: Color.textPrimary }]}>
              {calculateTotalComments(currentArticle?.comments || [])} bình luận
            </Text>
            <TouchableOpacity onPress={closeComments}>
              <Ionicons name="close" size={24} color={Color.mainColor2} />
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
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.commentList}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            getItemLayout={(data, index) => ({ length: 100, offset: 100 * index, index })}
            nestedScrollEnabled={true}
            onScrollBeginDrag={() => Keyboard.dismiss()}
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
              <Ionicons name="send" size={20} color={Color.mainColor2} />
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