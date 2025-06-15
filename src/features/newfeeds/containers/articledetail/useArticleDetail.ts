// useArticleDetail.ts
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
import { Alert, FlatList, Keyboard } from "react-native";

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
  const [hasOpenedModal, setHasOpenedModal] = useState(false);

  const commentListRef = useRef<FlatList>(null);

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

  const checkTextContent = async (text: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000); // Timeout 10s

      const response = await fetch(`${env.API_URL_CHECK_TOXIC}/check-text/`, {
        method: "POST",
        headers: {
          "X-API-Key": env.API_KEY_CHECK_TOXIC || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.contains_bad_word || false;
    } catch (error: any) {
      console.error("❌ Lỗi kiểm tra văn bản:", error.message, error.stack);
      if (error.name === "AbortError") {
        Alert.alert("Lỗi", "Yêu cầu kiểm tra văn bản hết thời gian. Vui lòng thử lại!");
      } else {
        Alert.alert("Lỗi", "Không thể kiểm tra nội dung văn bản. Vui lòng kiểm tra kết nối mạng và thử lại!");
      }
      return true; // Coi là nhạy cảm để an toàn
    }
  };

  // Hàm kiểm tra hình ảnh
  const checkMediaContent = async (mediaAssets: ImagePicker.ImagePickerAsset[]): Promise<boolean> => {
    if (!mediaAssets || mediaAssets.length === 0) return false;

    const imageAssets = mediaAssets.filter((media) => media.type === "image");

    if (imageAssets.length === 0) return false;

    for (const media of imageAssets) {
      if (media.fileSize && media.fileSize > 5 * 1024 * 1024) {
        Alert.alert("Lỗi", `Ảnh "${media.fileName || media.uri.split("/").pop()}" quá lớn, tối đa 5MB.`);
        return true;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000); // 3 seconds timeout

      const formData = new FormData();
      for (const media of imageAssets) {
        const resizedUri = await ImageManipulator.manipulateAsync(
          media.uri,
          [{ resize: { width: 600 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        ).then((result) => result.uri);

        formData.append("files", { // Notice 'files' here, plural
          uri: resizedUri,
          name: media.fileName || resizedUri.split("/").pop(),
          type: media.mimeType || "image/jpeg",
        } as any);
      }
      
      const response = await fetch(`${env.API_URL_CHECK_TOXIC}/check-image/`, {
        method: "POST",
        headers: {
          "X-API-Key": env.API_KEY_CHECK_TOXIC || "",
          "Connection": "keep-alive", // This is fine
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
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
        Alert.alert("Cảnh báo nội dung nhạy cảm", `Ảnh "${sensitiveFilename}" chứa nội dung không phù hợp.`);
        return true;
      }

      return false;
    } catch (error: any) {
      if (error.name === "AbortError") {
        Alert.alert("Lỗi", "Hết thời gian kiểm tra hình ảnh (3s). Vui lòng dùng ảnh nhỏ hơn!"); // Update timeout message
      } else {
        Alert.alert("Lỗi", "Không thể kiểm tra nội dung ảnh. Vui lòng kiểm tra kết nối mạng và thử lại!");
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
  }, [articleId]);

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
      setModalVisible(true);
      setHasOpenedModal(true);
      if (commentId && comments.length > 0) {
        // Tìm chỉ số bình luận (bao gồm bình luận con) để cuộn đến
        const findCommentIndex = (comments: Comment[], targetId: string, currentIndex: number = 0): number => {
          for (const comment of comments) {
            if (comment._id === targetId) return currentIndex;
            if (comment.replyComment && comment.replyComment.length > 0) {
              const foundIndex = findCommentIndex(comment.replyComment, targetId, currentIndex + 1);
              if (foundIndex !== -1) return foundIndex;
            }
            currentIndex += 1 + (comment.replyComment?.length || 0);
          }
          return -1;
        };
        const commentIndex = findCommentIndex(comments, commentId);
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
    Keyboard.dismiss();
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
          } catch (error) {
            console.error("Lỗi khi gửi thông báo thích bình luận:", error);
          }
        }
        setCurrentArticle({ ...currentArticle, comments: updatedComments });
      } else {
        Alert.alert("Lỗi", response.message || "Không thể thích bình luận. Vui lòng thử lại!");
      }
    } catch (error) {
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
          } catch (error) {
            console.error("Lỗi khi gửi thông báo thích bài:", error);
          }
        }
      } else {
        Alert.alert("Lỗi", response.message || "Không thể thích bài viết. Vui lòng thử lại!");
      }
    } catch (error) {
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
          type: media.mimeType || "image/jpeg",
          name: `media_${Date.now()}.${media.uri.split(".").pop() || "jpg"}`,
        } as any);
      }
      const response = await commentsClient.create(formData);
      if (response.success) {
        const updatedComments = await fetchComments(currentArticle._id);
        setCurrentArticle({ ...currentArticle, comments: updatedComments });
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
          } catch (error) {
            console.error("Lỗi khi gửi thông báo bình luận:", error);
          }
        }
        setNewReply("");
        setSelectedMedia([]);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể thêm bình luận. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
      Alert.alert("Lỗi", "Không thể thêm bình luận. Vui lòng thử lại!");
    } finally {
      setIsCommentChecking(false);
    }
  };

  const replyToComment = async (parentCommentId: string, content: string, media?: ImagePicker.ImagePickerAsset[]) => {
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
      if (media && media.length > 0) {
        const isMediaSensitive = await checkMediaContent(media);
        if (isMediaSensitive) {
          Alert.alert("Cảnh báo", "Hình ảnh chứa nội dung nhạy cảm. Vui lòng chọn khác!");
          return;
        }
      }
      const formData = new FormData();
      formData.append("_iduser", userId);
      formData.append("content", content.trim());
      formData.append("replyComment", parentCommentId);
      formData.append("articleId", currentArticle._id);
      if (media && media.length > 0) {
        const selectedMedia = media[0];
        formData.append("media", {
          uri: selectedMedia.uri,
          type: selectedMedia.mimeType || "image/jpeg",
          name: `media_${Date.now()}.${selectedMedia.uri.split(".").pop() || "jpg"}`,
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
          } catch (error) {
            console.error("Lỗi khi gửi thông báo trả lời:", error);
          }
        }
        setCurrentArticle({ ...currentArticle, comments: updatedComments });
        setNewReply("");
        setSelectedMedia([]);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể trả lời bình luận. Vui lòng thử lại!");
      }
    } catch (error) {
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
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: false,
        quality: 1,
      });
      if (!result.canceled && result.assets) {
        setSelectedMedia(result.assets);
      }
    } catch (error) {
      console.error("Lỗi khi chọn media:", error);
      Alert.alert("Lỗi", "Không thể chọn hình ảnh. Vui lòng thử lại!");
    }
  };

  const recordView = async (articleId: string) => {
    if (!userId || !articleId || typeof articleId !== "string") {
      console.warn("userId hoặc articleId không hợp lệ");
      return;
    }
    try {
      const response = await restClient.apiClient.service("apis/history-article").create({
        idUser: userId,
        idArticle: articleId,
        action: "View",
      });
      if (!response.success) {
        console.error("Lỗi khi ghi lại lượt xem:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API xem:", error);
    }
  };

  const recordLike = async (articleId: string) => {
    if (!userId || !articleId || typeof articleId !== "string") {
      console.warn("userId hoặc articleId không hợp lệ");
      return;
    }
    try {
      const response = await restClient.apiClient.service("apis/history-article").create({
        idUser: userId,
        idArticle: articleId,
        action: "Like",
      });
      if (!response.success) {
        console.error("Lỗi khi ghi lại lượt thích:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API thích:", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const id = await getUserId();
      if (!id) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để xem bài viết!", [{ text: "OK" }], { cancelable: false });
        setIsLoading(false);
        return;
      }
      await getArticleById();
    };
    initialize();
  }, [getUserId, getArticleById]);

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
  };
}

const calculateTotalComments = (comments: Comment[]): number => {
  return comments.reduce((total, comment) => {
    const replyCount = comment.replyComment?.length || 0;
    return total + 1 + replyCount;
  }, 0);
};