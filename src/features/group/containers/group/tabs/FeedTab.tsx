import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import Post from "@/src/features/newfeeds/components/post/Post";
import Modal from "react-native-modal";
import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import { Ionicons } from "@expo/vector-icons";
import getColor from "@/src/styles/Color";
import { useFeed } from "./useFeed";

const colors = getColor();

interface FeedTabProps {
  userId: string;
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}

const FeedTab = ({userId, handleScroll}: FeedTabProps) => {
  const { articleGroups, setArticleGroups, loading, error } = useFeed(userId);
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
    <View style={[styles.container, { backgroundColor: colors.backGround }]}>
      {/* Danh sách bài viết */}
      <FlatList
        data={articleGroups}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator = {false}
        renderItem={({ item }) => (
          <Post
            userId = {userId}
            article={item}
            onCommentPress={() => openComments(item)}
            onLike={() => likeArticle(item._id, item.createdBy._id)}
            deleteArticle={deleteArticle}
            editArticle={editArticle}
          />
        )}
        onScroll={handleScroll}  
        scrollEventThrottle={16}
      />
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
                userId = {userId}
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
                  borderColor: colors.borderColor1,
                  color: colors.textColor1,
                  backgroundColor: colors.backGround,
                },
              ]}
              placeholder="Thêm bình luận..."
              placeholderTextColor={colors.textColor3}
              value={newReply}
              onChangeText={setNewReply}
            />
            <TouchableOpacity onPress={handleAddComment}>
              <Ionicons name="send" size={24} color={colors.mainColor1} />
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
    color: colors.textColor3,
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
});
