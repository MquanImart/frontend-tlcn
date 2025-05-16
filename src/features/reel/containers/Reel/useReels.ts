import env from "@/env";
import { Comment, Reels, User } from "@/src/features/reel/interface/reels";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
const articlesClient = restClient.apiClient.service("apis/articles");
const commentsClient = restClient.apiClient.service("apis/comments");
const reelsClient = restClient.apiClient.service("apis/reels");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export default function useReel(
  reels: Reels[],
  setReels: (reels: Reels[]) => void,
  setCommentLoading: (loading: boolean) => void
) {
  const [userId, setUserId] = useState<string | null> (null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentReel, setCurrentReel] = useState<Reels | null>(null);
  const [newReply, setNewReply] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [page, setPage] = useState(0); // Trang hiện tại
  const [hasMore, setHasMore] = useState(true); // Còn video để tải
  const [total, setTotal] = useState(0); // Tổng số video
    const getUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("displayName"); 
      setUserId(id);
      setDisplayName(name); 
    };
  
    useEffect(() => {
      getUserId(); // Gọi ngay khi mount để lấy userId và displayName
    }, []);
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
  const checkMediaContent = async (media: ImagePicker.ImagePickerAsset): Promise<boolean> => {
    if (media.type === "video") {
      return false; // Bỏ qua video
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout 10s

      const formData = new FormData();
      formData.append("file", {
        uri: media.uri,
        name: media.uri.split("/").pop(),
        type: media.mimeType || "image/jpeg",
      } as any);

      const response = await fetch(`${env.API_URL_CHECK_TOXIC}/check-image/`, {
        method: "POST",
        headers: {
          "X-API-Key": env.API_KEY_CHECK_TOXIC || "",
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.image_result.is_sensitive || false;
    } catch (error: any) {
      console.error("❌ Lỗi kiểm tra hình ảnh:", error.message, error.stack);
      if (error.name === "AbortError") {
        Alert.alert("Lỗi", "Yêu cầu kiểm tra hình ảnh hết thời gian. Vui lòng thử lại!");
      } else {
        Alert.alert("Lỗi", "Không thể kiểm tra nội dung hình ảnh. Vui lòng kiểm tra kết nối mạng và thử lại!");
      }
      return true; // Coi là nhạy cảm để an toàn
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
  const openComments = async (reel: Reels) => {
    try {
      const comments = await fetchComments(reel._id);
      setCurrentReel({ ...reel, comments });
      setModalVisible(true);
    } catch (error) {
      console.error('Lỗi khi lấy bình luận:', error);
    }
  };

  const closeComments = () => {
    setModalVisible(false);
    setCurrentReel(null);
    setSelectedMedia([]);
  };

  const fetchComments = async (reelId: string) => {
    try {
      const response = await reelsClient.get(`${reelId}/comments`);
      if (response.success) {
        return response.success ? response.data : [];
      } else {
        console.error("Lỗi khi lấy bình luận:", response.message);
        return [];
      }
    } catch (error) {
      console.error("Lỗi xảy ra khi gọi API lấy bình luận:", error);
      return [];
    }
  };

  const likeComment = async (commentId: string) => {
    if (!userId) {
      console.warn("⚠️ userId không tồn tại");
      return;
    }
    try {
      const response = await commentsClient.patch(`${commentId}/like`, { userId });

      if (response.success) {
        if (currentReel) {
          const updatedComments = await fetchComments(currentReel._id);
          const likedComment = updatedComments.find((c: Comment) => c._id === commentId);
          const currentComment = currentReel.comments?.find((c) => c._id === commentId);
          const wasLikedBefore = currentComment?.emoticons?.includes(userId) || false; 
          const isLikedNow = likedComment?.emoticons?.includes(userId) || false
          setCurrentReel({ ...currentReel, comments: updatedComments });
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
          setCurrentReel({ ...currentReel, comments: updatedComments });
        }
      } else {
        console.error('Lỗi khi like bình luận:', response.message);
      }
    } catch (error) {
      console.error('Lỗi khi gọi API like:', error);
    }
  };

  const replyToComment = async (parentCommentId: string, content: string) => {
    if (!currentReel || !content.trim() || !userId) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung trả lời!");
      return;
    }   
    
      try {
      // Kiểm tra nội dung văn bản
      const isTextSensitive = await checkTextContent(content.trim());
      if (isTextSensitive) {
        Alert.alert("Cảnh báo", "Nội dung trả lời có chứa thông tin nhạy cảm. Vui lòng chỉnh sửa!");
        return;
      }

      // Kiểm tra media
      if (selectedMedia.length > 0) {
        const mediaChecks = await Promise.all(selectedMedia.map(checkMediaContent));
        if (mediaChecks.some((isSensitive) => isSensitive)) {
          Alert.alert("Cảnh báo", "Hình ảnh chứa nội dung nhạy cảm. Vui lòng chọn ảnh khác!");
          return;
        }
      }
      // Nếu không nhạy cảm, tiếp tục gửi trả lời
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
          const updatedComments = await fetchComments(currentReel._id);
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
          setCurrentReel({ ...currentReel, comments: updatedComments });
          setNewReply("");
          setSelectedMedia([]);
        } else {
          console.error("Lỗi khi trả lời bình luận:", response.message);
        }
      } catch (error) {
        console.error("Lỗi khi gửi yêu cầu trả lời bình luận:", error);
      }
    
  };

  const likeReel = async (reelId: string, reelOwner:string) => {
    try {
      const response = await reelsClient.patch(`${reelId}/toggle-like`, { userId });

      setReels([...reels].map((reel: Reels) =>
        reel._id === reelId
          ? {
              ...reel,
              emoticons: response.data.emoticons.map((id: string) => ({ _id: id } as User)) 
            }
          : reel
      ));
      const currentReel = reels.find((reel) => reel._id === reelId);
      const wasLikedBefore = currentReel?.emoticons?.some((user) => user._id === userId) || false; 
      const isLikedNow = response.data.emoticons.includes(userId);
      
      if (userId !== reelOwner && !wasLikedBefore && isLikedNow) {
        try {
          const notificationMessage = `đã thích bài viết của bạn`;
          await notificationsClient.create({
            senderId: userId,
            receiverId: reelOwner,
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

  const calculateTotalLikes = (emoticons?: User[]): number => {
    return emoticons ? emoticons.length : 0;
  };

  const handleAddComment = async () => {
    if (!currentReel || !newReply.trim() || !userId) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung bình luận!");
      return;
    }
    setCommentLoading(true);
      try {
      // Kiểm tra nội dung văn bản
      const isTextSensitive = await checkTextContent(newReply.trim());
      if (isTextSensitive) {
        Alert.alert("Cảnh báo", "Nội dung bình luận có chứa thông tin nhạy cảm. Vui lòng chỉnh sửa!");
        return;
      }

      // Kiểm tra media
      if (selectedMedia.length > 0) {
        const mediaChecks = await Promise.all(selectedMedia.map(checkMediaContent));
        if (mediaChecks.some((isSensitive) => isSensitive)) {
          Alert.alert("Cảnh báo", "Hình ảnh chứa nội dung nhạy cảm. Vui lòng chọn ảnh khác!");
          return;
        }
      }
      // Nếu không nhạy cảm, tiếp tục gửi bình luận
      const formData = new FormData();
      formData.append("_iduser", userId);
      formData.append("content", newReply.trim());
      formData.append("articleId", currentReel._id);     
      
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
          const updatedComments = await fetchComments(currentReel._id);
          setCurrentReel({ ...currentReel, comments: updatedComments });
          if (userId !== currentReel.createdBy._id) {
            try {
              await notificationsClient.create({
                senderId: userId,
                receiverId: currentReel.createdBy._id,
                message: `đã bình luận bài đăng của bạn`,
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
        console.error("Lỗi khi gửi yêu cầu tạo bình luận:", error);
      }
      finally {
        setCommentLoading(false); // Tắt trạng thái loading
      }
  };

  const getReels = async (pageNum: number = 0) => {
    try {
      const limit = 4;
      const skip = pageNum * limit;      
      // Tạo tham số phẳng
      const queryParams = { $limit: limit, $skip: skip };
       
      // Gọi find với tham số phẳng
      const response = await reelsClient.find(queryParams);

  
      if (response.success) {
        if (!Array.isArray(response.data)) {
          return { success: false, data: [], total: 0 };
        }
  
        const validReels = response.data.filter(
          (reel: Reels) => reel._id && !reel._id.startsWith('.$')
        );
  
        const uniqueReels = validReels.filter(
          (reel: Reels) => !reels.some((existingReel) => existingReel._id === reel._id)
        );
  
        return {
          success: true,
          data: uniqueReels,
          total: response.total || 0,
        };
      } else {
        console.error("API trả về lỗi:", response.message);
        return { success: false, data: [], total: 0 };
      }
    } catch (error) {
      console.error("Lỗi xảy ra khi tải reels:", error);
      return { success: false, data: [], total: 0 };
    }
  };
  return {
    reels,
    currentReel,
    isModalVisible,
    newReply,
    openComments,
    closeComments,
    likeComment,
    replyToComment,
    likeReel,
    calculateTotalComments,
    handleAddComment,
    setNewReply,
    calculateTotalLikes,
    getReels,
    getUserId,
    userId, setUserId,
    pickMedia,
    selectedMedia,
    page,
    setPage,
    hasMore,
  };
}