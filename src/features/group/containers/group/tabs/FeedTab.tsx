import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import Post from "@/src/features/newfeeds/components/post/Post";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors'; // Đảm bảo import đúng
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions, // Import Dimensions
  KeyboardAvoidingView, // Import KeyboardAvoidingView
  Platform, // Import Platform
} from "react-native";
import Modal from "react-native-modal";
import { useFeed } from "./useFeed";
import { Image } from "expo-image"; // Import Image for media preview

const { height: SCREEN_HEIGHT } = Dimensions.get("window"); // Get screen height

interface FeedTabProps {
  userId: string;
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any } } }) => void;
}

const FeedTab = ({ userId, handleScroll }: FeedTabProps) => {
  useTheme(); // Kích hoạt theme context
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
    selectedMedia, // Add selectedMedia
    isCommentChecking, // Add isCommentChecking
    pickMedia, // Add pickMedia
  } = useNewFeed(articleGroups, setArticleGroups); // Assuming these are now part of useNewFeed's return

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: Color.background }]}>
        <Text style={[styles.emptyText, { color: Color.textSecondary }]}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: Color.background }]}>
        <Text style={[styles.emptyText, { color: Color.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
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
              <ActivityIndicator size="large" color={Color.mainColor2} />
            </View>
          ) : null
        }
      />
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeComments}
        style={styles.modal}
        backdropOpacity={0.5}
        animationIn="slideInUp" // Add animation
        animationOut="slideOutDown" // Add animation
        useNativeDriver={true} // Add useNativeDriver
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Adjust offset as needed
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
                  userId={userId}
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

            {/* Media preview section */}
            {selectedMedia && selectedMedia.length > 0 && (
              <View style={styles.mediaPreviewContainer}>
                {selectedMedia.map((media, index) => (
                  <Image key={index} source={{ uri: media.uri }} style={styles.mediaPreview} />
                ))}
              </View>
            )}

            <View
              style={[
                styles.commentInputContainer,
                {
                  backgroundColor: Color.backgroundSecondary,
                  borderColor: Color.border,
                },
              ]}
            >
              <TouchableOpacity onPress={pickMedia} activeOpacity={0.7}>
                <Ionicons name="image" size={24} color={Color.mainColor2} />
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    color: Color.textPrimary,
                  },
                ]}
                placeholder="Viết bình luận..."
                placeholderTextColor={Color.textTertiary}
                value={newReply}
                onChangeText={setNewReply}
                multiline // Allow multiline input
                onSubmitEditing={() => Keyboard.dismiss()} // Dismiss keyboard on submit
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
    fontStyle: "italic",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  commentContainer: {
    height: SCREEN_HEIGHT * 0.6, // Adjusted height
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    maxHeight: SCREEN_HEIGHT * 0.8, // Added maxHeight
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
    borderRadius: 20, // Added border radius
    paddingHorizontal: 14, // Adjusted padding
    paddingVertical: 10, // Adjusted padding
    borderWidth: 1, // Added border width
    marginTop: 10, // Added margin top
  },
  commentInput: {
    flex: 1,
    fontSize: 14, // Adjusted font size
    paddingHorizontal: 10, // Adjusted padding
    maxHeight: 100, // Added max height
  },
  footer: {
    padding: 10,
    alignItems: "center",
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