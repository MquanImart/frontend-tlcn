import env from "@/env";
import { Article, Comment, User } from "@/src/features/newfeeds/interface/article";
import { NewFeedParamList } from "@/src/shared/routes/NewFeedNavigation";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, FlatList } from "react-native";

type ArticleDetailNavigationProp = StackNavigationProp<NewFeedParamList, "ArticleDetail">;

const articlesClient = restClient.apiClient.service("apis/articles");
const commentsClient = restClient.apiClient.service("apis/comments");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export default function useArticleDetail(articleId: string, commentId?: string) {
  const navigation = useNavigation<ArticleDetailNavigationProp>();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isCommentChecking, setIsCommentChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [flatComments, setFlatComments] = useState<Comment[]>([]);
  const [hasOpenedModal, setHasOpenedModal] = useState(false); // Track if modal has been opened

  const commentListRef = useRef<FlatList>(null);

  // Flatten comments to include nested replies
  const flattenComments = useCallback((comments: Comment[]): Comment[] => {
    return comments.reduce((acc: Comment[], comment: Comment) => {
      acc.push(comment);
      if (comment.replyComment && comment.replyComment.length > 0) {
        acc.push(...flattenComments(comment.replyComment));
      }
      return acc;
    }, []);
  }, []);

  const getUserId = useCallback(async () => {
    try {
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("displayName");
      setUserId(id);
      setDisplayName(name);
      return id;
    } catch (error) {
      console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
      return null;
    }
  }, []);

  const retryRequest = async (fn: () => Promise<any>, retries = 5, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        console.warn(`Thử lại yêu cầu ${i + 1}/${retries}:`, error);
        if (i < retries - 1) {
          await new Promise((res) => setTimeout(res, delay * Math.pow(2, i)));
        } else {
          throw error;
        }
      }
    }
  };

  const checkTextContent = async (text: string): Promise<boolean> => {
    if (!text.trim()) return false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      const response = await retryRequest(() =>
        fetch(`${env.API_URL_CHECK_TOXIC}/check-text/`, {
          method: "POST",
          headers: {
            "X-API-Key": env.API_KEY_CHECK_TOXIC || "",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        })
      );
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
      }
      const data = await response.json();
      return data.contains_bad_word || Object.values(data.text_sensitivity || {}).some((v: any) => v.is_sensitive);
    } catch (error: any) {
      console.error("❌ Lỗi khi kiểm tra nội dung văn bản:", {
        message: error.message,
        status: error.response?.status,
        stack: error.stack,
      });
      if (error.name === "AbortError") {
        Alert.alert("Lỗi", "Kiểm tra văn bản bị hết thời gian (90 giây). Vui lòng thử lại!");
        return false;
      } else {
        Alert.alert("Lỗi", "Không thể kiểm tra nội dung văn bản. Vui lòng kiểm tra mạng và thử lại!");
        return true;
      }
    }
  };

  const checkMediaContent = async (mediaAssets: ImagePicker.ImagePickerAsset[]): Promise<boolean> => {
    if (!mediaAssets || mediaAssets.length === 0) return false;
    const imageAssets = mediaAssets.filter((media) => media.type === "image");
    if (imageAssets.length === 0) return false;

    for (const media of imageAssets) {
      if (media.fileSize && media.fileSize > 5 * 1024 * 1024) {
        Alert.alert("Lỗi", `Hình ảnh "${media.fileName || media.uri.split("/").pop()}" quá lớn, tối đa 5MB.`);
        return true;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      const formData = new FormData();
      for (const media of imageAssets) {
        const resizedUri = await ImageManipulator.manipulateAsync(
          media.uri,
          [{ resize: { width: 600 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        ).then((result) => result.uri);

        formData.append("files", {
          uri: resizedUri,
          name: media.fileName || resizedUri.split("/").pop(),
          type: media.mimeType || "image/jpeg",
        } as any);
      }

      const response = await retryRequest(() =>
        fetch(`${env.API_URL_CHECK_TOXIC}/check-image/`, {
          method: "POST",
          headers: {
            "X-API-Key": env.API_KEY_CHECK_TOXIC || "",
            "Connection": "keep-alive",
          },
          body: formData,
          signal: controller.signal,
        })
      );

      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}, Nội dung: ${errorText}`);
      }

      const data = await response.json();
      let sensitiveImageDetected = false;
      let sensitiveFilename = "";

      for (const resultItem of data.results) {
        const isImageSensitive = resultItem.image_result?.is_sensitive;
        const isTextSensitive =
          resultItem.text_result?.text_sensitivity &&
          Object.values(resultItem.text_result.text_sensitivity).some((v: any) => v.is_sensitive);

        if (isImageSensitive || isTextSensitive) {
          sensitiveImageDetected = true;
          sensitiveFilename = resultItem.filename;
          break;
        }
      }

      if (sensitiveImageDetected) {
        Alert.alert("Cảnh báo nội dung", `Hình ảnh "${sensitiveFilename}" chứa nội dung không phù hợp.`);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("❌ Lỗi khi kiểm tra nội dung hình ảnh:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      if (error.name === "AbortError") {
        Alert.alert("Lỗi", "Kiểm tra hình ảnh bị hết thời gian (90 giây). Vui lòng sử dụng hình ảnh nhỏ hơn!");
      } else {
        Alert.alert("Lỗi", "Không thể kiểm tra nội dung hình ảnh. Vui lòng kiểm tra mạng và thử lại!");
      }
      return true;
    }
  };

  const getArticleById = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await articlesClient.get(articleId);
      if (response.success) {
        const comments = await fetchComments(articleId);
        const articleWithComments = { ...response.data, comments };
        setCurrentArticle(articleWithComments);
        setFlatComments(flattenComments(comments));
        await recordView(articleId);
        return articleWithComments;
      } else {
        console.error("Lỗi khi lấy bài viết:", response.message);
        Alert.alert("Lỗi", response.message || "Không thể tải bài viết. Vui lòng thử lại!");
        return null;
      }
    } catch (error) {
      console.error("Lỗi khi gọi API lấy bài viết:", error);
      Alert.alert("Lỗi", "Không thể tải bài viết. Vui lòng thử lại!");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [articleId, flattenComments]);

  const fetchComments = async (articleId: string) => {
    try {
      const response = await articlesClient.get(`${articleId}/comments`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
      return [];
    }
  };

  const openComments = async () => {
    if (!currentArticle) {
      console.warn("Không thể mở bình luận: currentArticle chưa được thiết lập");
      return;
    }
    try {
      const comments = await fetchComments(currentArticle._id);
      const updatedArticle = { ...currentArticle, comments };
      setCurrentArticle(updatedArticle);
      setFlatComments(flattenComments(comments));
      setModalVisible(true);
      setHasOpenedModal(true); // Mark modal as opened
      if (commentId && flatComments.length > 0) {
        const commentIndex = flatComments.findIndex((comment: Comment) => comment._id === commentId);
        if (commentIndex !== -1 && commentListRef.current) {
          setTimeout(() => {
            try {
              commentListRef.current?.scrollToIndex({
                index: commentIndex,
                animated: true,
                viewPosition: 0.5,
              });
            } catch (error) {
              console.warn("Lỗi khi cuộn đến bình luận:", error);
            }
          }, 1000);
        } else {
          console.warn(`Không tìm thấy bình luận với ID ${commentId} trong bài viết ${currentArticle._id}`);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
      Alert.alert("Lỗi", "Không thể tải bình luận. Vui lòng thử lại!");
    }
  };

  const closeComments = () => {
    setModalVisible(false);
    setNewReply("");
    setSelectedMedia([]);
  };

  const likeComment = async (commentId: string) => {
    if (!userId) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để thích bình luận!");
      return;
    }
    try {
      const response = await commentsClient.patch(`${commentId}/like`, { userId });
      if (response.success && currentArticle) {
        const updatedComments = await fetchComments(currentArticle._id);
        const likedComment = updatedComments.find((c: Comment) => c._id === commentId);
        const currentComment = currentArticle.comments?.find((c) => c._id === commentId);
        const wasLikedBefore = currentComment?.emoticons?.includes(userId) || false;
        const isLikedNow = likedComment?.emoticons?.includes(userId) || false;
        if (likedComment && userId !== likedComment._iduser._id && !wasLikedBefore && isLikedNow) {
          try {
            await notificationsClient.create({
              senderId: userId,
              receiverId: likedComment._iduser._id,
              message: `đã thích bình luận của bạn`,
              status: "unread",
              articleId: currentArticle._id,
              commentId,
              relatedEntityType: "Comment",
            });
          } catch (error: any) {
            console.error("Lỗi khi gửi thông báo thích bình luận:", error);
          }
        }
        setCurrentArticle({ ...currentArticle, comments: updatedComments });
        setFlatComments(flattenComments(updatedComments));
      } else {
        Alert.alert("Lỗi", response.message || "Không thể thích bình luận. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.error("Lỗi khi thích bình luận:", error);
      Alert.alert("Lỗi", "Không thể thích bình luận. Vui lòng thử lại!");
    }
  };

  const likeArticle = async () => {
    if (!userId || !currentArticle) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để thích bài đăng!");
      return;
    }
    try {
      const response = await articlesClient.patch(`${currentArticle._id}/like`, { userId });
      if (response.success) {
        await recordLike(currentArticle._id);
        setCurrentArticle({ ...currentArticle, emoticons: response.data.emoticons as User[] });
        if (userId !== currentArticle.createdBy._id) {
          try {
            await notificationsClient.create({
              senderId: userId,
              receiverId: currentArticle.createdBy._id,
              message: `đã thích bài viết của bạn`,
              status: "unread",
              articleId: currentArticle._id,
              relatedEntityType: "Article",
            });
          } catch (error: any) {
            console.error("Lỗi khi gửi thông báo thích bài:", error);
          }
        }
      } else {
        Alert.alert("Lỗi", response.message || "Không thể thích bài viết. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.error("Lỗi khi thích bài viết:", error);
      Alert.alert("Lỗi", "Không thể thích bài viết. Vui lòng thử lại!");
    }
  };

  const handleAddComment = async () => {
    if (!currentArticle || !newReply.trim() || !userId) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung bình luận!");
      return;
    }
    setIsCommentChecking(true);
    try {
      const isTextSensitive = await checkTextContent(newReply.trim());
      if (isTextSensitive) {
        Alert.alert("Cảnh báo", "Bình luận chứa nội dung nhạy cảm. Vui lòng chỉnh sửa!");
        return;
      }
      if (selectedMedia.length > 0) {
        const isMediaSensitive = await checkMediaContent(selectedMedia);
        if (isMediaSensitive) {
          Alert.alert("Cảnh báo", "Hình ảnh chứa nội dung nhạy cảm. Vui lòng chọn khác!");
          return;
        }
      }
      const formData = new FormData();
      formData.append("_iduser", userId);
      formData.append("content", newReply.trim());
      formData.append("articleId", currentArticle._id);
      if (selectedMedia.length > 0) {
        const media = selectedMedia[0];
        formData.append("media", {
          uri: media.uri,
          type: media.mimeType || "application/octet-stream",
          name: `media_0.${media.uri.split(".").pop()}`,
        } as any);
      }
      const response = await commentsClient.create(formData);
      if (response.success) {
        const updatedComments = await fetchComments(currentArticle._id);
        setCurrentArticle({ ...currentArticle, comments: updatedComments });
        setFlatComments(flattenComments(updatedComments));
        if (userId !== currentArticle.createdBy._id) {
          try {
            await notificationsClient.create({
              senderId: userId,
              receiverId: currentArticle.createdBy._id,
              message: `đã bình luận bài viết`,
              status: "unread",
              articleId: currentArticle._id,
              commentId: response.data._id,
              relatedEntityType: "Comment",
            });
          } catch (error: any) {
            console.error("Lỗi khi gửi thông báo bình luận:", error);
          }
        }
        setNewReply("");
        setSelectedMedia([]);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể thêm bình luận. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.error("Lỗi khi thêm bình luận:", error);
      Alert.alert("Lỗi", "Không thể thêm bình luận. Vui lòng thử lại!");
    } finally {
      setIsCommentChecking(false);
    }
  };

  const replyToComment = async (parentCommentId: string, content: string) => {
    if (!currentArticle || !content.trim() || !userId) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung trả lời!");
      return;
    }
    setIsCommentChecking(true);
    try {
      const isTextSensitive = await checkTextContent(content.trim());
      if (isTextSensitive) {
        Alert.alert("Cảnh báo", "Trả lời chứa nội dung nhạy cảm. Vui lòng chỉnh sửa!");
        return;
      }
      if (selectedMedia.length > 0) {
        const isMediaSensitive = await checkMediaContent(selectedMedia);
        if (isMediaSensitive) {
          Alert.alert("Cảnh báo", "Hình ảnh chứa nội dung nhạy cảm. Vui lòng chọn khác!");
          return;
        }
      }
      const formData = new FormData();
      formData.append("_iduser", userId);
      formData.append("content", content.trim());
      formData.append("replyComment", parentCommentId);
      if (selectedMedia.length > 0) {
        const media = selectedMedia[0];
        formData.append("media", {
          uri: media.uri,
          type: media.mimeType || "application/octet-stream",
          name: `media_0.${media.uri.split(".").pop()}`,
        } as any);
      }
      const response = await commentsClient.create(formData);
      if (response.success) {
        const updatedComments = await fetchComments(currentArticle._id);
        const parentComment = updatedComments.find((c: Comment) => c._id === parentCommentId);
        if (parentComment && userId !== parentComment._iduser._id) {
          try {
            await notificationsClient.create({
              senderId: userId,
              receiverId: parentComment._iduser._id,
              message: `đã trả lời bình luận của bạn`,
              status: "unread",
              articleId: currentArticle._id,
              commentId: response.data._id,
              relatedEntityType: "Comment",
            });
          } catch (error: any) {
            console.error("Lỗi khi gửi thông báo trả lời:", error);
          }
        }
        setCurrentArticle({ ...currentArticle, comments: updatedComments });
        setFlatComments(flattenComments(updatedComments));
        setNewReply("");
        setSelectedMedia([]);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể trả lời bình luận. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.error("Lỗi khi trả lời bình luận:", error);
      Alert.alert("Lỗi", "Không thể trả lời bình luận. Vui lòng thử lại!");
    } finally {
      setIsCommentChecking(false);
    }
  };

  const deleteArticle = async () => {
    if (!currentArticle || !userId) return;
    try {
      await articlesClient.remove(currentArticle._id);
      Alert.alert("Thành công", "Xóa bài viết thành công!");
      navigation.goBack();
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
      Alert.alert("Lỗi", "Không thể xóa bài viết. Vui lòng thử lại!");
    }
  };

  const editArticle = async (
    articleId: string,
    newContent: string,
    newScope: string,
    newHashtags: string[]
  ): Promise<void> => {
    if (!currentArticle || !userId) return;
    try {
      const isContentToxic = await checkTextContent(newContent);
      if (isContentToxic) {
        Alert.alert("Nội dung không hợp lệ", "Nội dung bài viết chứa từ ngữ nhạy cảm hoặc không phù hợp. Vui lòng chỉnh sửa.");
        return;
      }
      const response = await articlesClient.patch(currentArticle._id, {
        content: newContent,
        scope: newScope,
        hashTag: newHashtags,
      });
      if (response.success) {
        setCurrentArticle({ ...currentArticle, content: newContent, scope: newScope, hashTag: newHashtags });
        Alert.alert("Thành công", "Cập nhật bài viết thành công!");
      } else {
        Alert.alert("Lỗi", "Không thể cập nhật bài viết. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      Alert.alert("Lỗi", "Không thể cập nhật bài viết. Vui lòng thử lại!");
    }
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedMedia(result.assets);
    }
  };

  const recordView = async (articleId: string) => {
    if (!userId) {
      console.warn("⚠️ userId không khả dụng");
      return;
    }
    if (!articleId || typeof articleId !== "string") {
      console.warn("⚠️ articleId không hợp lệ:", articleId);
      return;
    }
    try {
      const response = await restClient.apiClient.service("apis/history-article").create({
        idUser: userId,
        idArticle: articleId,
        action: "View",
      });
      if (!response.success) {
        console.error("Lỗi khi ghi lại lượt xem:", response.messages || response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API xem:", error);
    }
  };

  const recordLike = async (articleId: string) => {
    if (!userId) {
      console.warn("⚠️ userId không khả dụng");
      return;
    }
    if (!articleId || typeof articleId !== "string") {
      console.warn("⚠️ articleId không hợp lệ:", articleId);
      return;
    }
    try {
      const response = await restClient.apiClient.service("apis/history-article").create({
        idUser: userId,
        idArticle: articleId,
        action: "Like",
      });
      if (!response.success) {
        console.error("Lỗi khi ghi lại lượt thích:", response.messages || response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API thích:", error);
    }
  };

  // Initialize userId and article
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const id = await getUserId();
      if (!id) {
        Alert.alert(
          "Lỗi",
          "Vui lòng đăng nhập để xem bài viết!",
          [{ text: "OK" }],
          { cancelable: false }
        );
        setIsLoading(false);
        return;
      }
      await getArticleById();
    };
    initialize();
  }, [getUserId, getArticleById]);

  // Open comments modal only once when currentArticle is set and commentId exists
  useEffect(() => {
    if (currentArticle && commentId && !hasOpenedModal) {
      openComments();
    }
  }, [currentArticle, commentId, hasOpenedModal]);

  return {
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
    calculateTotalComments: () => calculateTotalComments(currentArticle?.comments || []),
    handleAddComment,
    deleteArticle,
    editArticle,
    pickMedia,
    commentListRef,
    flatComments,
  };
}

const calculateTotalComments = (comments: Comment[]): number => {
  return comments.reduce((total, comment) => {
    const replyCount = comment.replyComment?.length || 0;
    return total + 1 + replyCount;
  }, 0);
};