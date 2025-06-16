import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import usePostDialog from "@/src/features/newfeeds/components/PostDialog/usePostDialog";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import BubbleButton from "@/src/shared/components/bubblebutton/BubbleButton";
import ChatBubble from "@/src/shared/components/chatbubble/ChatBubble";
import { CHeaderIconNewFeed } from "@/src/shared/components/header/CHeaderIcon";
import CTabbar from "@/src/shared/components/tabbar/CTabbar";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import { useTheme } from "@/src/contexts/ThemeContext";
import { colors as Color } from "@/src/styles/DynamicColors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
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
import Post from "../../components/post/Post";
import PostDialog from "../../components/PostDialog/PostDialog";
import { Article } from "../../interface/article";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function NewFeed() {
  useTheme();
  const [articles, setArticles] = useState<Article[]>([]);
  const viewedArticles = useRef<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

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
    changeScreen,
    getUserId,
    userId,
    setUserId,
    pickMedia,
    selectedMedia,
    recordView,
    totalPages,
    setTotalPages,
    loadingMore,
    loadMoreArticles,
    isCommentChecking,
  } = useNewFeed(articles, setArticles);

  const {
    isModalVisible: isPostDialogVisible,
    postContent,
    setPostContent,
    toggleModal: togglePostDialog,
    handlePost,
    privacy,
    setPrivacy,
    handlePickImage,
    handleTakePhoto,
    handleRemoveImage,
    selectedImages,
    hashtags,
    hashtagInput,
    setHashtagInput,
    handleAddHashtag,
    handleRemoveHashtag,
    isLoading,
    location,
    getCurrentLocation,
    handleMapPointSelect,
    clearLocation,
    openMapPicker,
    isLocationLoading,
    setPageID,
    setGroupID,
    MapPickerDialog,
    isMapPickerVisible,
    setMapPickerVisible,
  } = usePostDialog(userId || "");

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        if (articles.length === 0) {
          const result = await getArticles(1, 5);
          if (result?.success && result.data) {
            setArticles(result.data.articles);
          } else {
            console.error("Lỗi khi tải bài viết ban đầu:", result?.messages);
          }
        } else {
          console.log("NewFeed: Articles already loaded, skipping initial fetch.");
        }
      }
    };
    fetchData();
  }, [userId]);

  const { tabbarPosition, handleScroll } = useScrollTabbar();

  const handleViewableItemsChanged = ({ viewableItems }: { viewableItems: any[] }) => {
    viewableItems.forEach((item) => {
      const articleId = item.item._id;
      if (!viewedArticles.current.has(articleId) && userId) {
        viewedArticles.current.add(articleId);
        recordView(articleId);
      }
    });
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="large" color={Color.mainColor2} />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: Color.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <CHeaderIconNewFeed
        label={"Bảng tin"}
        IconLeft={"search"}
        onPressLeft={() => changeScreen("SearchNavigation")}
        IconRight={"message"}
        onPressRight={() => changeScreen("MessageNavigation")}
      />
      <FlatList
        data={articles}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Post
            article={item}
            userId={userId || ""}
            onCommentPress={() => openComments(item)}
            onLike={() => likeArticle(item._id, item.createdBy._id)}
            deleteArticle={deleteArticle}
            editArticle={editArticle}
          />
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50, minimumViewTime: 500 }}
        onEndReached={loadMoreArticles}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        extraData={articles} 
      />

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
            <View style={styles.commentHeader}>
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

      <BubbleButton onPress={togglePostDialog} />

      <PostDialog
        isModalVisible={isPostDialogVisible}
        postContent={postContent}
        setPostContent={setPostContent}
        toggleModal={togglePostDialog}
        handlePost={handlePost}
        privacy={privacy}
        setPrivacy={setPrivacy}
        handlePickImage={handlePickImage}
        handleTakePhoto={handleTakePhoto}
        handleRemoveImage={handleRemoveImage}
        selectedImages={selectedImages.map((media) => media.uri)}
        hashtags={hashtags}
        setHashtagInput={setHashtagInput}
        handleAddHashtag={handleAddHashtag}
        handleRemoveHashtag={handleRemoveHashtag}
        hashtagInput={hashtagInput}
        isLoading={isLoading}
        location={location}
        handleMapPointSelect={handleMapPointSelect}
        getCurrentLocation={getCurrentLocation}
        clearLocation={clearLocation}
        isLocationLoading={isLocationLoading}
        MapPickerDialog={MapPickerDialog}
        isMapPickerVisible={isMapPickerVisible}
        openMapPicker={openMapPicker}
        setMapPickerVisible={setMapPickerVisible}
      />

      <CTabbar tabbarPosition={tabbarPosition} startTab="newsfeed" />
      <ChatBubble />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modal: { justifyContent: "flex-end", margin: 0 },
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
  mediaPreviewContainer: { flexDirection: "row", flexWrap: "wrap", marginVertical: 10 },
  mediaPreview: { width: 50, height: 50, marginRight: 10, borderRadius: 5 },
  loadingFooter: { paddingVertical: 20, alignItems: "center" },
});