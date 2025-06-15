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
import { useGroupHome } from "./useGroupHome";

interface GroupHomeProps {
  groupId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
}

const GroupHome: React.FC<GroupHomeProps> = ({ groupId, currentUserId, role }) => {
  useTheme();
  const {
    articles,
    setArticles,
    loading,
    error,
    refreshing,
    onRefresh,
    loadMoreArticles,
    isLoadingMore,
    fetchApprovedArticles,
  } = useGroupHome(groupId);

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
    <View style={[styles.container, { backgroundColor: Color.backGround }]}>
      {loading ? (
        <ActivityIndicator size="large" color={Color.mainColor2} style={styles.loading} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchApprovedArticles(1)}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : articles.length === 0 ? (
        <Text style={styles.noArticlesText}>Chưa có bài viết nào</Text>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMoreArticles}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="large" color={Color.mainColor2} />
              </View>
            ) : null
          }
        />
      )}

      {/* 🗨️ Modal hiển thị bình luận */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeComments}
        style={styles.modal}
        backdropOpacity={0.5}
        onSwipeComplete={closeComments}
      >
        <View style={[styles.commentContainer, { backgroundColor: Color.backGround }]}>
          <View style={styles.commentHeader}>
            <Text style={[styles.commentTitle, { color: Color.textColor1 }]}>
              {calculateTotalComments(currentArticle?.comments || [])} bình luận
            </Text>
            <TouchableOpacity onPress={closeComments}>
              <Ionicons name="close" size={24} color={Color.textColor1} />
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
          

          <View style={styles.commentInputContainer}>
            <TextInput
              style={[
                styles.commentInput,
                {
                  borderColor: Color.borderColor1,
                  color: Color.textColor1,
                  backgroundColor: Color.backGround,
                },
              ]}
              placeholder="Thêm bình luận..."
              placeholderTextColor={Color.textColor3}
              value={newReply}
              onChangeText={setNewReply}
            />
            <TouchableOpacity onPress={handleAddComment}>
              <Ionicons name="send" size={24} color={Color.mainColor2} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GroupHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: "red",
    textAlign: "center",
    fontSize: 16,
  },
  retryText: {
    fontSize: 16,
    color: Color.mainColor2,
    marginTop: 10,
    fontWeight: "bold",
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
    borderBottomColor: Color.borderColor1,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Color.borderColor1,
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
  noArticlesText: {
    textAlign: "center",
    fontSize: 16,
    color: Color.textColor3,
    marginTop: 20,
  },
  footer: {
    padding: 10,
    alignItems: "center",
  },
  commentList: { flexGrow: 1, paddingBottom: 10 },
});