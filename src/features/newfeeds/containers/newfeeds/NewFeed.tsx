import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image, // Thêm Image để hiển thị ảnh/video
} from "react-native";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import Post from "../../components/post/Post";
import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import getColor from "@/src/styles/Color";
import BubbleButton from "@/src/shared/components/bubblebutton/BubbleButton";
import usePostDialog from "@/src/features/newfeeds/components/PostDialog/usePostDialog";
import PostDialog from "../../components/PostDialog/PostDialog";
import CTabbar from "@/src/shared/components/tabbar/CTabbar";
import { Article } from "../../interface/article";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import ChatBubble from "@/src/shared/components/chatbubble/ChatBubble";

const colors = getColor();
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function NewFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const viewedArticles = useRef<Set<string>>(new Set()); //
  
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
    recordView
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
    getUserId();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getArticles();
      if (result?.success) {
        setArticles(result.data);
      }
    };
    fetchData();
  }, []);

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


  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.backGround }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <CHeaderIcon
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
        onViewableItemsChanged={handleViewableItemsChanged} // Thêm prop này
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          minimumViewTime: 500, 
        }}
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

              {/* Hiển thị ảnh/video đã chọn */}
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
        MapPickerDialog = {MapPickerDialog}
        isMapPickerVisible = {isMapPickerVisible}
        openMapPicker = {openMapPicker}
        setMapPickerVisible = {setMapPickerVisible}
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

// Removed incorrect custom useRef implementation
