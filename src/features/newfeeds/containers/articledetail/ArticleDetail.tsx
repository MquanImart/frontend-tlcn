import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Image,
  Keyboard,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import getColor from "@/src/styles/Color";
import Post from "@/src/features/newfeeds/components/post/Post";
import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import { Article } from "@/src/features/newfeeds/interface/article";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import { NewFeedParamList } from "@/src/shared/routes/NewFeedNavigation";
import * as ImagePicker from "expo-image-picker";

const colors = getColor();
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type ArticleDetailNavigationProp = StackNavigationProp<NewFeedParamList, "ArticleDetail">;

interface RouteParams {
  articleId: string;
}

export default function ArticleDetail() {
  const navigation = useNavigation<ArticleDetailNavigationProp>();
  const route = useRoute();
  const { articleId } = route.params as RouteParams;
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);

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
    selectedMedia: newFeedSelectedMedia,
  } = useNewFeed(articles, setArticles);

  useEffect(() => {
    const fetchArticle = async () => {
      const result = await getArticles();
      if (result?.success) {
        setArticles(result.data);
      }
    };
    fetchArticle();
    getUserId();
  }, [articleId]);

  const handlePickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets);
    }
  };

  // Find the article to display
  const article = articles.find((a) => a._id === articleId);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.backGround }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <CHeaderIcon
        label={"Bài viết"}
        IconLeft={"arrow-back"}
        onPressLeft={() => navigation.goBack()}
        onPressRight={() => {}}
      />

      {article ? (
        <View style={styles.postContainer}>
          <Post
            article={article}
            userId={userId || ""}
            onCommentPress={() => openComments(article)}
            onLike={() => likeArticle(article._id, article.createdBy._id)}
            deleteArticle={deleteArticle}
            editArticle={editArticle}
          />
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textColor1 }]}>Đang tải...</Text>
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
                    userId={userId || ""}
                    comment={item}
                    onLike={likeComment}
                    onReply={replyToComment}
                  />
                )}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.commentList}
                keyboardShouldPersistTaps="handled"
              />

              {selectedMedia.length > 0 && (
                <View style={styles.mediaPreviewContainer}>
                  {selectedMedia.map((media, index) => (
                    <Image key={index} source={{ uri: media.uri }} style={styles.mediaPreview} />
                  ))}
                </View>
              )}

              <View style={styles.commentInputContainer}>
                <TouchableOpacity onPress={handlePickMedia}>
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
  post: {
    flex: 1, // Ensure Post component stretches to fill postContainer
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
});