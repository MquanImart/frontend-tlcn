import env from "@/env";
import { Article, Comment, User } from "@/src/features/newfeeds/interface/article";
import { NewFeedParamList } from "@/src/shared/routes/NewFeedNavigation";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

type NewFeedNavigationProp = StackNavigationProp<NewFeedParamList, "NewFeed">;

const articlesClient = restClient.apiClient.service("apis/articles");
const commentsClient = restClient.apiClient.service("apis/comments");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export default function useNewFeed(
  articles: Article[],
  setArticles: (articles: Article[] | ((prevArticles: Article[]) => Article[])) => void
) {
  const navigation = useNavigation<NewFeedNavigationProp>();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [newReply, setNewReply] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isCommentChecking, setIsCommentChecking] = useState(false);

    const checkTextContent = async (text: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout 10s

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
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout

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

  const getUserId = async () => {
    const id = await AsyncStorage.getItem("userId");
    const name = await AsyncStorage.getItem("displayName");
    setUserId(id);
    setDisplayName(name);
  };
  
  useEffect(() => {
    getUserId();
  }, []);

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

  const fetchComments = async (articleId: string) => {
    try {
      const response = await articlesClient.get(`${articleId}/comments`);
      return response.success ? response.data : [];
    } catch (error) {
      return [];
    }
  };

  const openComments = async (article: Article) => {
    try {
      const comments = await fetchComments(article._id);
      setCurrentArticle({ ...article, comments });
      setModalVisible(true);
    } catch (error) {
    }
  };

  const closeComments = () => {
    setModalVisible(false);
    setCurrentArticle(null);
    setSelectedMedia([]);
  };

  const likeComment = async (commentId: string) => {
    if (!userId) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để thích bình luận!");
      return;
    }
    try {
      const response = await commentsClient.patch(`${commentId}/like`, { userId });
      if (response.success) {
        if (currentArticle) {
          const updatedComments = await fetchComments(currentArticle._id);
          const likedComment = updatedComments.find((c: Comment) => c._id === commentId);
          const currentComment = currentArticle.comments?.find((c) => c._id === commentId);
          const wasLikedBefore = currentComment?.emoticons?.includes(userId) || false;
          const isLikedNow = likedComment?.emoticons?.includes(userId) || false;
          if (likedComment && userId !== likedComment._iduser._id && !wasLikedBefore && isLikedNow) {
            try {
              const notificationMessage = `đã yêu thích bình luận của bạn`;
              await notificationsClient.create({
                senderId: userId,
                receiverId: likedComment._iduser._id,
                message: notificationMessage,
                status: "unread",
                articleId: currentArticle._id,
                commentId: commentId,
                relatedEntityType: "Comment", 
              });
            } catch (notificationError: any) {
            }
          }
          setCurrentArticle({ ...currentArticle, comments: updatedComments });
        }
      } else {
        Alert.alert("Lỗi", response.message || "Không thể thích bình luận. Vui lòng thử lại!");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi thích bình luận. Vui lòng thử lại!");
    }
  };

  const likeArticle = async (articleId: string, articleOwner: string) => {
    if (!userId) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để thích bài viết!");
      return;
    }

    try {
      const response = await articlesClient.patch(`${articleId}/like`, { userId });
      if (response.success) {
        recordLike(articleId);
        setArticles((prevArticles) =>
          prevArticles.map((article) =>
            article._id === articleId
              ? { ...article, emoticons: response.data.emoticons as User[] }
              : article
          )
        );
        if (currentArticle?._id === articleId) {
          setCurrentArticle({ ...currentArticle, emoticons: response.data.emoticons as User[] });
        }
        if (userId !== articleOwner) {
          try {
            const notificationMessage = `đã thích bài viết của bạn`;
            await notificationsClient.create({
              senderId: userId,
              receiverId: articleOwner,
              message: notificationMessage,
              status: "unread",
              articleId,
              relatedEntityType: "Article",
            });
          } catch (notificationError: any) {
          }
        }
      } else {
        Alert.alert("Lỗi", response.message || "Không thể thích bài viết. Vui lòng thử lại!");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi thích bài viết. Vui lòng thử lại!");
    }
  };

  const calculateTotalComments = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      const replyCount = comment.replyComment?.length || 0;
      return total + 1 + replyCount;
    }, 0);
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
        Alert.alert("Cảnh báo", "Nội dung bình luận có chứa thông tin nhạy cảm. Vui lòng chỉnh sửa!");
        return;
      }
      if (selectedMedia.length > 0) {
        const isMediaSensitive = await checkMediaContent(selectedMedia);
        if (isMediaSensitive) {
          Alert.alert("Cảnh báo", "Hình ảnh chứa nội dung nhạy cảm. Vui lòng chọn ảnh khác!");
          return;
        }
      }
      const formData = new FormData();
      formData.append("_iduser", userId);
      formData.append("content", newReply.trim());
      formData.append("articleId", currentArticle._id);
      if (selectedMedia.length > 0) {
        const media = selectedMedia[0];
        const file = {
          uri: media.uri,
          type: media.mimeType || "application/octet-stream",
          name: `media_0.${media.uri.split(".").pop()}`,
        };
        formData.append("media", file as any);
      }
      const response = await commentsClient.create(formData);
      if (response.success) {
        const updatedComments = await fetchComments(currentArticle._id);
        setCurrentArticle({ ...currentArticle, comments: updatedComments });
        if (userId !== currentArticle.createdBy._id) {
          try {
            const notificationMessage = `đã bình luận bài viết của bạn`;
            await notificationsClient.create({
              senderId: userId,
              receiverId: currentArticle.createdBy._id,
              message: notificationMessage,
              status: "unread",
              articleId: currentArticle._id, 
              commentId: response.data._id, 
              relatedEntityType: "Comment",
            });
          } catch (notificationError: any) {
          }
        }
        setNewReply("");
        setSelectedMedia([]);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể thêm bình luận. Vui lòng thử lại!");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi bình luận. Vui lòng thử lại!");
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
        Alert.alert("Cảnh báo", "Nội dung trả lời có chứa thông tin nhạy cảm. Vui lòng chỉnh sửa!");
        return;
      }
      if (selectedMedia.length > 0) {
        const isMediaSensitive = await checkMediaContent(selectedMedia);
        if (isMediaSensitive) {
          Alert.alert("Cảnh báo", "Hình ảnh chứa nội dung nhạy cảm. Vui lòng chọn ảnh khác!");
          return;
        }
      }
      const formData = new FormData();
      formData.append("_iduser", userId);
      formData.append("content", content.trim());
      formData.append("replyComment", parentCommentId);
      if (selectedMedia.length > 0) {
        const media = selectedMedia[0];
        const file = {
          uri: media.uri,
          type: media.mimeType || "application/octet-stream",
          name: `media_0.${media.uri.split(".").pop()}`,
        };
        formData.append("media", file as any);
      }
      const response = await commentsClient.create(formData);
      if (response.success) {
        const updatedComments = await fetchComments(currentArticle._id);
        const parentComment = updatedComments.find((c: Comment) => c._id === parentCommentId);
        if (parentComment && userId !== parentComment._iduser._id) {
          try {
            const notificationMessage = `đã trả lời bình luận của bạn`;
            await notificationsClient.create({
              senderId: userId,
              receiverId: parentComment._iduser._id,
              message: notificationMessage,
              status: "unread",
              articleId: currentArticle._id, 
              commentId: response.data._id, 
              relatedEntityType: "Comment",
            });
          } catch (notificationError: any) {
          }
        }
        setCurrentArticle({ ...currentArticle, comments: updatedComments });
        setNewReply("");
        setSelectedMedia([]);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể trả lời bình luận. Vui lòng thử lại!");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi trả lời. Vui lòng thử lại!");
    } finally {
      setIsCommentChecking(false);
    }
  };

  const deleteArticle = async (articleId: string) => {
    try {
      await articlesClient.remove(articleId);
      setArticles((prevArticles) => prevArticles.filter((article) => article._id !== articleId));
      if (currentArticle?._id === articleId) {
        setCurrentArticle(null);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi xóa bài viết. Vui lòng thử lại!");
    }
  };

  const editArticle = async (articleId: string, newContent: string, newScope: string, newHashtags: string[]) => {
    try {
      const isContentToxic = await checkTextContent(newContent);
      if (isContentToxic) {
        Alert.alert(
          "Nội dung không hợp lệ",
          "Nội dung bài viết chứa từ ngữ không phù hợp hoặc nhạy cảm. Vui lòng chỉnh sửa lại."
        );
        return;
      }
      const response = await articlesClient.patch(articleId, {
        content: newContent,
        scope: newScope,
        hashTag: newHashtags,
      });
      if (response.success) {
        setArticles((prevArticles) =>
          prevArticles.map((article) =>
            article._id === articleId
              ? { ...article, content: newContent, scope: newScope, hashTag: newHashtags }
              : article
          )
        );
        if (currentArticle?._id === articleId) {
          setCurrentArticle({ ...currentArticle, content: newContent, scope: newScope, hashTag: newHashtags });
        }
        Alert.alert("Thành công", "Bài viết đã được cập nhật!");
      } else {
        Alert.alert("Lỗi", "Không thể cập nhật bài viết. Vui lòng thử lại!");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi cập nhật bài viết. Vui lòng thử lại!");
    }
  };

  const createArticle = async (
    content: string,
    scope: string,
    hashtags: string[],
    mediaAssets: ImagePicker.ImagePickerAsset[] = []
  ) => {
    if (!userId) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để tạo bài viết!");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung bài viết!");
      return;
    }
    try {
      const isTextSensitive = await checkTextContent(content.trim());
      if (isTextSensitive) {
        Alert.alert("Cảnh báo", "Nội dung bài viết có chứa thông tin nhạy cảm. Vui lòng chỉnh sửa!");
        return;
      }
      if (mediaAssets.length > 0) {
        const isMediaSensitive = await checkMediaContent(mediaAssets);
        if (isMediaSensitive) {
          Alert.alert("Cảnh báo", "Hình ảnh chứa nội dung nhạy cảm. Vui lòng chọn ảnh khác!");
          return;
        }
      }
      const formData = new FormData();
      formData.append("_iduser", userId);
      formData.append("content", content.trim());
      formData.append("scope", scope);
      formData.append("hashTag", JSON.stringify(hashtags));
      if (mediaAssets.length > 0) {
        const media = mediaAssets[0];
        const file = {
          uri: media.uri,
          type: media.mimeType || "application/octet-stream",
          name: `media_0.${media.uri.split(".").pop()}`,
        };
        formData.append("media", file as any);
      }
      const response = await articlesClient.create(formData);
      if (response.success) {
        const newArticle = response.data;
        setArticles((prevArticles) => [newArticle, ...prevArticles]);
        setSelectedMedia([]);
        navigation.navigate("ArticleDetail", { articleId: newArticle._id });
      } else {
        Alert.alert("Lỗi", response.message || "Không thể tạo bài viết. Vui lòng thử lại!");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo bài viết. Vui lòng thử lại!");
    }
  };

  const getArticles = useCallback(async (page: number = 1, limit: number = 5) => {
    if (loadingMore) {
      return { success: false, messages: "Đang tải dữ liệu" };
    }
    setLoadingMore(true); 

  try {
    if (!userId) {
      return { success: false, messages: "Lỗi: userId không tồn tại" };
    }


    const recommendationsClientWithUser = restClient.apiClient.service(`apis/recommendations/${userId}`);
    const result = await recommendationsClientWithUser.find({
        page,
        limit,
    });

    if (result.success) {
      setCurrentPage(result.data.currentPage);
      setTotalPages(result.data.totalPages);

      return {
        success: true,
        data: {
          articles: result.data.articles,
          currentPage: result.data.currentPage,
          totalPages: result.data.totalPages,
        },
      };
    } else {
      return { success: false, messages: result.messages || "Lỗi khi lấy bài viết" };
    }
  } catch (error: any) {
    return { success: false, messages: error.message || "Lỗi kết nối với server" };
  } finally {
    setLoadingMore(false);
  }
}, [userId, loadingMore]);

  const getArticleById = async (articleId: string) => {
    try {
      const response = await articlesClient.get(articleId);
      if (response.success) {
        const comments = await fetchComments(articleId);
        const articleWithComments = { ...response.data, comments };
        setCurrentArticle(articleWithComments);
        recordView(articleId);
        return articleWithComments;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  const loadMoreArticles = async () => {
    if (currentPage < totalPages && !loadingMore) {
      const result = await getArticles(currentPage + 1);

      if (result.success && result.data && result.data.articles) {
        setArticles((prevArticles) => {
          const newArticles = result.data.articles.filter(
            (newArticle: Article) => !prevArticles.some((prevArticle) => prevArticle._id === newArticle._id)
          );
          return [...prevArticles, ...newArticles];
        });
      } else {
      }
    } else {
    }
  };

  const changeScreen = (nameScreen: "SearchNavigation" | "MessageNavigation") => {
    if (nameScreen === "SearchNavigation") {
      navigation.navigate("SearchNavigation", {}); 
    } else {
      navigation.navigate(nameScreen);
    }
  };

  const recordView = async (articleId: string) => {
    if (!userId) {
      return;
    }
    if (!articleId || typeof articleId !== "string") {
      return;
    }
    try {
      const response = await restClient.apiClient.service("apis/history-article").create({
        idUser: userId,
        idArticle: articleId,
        action: "View",
      });
      if (!response.success) {
        const errorMessage = response.messages || response.message || "Không có thông báo lỗi từ server";
        Alert.alert("Lỗi", errorMessage);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi ghi lượt xem. Vui lòng thử lại!");
    }
  };

  const recordLike = async (articleId: string) => {
    if (!userId) {
      return;
    }
    if (!articleId || typeof articleId !== "string") {
      return;
    }
    try {
      const response = await restClient.apiClient.service("apis/history-article").create({
        idUser: userId,
        idArticle: articleId,
        action: "Like",
      });
      if (!response.success) {
        const errorMessage = response.messages || response.message || "Không có thông báo lỗi từ server";
        Alert.alert("Lỗi", errorMessage);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi ghi lượt thích. Vui lòng thử lại!");
    }
  };

  return {
    getArticles,
    getArticleById,
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
    createArticle,
    changeScreen,
    getUserId,
    userId,
    setUserId,
    pickMedia,
    selectedMedia,
    recordView,
    recordLike,
    currentPage,
    totalPages,
    setTotalPages,
    loadingMore,
    loadMoreArticles,
    isCommentChecking,
  };
}