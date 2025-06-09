import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import Post from "@/src/features/newfeeds/components/post/Post";
import Modal from "react-native-modal";
import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import { Ionicons } from "@expo/vector-icons";
import getColor from "@/src/styles/Color";
import usePostDialog from "@/src/features/newfeeds/components/PostDialog/usePostDialog";
import { Page } from "@/src/interface/interface_reference";
import usePageHome from "./usePageHome";
import BubbleButton from "@/src/shared/components/bubblebutton/BubbleButton";
import PostDialog from "@/src/features/newfeeds/components/PostDialog/PostDialog";

const Color = getColor();

interface PageHomeProps {
  page: Page; 
  currentUserId: string; 
  role: string;
}

const PageHome: React.FC<PageHomeProps> = ({ page, currentUserId, role }) => {
  const { articles, setArticles, loading } = usePageHome(page.listArticle || []);
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
      <FlatList
        data={articles|| []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Post
            userId = {currentUserId}
            article={item}
            onCommentPress={() => openComments(item)}
            onLike={() => likeArticle(item._id, item.createdBy._id)}
            deleteArticle={deleteArticle}
            editArticle={editArticle}
          />
          
        )}
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
                userId = {currentUserId}
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

export default PageHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 50,
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
});

