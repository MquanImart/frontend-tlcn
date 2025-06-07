// src/features/search/containers/SearchPost/PostSearch.tsx
import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import Post from "@/src/features/newfeeds/components/post/Post";
import { Article } from "@/src/features/newfeeds/interface/article";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";
import getColor from "@/src/styles/Color";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import usePost from "./usePost";

type PostSearchRouteProp = RouteProp<SearchStackParamList, "SearchPost">;

const colors = getColor();
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PostSearchProps {
  route: PostSearchRouteProp;
}

const PostSearch: React.FC<PostSearchProps> = ({ route }) => {
  const { textSearch } = route.params; // textSearch là mảng string, ví dụ: ["#vinper"] hoặc ["#vinperland"]
  const [articles, setArticles] = useState<Article[]>([]);
  const {
    getArticles,
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
    getUserId,
    userId,
    // setNewReply, // Hàm này đã có, không cần khai báo lại
    pickMedia,
    selectedMedia,
    recordView,
    currentPage,
    totalPages,
    loadingMore,
    loadMoreArticles,
    setCurrentPage, // Đảm bảo setCurrentPage có ở đây
  } = usePost(articles, setArticles);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    // Chỉ chạy khi userId hoặc textSearch thay đổi
    if (userId && textSearch && textSearch.length > 0) {
      console.log("useEffect triggered for textSearch:", textSearch);
      // Reset trạng thái bài viết và trang khi textSearch thay đổi
      setArticles([]); // Xóa bài viết cũ
      setCurrentPage(1); // Đặt lại về trang đầu tiên
      // Gọi API với hashtag mới
      getArticles(1, 5, textSearch);
    } else if (userId && (!textSearch || textSearch.length === 0)) {
      // Nếu không có textSearch (hashtag rỗng), thì xóa hết bài viết
      console.warn("textSearch is empty, clearing articles.");
      setArticles([]);
      setCurrentPage(1);
    }
  }, [userId, textSearch]); // Dependencies bao gồm textSearch để re-run khi nó thay đổi

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backGround }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        // Thêm onScroll để xử lý loadMore
        onScroll={({ nativeEvent }) => {
          if (loadingMore) return;
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 50; // 50px từ cuối
          if (isCloseToBottom && currentPage < totalPages) {
            loadMoreArticles();
          }
        }}
        scrollEventThrottle={400} // Tần suất gọi onScroll (ms)
      >
        {articles.length === 0 && !loadingMore ? ( // Hiển thị "Không tìm thấy" chỉ khi không có bài viết và không đang tải
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textColor3 }]}>
              {textSearch && textSearch.length > 0
                ? `Không tìm thấy bài viết nào cho ${textSearch.map((tag) => `#${tag}`).join(", ")}`
                : "Nhập từ khóa để tìm kiếm"}
            </Text>
          </View>
        ) : (
          articles.map((item) => (
            <Post
              key={item._id}
              userId={userId || ""}
              article={item}
              onCommentPress={() => openComments(item)}
              onLike={() => likeArticle(item._id, item.createdBy._id)}
              deleteArticle={deleteArticle}
              editArticle={editArticle}
            />
          ))
        )}
        {loadingMore && (
          <View style={styles.loadingMoreContainer}>
            <Text style={{ color: colors.textColor3 }}>Đang tải thêm bài viết...</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal và các phần khác giữ nguyên */}
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
            <View
              style={[styles.commentContainer, { backgroundColor: colors.backGround }]}
            >
              <View style={styles.commentHeader}>
                <Text style={[styles.commentTitle, { color: colors.textColor1 }]}>
                  {calculateTotalComments(currentArticle?.comments || [])} bình luận
                </Text>
                <TouchableOpacity onPress={closeComments}>
                  <Ionicons name="close" size={24} color={colors.textColor1} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.commentList}
                keyboardShouldPersistTaps="handled"
              >
                {(currentArticle?.comments || []).map((item) => (
                  <CommentItem
                    key={item._id}
                    userId={userId || ""}
                    comment={item}
                    onLike={likeComment}
                    onReply={replyToComment}
                  />
                ))}
              </ScrollView>

              {selectedMedia.length > 0 && (
                <View style={styles.mediaPreviewContainer}>
                  {selectedMedia.map((media, index) => (
                    <Image
                      key={index}
                      source={{ uri: media.uri }}
                      style={styles.mediaPreview}
                    />
                  ))}
                </View>
              )}

              <View style={styles.commentInputContainer}>
                <TouchableOpacity onPress={pickMedia}>
                  <Ionicons name="image" size={24} color={colors.mainColor1} />
                </TouchableOpacity>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Viết bình luận..."
                  placeholderTextColor={colors.textColor3}
                  value={newReply}
                  onChangeText={setNewReply}
                />
                <TouchableOpacity onPress={handleAddComment}>
                  <Ionicons name="send" size={20} color={colors.mainColor1} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// Styles (giữ nguyên, thêm styles.loadingMoreContainer nếu muốn)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
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
    borderBottomColor: colors.borderColor1,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentInputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderColor1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backGround,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.borderColor1,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textColor1,
    paddingHorizontal: 10,
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
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default PostSearch;