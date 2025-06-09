import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import Post from "@/src/features/newfeeds/components/post/Post";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import getColor from "@/src/styles/Color";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { useFeed } from "./useFeed";

const Color = getColor();

interface FeedTabProps {
  userId: string;
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any } } }) => void;
}

const FeedTab = ({ userId, handleScroll }: FeedTabProps) => {
  const { articleGroups, setArticleGroups, loading, error, loadMoreArticles, isLoadingMore } =
    useFeed(userId);
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
  } = useNewFeed(articleGroups, setArticleGroups);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Color.backGround }]}>
      {/* Danh sách bài viết */}
      <FlatList
        data={articleGroups}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Post
            userId={userId}
            article={item}
            onCommentPress={() => openComments(item)}
            onLike={() => likeArticle(item._id, item.createdBy._id)}
            deleteArticle={deleteArticle}
            editArticle={editArticle}
          />
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={loadMoreArticles}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="large" color={Color.mainColor1} />
            </View>
          ) : null
        }
      />
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeComments}
        style={styles.modal}
        backdropOpacity={0.5}
        swipeDirection="down"
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
                userId={userId}
                comment={item}
                onLike={likeComment}
                onReply={replyToComment}
              />
            )}
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
              <Ionicons name="send" size={24} color={Color.mainColor1} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FeedTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Color.textColor3,
    fontStyle: "italic",
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
  footer: {
    padding: 10,
    alignItems: "center",
  },
});