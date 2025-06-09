// ArticleDetail.tsx
import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import Post from "@/src/features/newfeeds/components/post/Post";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import { NewFeedParamList } from "@/src/shared/routes/NewFeedNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Modal from "react-native-modal";
import useArticleDetail from "./useArticleDetail";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type ArticleDetailNavigationProp = StackNavigationProp<NewFeedParamList, "ArticleDetail">;

interface RouteParams {
  articleId: string;
  commentId?: string;
}

export default function ArticleDetail() {
  useTheme();
  const navigation = useNavigation<ArticleDetailNavigationProp>();
  const route = useRoute();
  const { articleId, commentId } = route.params as RouteParams;

  const {
    userId,
    currentArticle,
    isModalVisible,
    newReply,
    setNewReply,
    selectedMedia,
    isCommentChecking,
    isLoading,
    openComments,
    closeComments,
    likeComment,
    replyToComment,
    likeArticle,
    calculateTotalComments,
    handleAddComment,
    deleteArticle,
    editArticle,
    pickMedia,
    commentListRef,
  } = useArticleDetail(articleId, commentId);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: Color.backGround }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <CHeaderIcon
        label="Bài viết"
        IconLeft="arrow-back"
        onPressLeft={() => navigation.goBack()}
        onPressRight={() => {}}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Color.mainColor1} />
          <Text style={[styles.loadingText, { color: Color.textColor1 }]}>Đang tải...</Text>
        </View>
      ) : currentArticle ? (
        <View style={styles.postContainer}>
          <Post
            article={currentArticle}
            userId={userId || ""}
            onCommentPress={openComments}
            onLike={likeArticle}
            deleteArticle={deleteArticle}
            editArticle={editArticle}
          />
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Color.textColor1 }]}>Không thể tải bài viết</Text>
        </View>
      )}

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeComments}
        style={styles.modal}
        backdropOpacity={0.5}
        swipeDirection="down"
        onSwipeComplete={closeComments}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.commentContainer, { backgroundColor: Color.backGround }]}>
              <View style={styles.commentHeader}>
                <Text style={[styles.commentTitle, { color: Color.textColor1 }]}>
                  {calculateTotalComments()} bình luận
                </Text>
                <TouchableOpacity onPress={closeComments}>
                  <Ionicons name="close" size={24} color={Color.textColor1} />
                </TouchableOpacity>
              </View>

              <FlatList
                ref={commentListRef}
                data={currentArticle?.comments || []}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <CommentItem
                    userId={userId || ""}
                    comment={item}
                    onLike={likeComment}
                    onReply={replyToComment}
                    level={1}
                    isHighlighted={item._id === commentId}
                  />
                )}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.commentList}
                keyboardShouldPersistTaps="handled"
                onScrollToIndexFailed={(info) => {
                  console.warn("Failed to scroll to comment index:", info);
                  commentListRef.current?.scrollToIndex({
                    index: Math.min(info.index, (currentArticle?.comments?.length || 1) - 1),
                    animated: true,
                  });
                }}
              />

              {selectedMedia.length > 0 && (
                <View style={styles.mediaPreviewContainer}>
                  {selectedMedia.map((media, index) => (
                    <Image key={index} source={{ uri: media.uri }} style={styles.mediaPreview} />
                  ))}
                </View>
              )}

              <View style={styles.commentInputContainer}>
                <TouchableOpacity onPress={pickMedia}>
                  <Ionicons name="image" size={24} color={Color.mainColor1} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.commentInput, { color: Color.textColor1 }]}
                  placeholder="Viết bình luận..."
                  placeholderTextColor={Color.textColor3}
                  value={newReply}
                  onChangeText={setNewReply}
                  multiline
                />
                {isCommentChecking ? (
                  <ActivityIndicator size="small" color={Color.mainColor1} />
                ) : (
                  <TouchableOpacity onPress={handleAddComment}>
                    <Ionicons name="send" size={20} color={Color.mainColor1} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  commentContainer: {
    height: SCREEN_HEIGHT * 0.6,
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
    borderTopWidth: 1,
    borderTopColor: Color.borderColor1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Color.backGround,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Color.borderColor1,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    maxHeight: 100,
  },
  commentList: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  mediaPreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  mediaPreview: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
  },
});