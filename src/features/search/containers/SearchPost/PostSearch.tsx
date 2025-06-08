// src/features/search/containers/SearchPost/PostSearch.tsx
import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import Post from "@/src/features/newfeeds/components/post/Post";
import { Article } from "@/src/features/newfeeds/interface/article";
import CIconButton from "@/src/shared/components/button/CIconButton";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";
import getColor from "@/src/styles/Color";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import debounce from "lodash.debounce";
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
type PostSearchNavigationProp = StackNavigationProp<SearchStackParamList, "SearchPost">;

const colors = getColor();
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PostSearchProps {
  route: PostSearchRouteProp;
}

const PostSearch: React.FC<PostSearchProps> = ({ route }) => {
  const navigation = useNavigation<PostSearchNavigationProp>();
  const { textSearch: initialTextSearch } = route.params;
  const [searchText, setSearchText] = useState<string>(
    initialTextSearch && initialTextSearch.length > 0
      ? initialTextSearch.join(" ") 
      : ""
  );
  const [articles, setArticles] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
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
    pickMedia,
    selectedMedia,
    recordView,
    currentPage,
    totalPages,
    loadingMore,
    loadMoreArticles,
    setCurrentPage,
  } = usePost(articles, setArticles);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId && initialTextSearch && initialTextSearch.length > 0) {
      setArticles([]);
      setCurrentPage(1);
      setIsSearching(true);
      getArticles(1, 5, initialTextSearch).then(() => setIsSearching(false));
    }
  }, [userId, initialTextSearch]);

  const handleSearchSubmit = debounce(async () => {
    if (searchText.trim() === "") {
      setArticles([]);
      setCurrentPage(1);
      setIsSearching(false);
      return;
    }

    const words = searchText
      .split(" ")
      .filter((word) => word.startsWith("#") && word.length > 1)

    if (words.length > 0) {
      setArticles([]);
      setCurrentPage(1);
      setIsSearching(true);
      await getArticles(1, 5, words);
      setIsSearching(false);
    } else {
      setArticles([]);
      setIsSearching(false);
    }
  }, 500);

  const handleClearSearch = () => {
    setSearchText("");
    setArticles([]);
    setCurrentPage(1);
    setIsSearching(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backGround }]}>
      <View style={styles.containerSearch}>
        <CIconButton
          icon={<Ionicons name="arrow-back" size={24} color="#000" />}
          onSubmit={() => navigation.goBack()}
          style={{
            width: 40,
            height: 50,
            backColor: colors.white_homologous,
            textColor: colors.white_contrast,
            fontSize: 16,
            fontWeight: "normal",
            radius: 0,
            flex_direction: "row",
          }}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm bài viết bằng hashtag"
            placeholderTextColor="#000"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => handleSearchSubmit()}
          />
          {searchText.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
              <Ionicons name="close" size={20} color="#000" />
            </TouchableOpacity>
          )}
        </View>
        <CIconButton
          icon={<Ionicons name="search" size={24} color="#000" />}
          onSubmit={() => handleSearchSubmit()}
          style={{
            width: 50,
            height: 50,
            backColor: colors.white_homologous,
            textColor: colors.white_contrast,
            fontSize: 16,
            fontWeight: "normal",
            radius: 20,
            flex_direction: "row",
          }}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={({ nativeEvent }) => {
          if (loadingMore || isSearching) return;
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
          if (isCloseToBottom && currentPage < totalPages) {
            loadMoreArticles();
          }
        }}
        scrollEventThrottle={400}
      >
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <Text style={{ color: colors.textColor3 }}>Đang tìm kiếm...</Text>
          </View>
        ) : articles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textColor3 }]}>
              {searchText.trim()
                ? `Không tìm thấy bài viết nào cho ${searchText}`
                : "Nhập hashtag để tìm kiếm"}
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
            <View style={[styles.commentContainer, { backgroundColor: colors.backGround }]}>
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
                    <Image key={index} source={{ uri: media.uri }} style={styles.mediaPreview} />
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  containerSearch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white_homologous,
    borderRadius: 25,
    margin: 10,
    paddingHorizontal: 5,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backGround2,
    borderRadius: 25,
    position: "relative",
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingLeft: 10,
    borderRadius: 20,
    paddingRight: 40,
    backgroundColor: colors.backGround2,
  },
  clearButton: {
    position: "absolute",
    right: 5,
    padding: 10,
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
  loadingContainer: {
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
    alignItems: "center",
  },
});

export default PostSearch;