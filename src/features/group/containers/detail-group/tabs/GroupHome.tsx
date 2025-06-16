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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Modal from "react-native-modal";
import { useGroupHome } from "./useGroupHome";
import { Image } from "expo-image";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
    selectedMedia,
    isCommentChecking,
    pickMedia,
  } = useNewFeed(articles, setArticles);

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
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
        <Text style={[styles.noArticlesText, { color: Color.textTertiary }]}>Chưa có bài viết nào</Text>
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

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeComments}
        style={styles.modal}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    maxHeight: 100,
  },
  noArticlesText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
  },
  footer: {
    padding: 10,
    alignItems: "center",
  },
  commentList: { flexGrow: 1, paddingBottom: 10 },
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