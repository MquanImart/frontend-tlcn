import { useState, useEffect } from "react";
import { Article, Comment, User, Group, Address, MyPhoto } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";
import { useNavigation } from "@react-navigation/native";
import { NewFeedParamList } from "@/src/shared/routes/NewFeedNavigation";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker"; // Thư viện chọn ảnh/video

type NewFeedNavigationProp = StackNavigationProp<NewFeedParamList, "NewFeed">;

const articlesClient = restClient.apiClient.service("apis/articles");
const commentsClient = restClient.apiClient.service("apis/comments");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export default function useNewFeed(
  articles: Article[], 
  setArticles: (articles: Article[]) => void
) {
  const navigation = useNavigation<NewFeedNavigationProp>();
  const [userId, setUserId] = useState<string | null> (null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const getUserId = async () => {
    const id = await AsyncStorage.getItem("userId");
    const name = await AsyncStorage.getItem("displayName"); 
    setUserId(id);
    setDisplayName(name); 
  };

  useEffect(() => {
    getUserId(); // Gọi ngay khi mount để lấy userId và displayName
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
    setSelectedMedia([]); // Reset media khi đóng modal
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
              const notificationMessage = `${displayName || "Một người dùng"} đã yêu thích bình luận của bạn`;
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
    try {
      const response = await articlesClient.patch(`${articleId}/like`, { userId });
      
      setArticles([...articles].map((article: Article) =>
        article._id === articleId
          ? { 
              ...article, 
              emoticons: response.data.emoticons.map((id: string) => ({ _id: id } as User)) 
            }
          : article
      ));
      
      const currentArticle = articles.find((article) => article._id === articleId);
      const wasLikedBefore = currentArticle?.emoticons?.some((user) => user._id === userId) || false; 
      const isLikedNow = response.data.emoticons.includes(userId);
      
      if (userId !== articleOwner && !wasLikedBefore && isLikedNow) {
        try {
          const notificationMessage = `${displayName || "Một người dùng"} đã thích bài viết của bạn`;
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
    } catch (error) {
      console.error("🔴 Lỗi khi gọi API like:", error);
    }
  };

  const calculateTotalComments = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      const replyCount = comment.replyComment?.length || 0;
      return total + 1 + replyCount;
    }, 0);
  };
  const handleAddComment = async () => {
    if (currentArticle && newReply.trim() && userId) {
      try {
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
              await notificationsClient.create({
                senderId: userId,
                receiverId: currentArticle.createdBy._id,
                message: `${displayName} đã được bình luận bài viết của bạn`,
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
        }
      } catch (error) {
        console.error("Lỗi khi gửi bình luận:", error);
      }
    }
  };

  const replyToComment = async (parentCommentId: string, content: string) => {
    if (currentArticle && content.trim()) {
      try {
        const formData = new FormData();
        formData.append("_iduser", userId || "");
        formData.append("content", content.trim());
        formData.append("replyComment", parentCommentId);

        if (selectedMedia.length > 0) {
          const media = selectedMedia[0]; // Chỉ lấy file đầu tiên
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
                message: `${displayName} đã trả lời bình luận của bạn`,
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
        }
      } catch (error) {
        console.error("Lỗi khi gửi trả lời bình luận:", error);
      }
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
    userId, setUserId,
    pickMedia,
    selectedMedia,
  };
}
