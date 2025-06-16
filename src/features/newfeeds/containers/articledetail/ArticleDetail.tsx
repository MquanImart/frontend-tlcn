import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import Post from "@/src/features/newfeeds/components/post/Post";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import { NewFeedParamList } from "@/src/shared/routes/NewFeedNavigation";
import { useTheme } from "@/src/contexts/ThemeContext";
import { colors as Color } from "@/src/styles/DynamicColors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from "expo-image";
import React, { useRef, useEffect } from "react";
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

  const inputRef = useRef<TextInput>(null);

  // Focus input khi modal mở
  useEffect(() => {
    if (isModalVisible) {
      setTimeout(() => inputRef.current?.focus(), 300); // Delay để modal render hoàn tất
    }
  }, [isModalVisible]);

  // Đóng bàn phím khi chạm ngoài
  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: Color.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TouchableOpacity style={styles.container} activeOpacity={1} onPress={handleDismissKeyboard}>
        <CHeaderIcon
          label="Bài viết"
          IconLeft="arrow-back"
          onPressLeft={() => navigation.goBack()}
          onPressRight={() => {}}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Color.mainColor2} />
            <Text style={[styles.loadingText, { color: Color.textPrimary }]}>Đang tải...</Text>
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
            <Text style={[styles.loadingText, { color: Color.textPrimary }]}>Không thể tải bài viết</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeComments}
        style={styles.modal}
        backdropOpacity={0.5}
        onSwipeComplete={closeComments}
        swipeDirection={["down"]}
        propagateSwipe={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={[styles.commentContainer, { backgroundColor: Color.background }]}>
            <View style={styles.commentHeader}>
              <Text style={[styles.commentTitle, { color: Color.textPrimary }]}>
                {calculateTotalComments()} bình luận
              </Text>
              <TouchableOpacity onPress={closeComments}>
                <Ionicons name="close" size={24} color={Color.textPrimary} />
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

            {selectedMedia.length > 0 && (
              <View style={styles.mediaPreviewContainer}>
                {selectedMedia.map((media, index) => (
                  <Image key={index} source={{ uri: media.uri }} style={styles.mediaPreview} />
                ))}
              </View>
            )}

            <View
              style={[styles.commentInputContainer, { backgroundColor: Color.backgroundSecondary, borderColor: Color.border }]}
            >
              <TouchableOpacity onPress={pickMedia} activeOpacity={0.7}>
                <Ionicons name="image" size={24} color={Color.mainColor2} />
              </TouchableOpacity>
              <TextInput
                style={[styles.commentInput, { color: Color.textPrimary }]}
                placeholder="Viết bình luận..."
                placeholderTextColor={Color.textTertiary}
                value={newReply}
                onChangeText={setNewReply}
                multiline
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              {isCommentChecking ? (
                <ActivityIndicator size="small" color={Color.mainColor2} />
              ) : (
                <TouchableOpacity onPress={handleAddComment} activeOpacity={0.7}>
                  <Ionicons name="send" size={20} color={Color.mainColor2} />
                </TouchableOpacity>
              )}
            </View>
          </View>
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
  modalKeyboardAvoiding: {
    flex: 1,
    justifyContent: "flex-end",
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
  commentContainer: {
    height: SCREEN_HEIGHT * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 10,
    borderBottomColor: Color.border,
  },
  commentTitle: { fontSize: 18, fontWeight: "bold" },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  commentInput: { flex: 1, fontSize: 14, paddingHorizontal: 10, maxHeight: 100 },
  commentList: { flexGrow: 1, paddingBottom: 10 },
});