import env from "@/env";
import { Article, Comment, User } from "@/src/features/newfeeds/interface/article";
import { NewFeedParamList } from "@/src/shared/routes/NewFeedNavigation";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

type NewFeedNavigationProp = StackNavigationProp<NewFeedParamList, "NewFeed">;

const articlesClient = restClient.apiClient.service("apis/articles");
const commentsClient = restClient.apiClient.service("apis/comments");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export default function useNewFeed(
  articles: Article[], 
  setArticles: (articles: Article[]) => void
) {
  const navigation = useNavigation<NewFeedNavigationProp>();
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);

  // Hàm retry request
  const retryRequest = async (fn: () => Promise<any>, retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const start = Date.now();
        const result = await fn();
        console.log(`Request thành công sau ${Date.now() - start}ms`);
        return result;
      } catch (error) {
        console.warn(`Thử lại request lần ${i + 1}/${retries}:`, error);
        if (i < retries - 1) {
          await new Promise((res) => setTimeout(res, delay * Math.pow(2, i)));
        } else {
          throw error;
        }
      }
    }
  };

  // Hàm kiểm tra nội dung văn bản
  const checkTextContent = async (text: string): Promise<boolean> => {
    if (!text.trim()) return false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // Timeout 90s

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
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.contains_bad_word || Object.values(data.text_sensitivity || {}).some((v: any) => v.is_sensitive);
    } catch (error: any) {
      console.error("❌ Lỗi kiểm tra văn bản:", {
        message: error.message,
        status: error.response?.status,
        stack: error.stack,
      });
      if (error.name === "AbortError") {
        Alert.alert("Lỗi", "Hết thời gian kiểm tra văn bản (90s). Vui lòng thử lại!");
        return false; // Fallback: cho phép tiếp tục
      } else {
        Alert.alert("Lỗi", "Không thể kiểm tra văn bản. Vui lòng kiểm tra mạng và thử lại!");
        return true; // An toàn: coi là nhạy cảm
      }
    }
  };

  // Hàm kiểm tra hình ảnh
  const checkMediaContent = async (media: ImagePicker.ImagePickerAsset): Promise<boolean> => {
    if (media.type !== "image") return false;
    if (media.fileSize && media.fileSize > 5 * 1024 * 1024) {
      Alert.alert("Lỗi", "File quá lớn, tối đa 5MB");
      return true;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // Timeout 90s

      const resizedUri = await ImageManipulator.manipulateAsync(
        media.uri,
        [{ resize: { width: 600 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      ).then((result) => result.uri);

      const formData = new FormData();
      formData.append("file", {
        uri: resizedUri,
        name: media.uri.split("/").pop(),
        type: media.mimeType || "image/jpeg",
      } as any);

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
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.image_result.is_sensitive || (data.text_result?.text_sensitivity && Object.values(data.text_result.text_sensitivity).some((v: any) => v.is_sensitive));
    } catch (error: any) {
      console.error("❌ Lỗi kiểm tra hình ảnh:", {
        message: error.message,
        status: error.response?.status,
        stack: error.stack,
      });
      if (error.name === "AbortError") {
        Alert.alert("Lỗi", "Hết thời gian kiểm tra hình ảnh (90s). Vui lòng dùng ảnh nhỏ hơn!");
        return false; // Fallback: cho phép tiếp tục
      } else {
        Alert.alert("Lỗi", "Không thể kiểm tra hình ảnh. Vui lòng kiểm tra mạng và thử lại!");
        return true; // An toàn: coi là nhạy cảm
      }
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

  useEffect(() => {
    if (userId) {
      getArticles();
    }
  }, [userId]);

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
      console.error("Lỗi khi lấy bình luận:", error);
      return [];
    }
  };

  const openComments = async (article: Article) => {
    try {
      const comments = await fetchComments(article._id);
      setCurrentArticle({ ...article, comments });
      setModalVisible(true);
    } catch (error) {
      console.error('Lỗi khi lấy bình luận:', error);
    }
  };

  const closeComments = () => {
    setModalVisible(false);
    setCurrentArticle(null);
    setSelectedMedia([]);
  };

  const likeComment = async (commentId: string) => {
    if (!userId) {
      console.warn("⚠️ userId không tồn tại");
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
                status: "unread"
              });
            } catch (notificationError: any) {
              console.error("🔴 Lỗi khi gửi thông báo like comment:", {
                message: notificationError.message,
                response: notificationError.response?.data,
              });
            }
          } 
          setCurrentArticle({ ...currentArticle, comments: updatedComments });
        }
      } else {
        console.error('Lỗi khi like bình luận:', response.message);
      }
    } catch (error) {
      console.error('Lỗi khi gọi API like comment:', error);
    }
  };

  const likeArticle = async (articleId: string, articleOwner: string) => {
    if (!userId) {
      console.warn("⚠️ userId không tồn tại");
      Alert.alert("Lỗi", "Vui lòng đăng nhập để thích bài viết!");
      return;
    }
  
    try {
      const response = await articlesClient.patch(`${articleId}/like`, { userId });
  
      if (response.success) {
        recordLike(articleId);
        setArticles(
          articles.map((article: Article) =>
            article._id === articleId
              ? {
                  ...article,
                  emoticons: response.data.emoticons as User[],
                }
              : { ...article }
          )
        );
  
        if (userId !== articleOwner) {
          try {
            const notificationMessage = `đã thích bài viết của bạn`;
            await notificationsClient.create({
              senderId: userId,
              receiverId: articleOwner,
              message: notificationMessage,
              status: "unread",
            });
          } catch (notificationError: any) {
            console.error("🔴 Lỗi khi gửi thông báo:", {
              message: notificationError.message,
              response: notificationError.response?.data,
            });
          }
        }
      } else {
        console.error("Lỗi khi like bài viết:", response.message);
        Alert.alert("Lỗi", response.message || "Không thể thích bài viết. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.error("🔴 Lỗi khi gọi API like:", error);
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

    try {
      const isTextSensitive = await checkTextContent(newReply.trim());
      if (isTextSensitive) {
        Alert.alert("Cảnh báo", "Nội dung bình luận có chứa thông tin nhạy cảm. Vui lòng chỉnh sửa!");
        return;
      }

      if (selectedMedia.length > 0) {
        const mediaChecks = await Promise.all(selectedMedia.map(checkMediaContent));
        if (mediaChecks.some((isSensitive) => isSensitive)) {
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
        console.log("currentArticle.createdBy._id", currentArticle.createdBy._id);
        if (userId !== currentArticle.createdBy._id) {
          try {
            console.log("currentArticle.createdBy._id", currentArticle.createdBy._id);
            await notificationsClient.create({
              senderId: userId,
              receiverId: currentArticle.createdBy._id,
              message: `đã bình luận bài viết của bạn`,
              status: "unread",
            });
          } catch (notificationError) {
            console.error("🔴 Lỗi khi gửi thông báo comment:", notificationError);
          }
        }

        setNewReply("");
        setSelectedMedia([]);
      } else {
        console.error("Lỗi khi thêm bình luận:", response.message);
        Alert.alert("Lỗi", "Không thể thêm bình luận. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi bình luận. Vui lòng thử lại!");
    }
  };

  const replyToComment = async (parentCommentId: string, content: string) => {
    if (!currentArticle || !content.trim() || !userId) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung trả lời!");
      return;
    }

    try {
      const isTextSensitive = await checkTextContent(content.trim());
      if (isTextSensitive) {
        Alert.alert("Cảnh báo", "Nội dung trả lời có chứa thông tin nhạy cảm. Vui lòng chỉnh sửa!");
        return;
      }

      if (selectedMedia.length > 0) {
        const mediaChecks = await Promise.all(selectedMedia.map(checkMediaContent));
        if (mediaChecks.some((isSensitive) => isSensitive)) {
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
            await notificationsClient.create({
              senderId: userId,
              receiverId: parentComment._iduser._id,
              message: `đã trả lời bình luận của bạn`,
              status: "unread",
            });
          } catch (notificationError) {
            console.error("🔴 Lỗi khi gửi thông báo reply comment:", notificationError);
          }
        }

        setCurrentArticle({ ...currentArticle, comments: updatedComments });
        setNewReply("");
        setSelectedMedia([]);
      } else {
        console.error("Lỗi khi trả lời bình luận:", response.message);
        Alert.alert("Lỗi", "Không thể trả lời bình luận. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi trả lời bình luận:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi trả lời. Vui lòng thử lại!");
    }
  };

  const deleteArticle = async (articleId: string) => {
    try {
      await articlesClient.remove(articleId);
      const updatedArticles = articles.filter((article) => article._id !== articleId);
      setArticles(updatedArticles);
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
    }
  };

  const editArticle = async (articleId: string, newContent: string, newScope: string, newHashtags: string[]) => {
    try {
      await articlesClient.patch(articleId, {
        content: newContent,
        scope: newScope,
        hashTag: newHashtags,
      });
      const updatedArticles = articles.map((article) =>
        article._id === articleId
          ? { ...article, content: newContent, scope: newScope, hashTag: newHashtags }
          : article
      );
      
      setArticles(updatedArticles);
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
    }
  };

  const getArticles = async () => {
    try {
      const result = await articlesClient.find({});

      if (result.success) {
        return result
      } else {
        console.error("Lỗi khi lấy bài viết:", result.message);
      }
    } catch (error) {
      console.error("Lỗi xảy ra:", error);
    }
  };

  const changeScreen = (nameScreen: "SearchNavigation" | "MessageNavigation") => {
    navigation.navigate(nameScreen);
  }

  const recordView = async (articleId: string) => {
    if (!userId) {
      console.warn("⚠️ userId không tồn tại");
      return;
    }
    if (!articleId || typeof articleId !== 'string') {
      console.warn("⚠️ articleId không hợp lệ:", articleId);
      return;
    }

    try {
      const response = await restClient.apiClient.service("apis/history-article").create({
        idUser: userId,
        idArticle: articleId,
        action: "View",
      });

      if (response.success) {
      } else {
        const errorMessage = response.messages || response.message || "Không có thông báo lỗi từ server";
        console.error("Lỗi khi ghi lại lượt xem:", errorMessage);
        Alert.alert("Lỗi", errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API ghi lượt xem:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi ghi lượt xem. Vui lòng thử lại!");
    }
  };

  const recordLike = async (articleId: string) => {
    if (!userId) {
      console.warn("⚠️ userId không tồn tại");
      return;
    }
    if (!articleId || typeof articleId !== 'string') {
      console.warn("⚠️ articleId không hợp lệ:", articleId);
      return;
    }

    try {
      const response = await restClient.apiClient.service("apis/history-article").create({
        idUser: userId,
        idArticle: articleId,
        action: "Like",
      });

      if (response.success) {
      } else {
        const errorMessage = response.messages || response.message || "Không có thông báo lỗi từ server";
        console.error("Lỗi khi ghi lại lượt thích:", errorMessage);
        Alert.alert("Lỗi", errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API ghi lượt thích:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi ghi lượt thích. Vui lòng thử lại!");
    }
  };

  return {
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
    recordLike
  };
}