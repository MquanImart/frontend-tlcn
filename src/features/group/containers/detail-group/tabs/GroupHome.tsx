import React, { useEffect, useState } from "react";
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from "react-native";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import Post from "@/src/features/newfeeds/components/post/Post";
import Modal from "react-native-modal";
import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import { Ionicons } from "@expo/vector-icons";
import getColor from "@/src/styles/Color";
import { Article } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";
import { useGroupHome } from "./useGroupHome";

const colors = getColor();

interface GroupHomeProps {
  groupId: string; 
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner"; // ✅ Thêm role để kiểm soát quyền hạn
}


const GroupHome: React.FC<GroupHomeProps> = ({ groupId, currentUserId, role }) => {

  const { articles, setArticles, loading, error, refreshing, onRefresh } = useGroupHome(groupId);
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
    <View style={[styles.container, { backgroundColor: colors.backGround }]}>
      {loading ? (
          <ActivityIndicator size="large" color={colors.mainColor1} style={styles.loading} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : articles.length === 0 ? (
          <Text style={styles.noArticlesText}>Chưa có bài viết nào</Text>
        ) : (
          <FlatList
            data={articles}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <Post
                article={item}
                userId = {currentUserId}
                onCommentPress={() => openComments(item)}
                onLike={() => likeArticle(item._id, item.createdBy._id)}
                deleteArticle={deleteArticle}
                editArticle={editArticle}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}


      {/* 🗨️ Modal hiển thị bình luận */}
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

export default GroupHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    marginTop: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
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
  noArticlesText: {
    textAlign: "center",
    fontSize: 16,
    color: colors.textColor3,
    marginTop: 20,
  },
});
