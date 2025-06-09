import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import usePostDialog from "@/src/features/newfeeds/components/PostDialog/usePostDialog";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import BubbleButton from "@/src/shared/components/bubblebutton/BubbleButton";
import ChatBubble from "@/src/shared/components/chatbubble/ChatBubble";
import { CHeaderIconNewFeed } from "@/src/shared/components/header/CHeaderIcon";
import CTabbar from "@/src/shared/components/tabbar/CTabbar";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import getColor from "@/src/styles/Color";
import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
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
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Modal from "react-native-modal";
import Post from "../../components/post/Post";
import PostDialog from "../../components/PostDialog/PostDialog";
import { Article } from "../../interface/article";

const Color = getColor();
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function NewFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const viewedArticles = useRef<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1); // Thêm state để quản lý trang hiện tại

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
        <ActivityIndicator size="large" color={Color.mainColor1} />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: Color.backGround }]}
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
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          minimumViewTime: 500,
        }}
        onEndReached={loadMoreArticles}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />

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
                  {calculateTotalComments(currentArticle?.comments || [])} bình luận
                </Text>
                <TouchableOpacity onPress={closeComments}>
                  <Ionicons name="close" size={24} color={Color.textColor1} />
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
                <TouchableOpacity onPress={pickMedia}>
                  <Ionicons name="image" size={24} color={Color.mainColor1} />
                </TouchableOpacity>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Viết bình luận..."
                  placeholderTextColor={Color.textColor3}
                  value={newReply}
                  onChangeText={setNewReply}
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
  container: {
    flex: 1,
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
    color: Color.textColor1,
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
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
});