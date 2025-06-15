import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, Keyboard } from "react-native";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import Post from "@/src/features/newfeeds/components/post/Post";
import Modal from "react-native-modal";
import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Page } from "@/src/interface/interface_reference";
import usePageHome from "./usePageHome";


interface PageHomeProps {
  page: Page;
  currentUserId: string;
  role: string;
}

const PageHome: React.FC<PageHomeProps> = ({ page, currentUserId, role }) => {
  useTheme()
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
    <View style={[styles.container, { backgroundColor: Color.background }]}>
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
        onSwipeComplete={closeComments}
      >
        <View style={[styles.commentContainer, { backgroundColor: Color.background }]}>
          <View style={[styles.commentHeader, { borderBottomColor: Color.border }]}>
            <Text style={[styles.commentTitle, { color: Color.textPrimary }]}>
              {calculateTotalComments(currentArticle?.comments || [])} bình luận
            </Text>
            <TouchableOpacity onPress={closeComments}>
              <Ionicons name="close" size={24} color={Color.textPrimary} />
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
                  backgroundColor: Color.backgroundTertiary, // Sử dụng backgroundTertiary cho input
                },
              ]}
              placeholder="Thêm bình luận..."
              placeholderTextColor={Color.textTertiary}
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

export default PageHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 50,
    // backgroundColor applied inline
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
    // backgroundColor applied inline
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 10,
    // borderBottomColor applied inline
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    // color applied inline
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    // borderTopColor applied inline
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
  commentList: { flexGrow: 1, paddingBottom: 10 },
});