import env from "@/env";
import { Comment, Reels, User } from "@/src/features/reel/interface/reels";
import restClient from "@/src/shared/services/RestClient";
import socket from "@/src/shared/services/socketio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert, Keyboard } from "react-native";

const articlesClient = restClient.apiClient.service("apis/articles");
const commentsClient = restClient.apiClient.service("apis/comments");
const reelsClient = restClient.apiClient.service("apis/reels");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export default function useReel(
  reels: Reels[],
  setReels: (reels: Reels[] | ((prevReels: Reels[]) => Reels[])) => void,
  setCommentLoading: (loading: boolean) => void
) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentReel, setCurrentReel] = useState<Reels | null>(null);
  const [newReply, setNewReply] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [isCommentChecking, setIsCommentChecking] = useState(false);

  const getUserId = async () => {
    const id = await AsyncStorage.getItem("userId");
    const name = await AsyncStorage.getItem("displayName");
    setUserId(id);
    setDisplayName(name);
  };

  useEffect(() => {
    getUserId();
  }, []);

  // Socket connection setup
  useEffect(() => {
    if (userId) {
      socket.connect();
      socket.emit("joinUser", userId);
      console.log(`Socket connected for user: ${userId}`);

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
      });

      return () => {
        socket.disconnect();
        console.log("Socket disconnected");
      };
    }
  }, [userId]);

  // Join/leave reel rooms
  useEffect(() => {
    reels.forEach((reel) => {
      socket.emit("joinPost", reel._id);
      console.log(`Joined reel room: post-${reel._id}`);
    });
    return () => {
      reels.forEach((reel) => {
        socket.emit("leavePost", reel._id);
        console.log(`Left reel room: post-${reel._id}`);
      });
    };
  }, [reels]);

  // Socket event listeners for comments and likes
  useEffect(() => {
    socket.on("newComment", ({ comment, articleId: reelId }) => {
      if (currentReel?._id === reelId) {
        setCurrentReel((prev) => {
          if (!prev) return prev;
          const commentExists = prev.comments?.some((c) => c._id === comment._id);
          if (commentExists) return prev;
          const updatedComments = prev.comments
            ? prev.comments.filter((c) => !c._id.startsWith("temp-")).concat(comment)
            : [comment];
          return { ...prev, comments: updatedComments };
        });
        setReels((prevReels) =>
          prevReels.map((reel) =>
            reel._id === reelId
              ? {
                  ...reel,
                  comments: [...(reel.comments || []).filter((c) => !c._id.startsWith("temp-")), comment],
                }
              : reel
          )
        );
      }
    });

socket.on("newReplyComment", ({ comment, parentCommentId }) => {
  console.log("Nhận sự kiện newReplyComment:", { comment, parentCommentId });
  if (currentReel && currentReel._id === comment.articleId) {
    setCurrentReel((prev) => {
      if (!prev) return prev;
      // Chỉ thêm bình luận nếu nó chưa tồn tại
      const commentExists = prev.comments?.some((c) => c._id === comment._id);
      if (commentExists) return prev;
      const updatedComments = addNestedReply(
        prev.comments?.filter((c) => !c._id.startsWith("temp-")) || [],
        parentCommentId,
        comment
      );
      return { ...prev, comments: updatedComments };
    });
  }
});

    socket.on("articleLiked", ({ articleId: reelId, emoticons }) => {
      console.log(`reelLiked event received: reelId=${reelId}, emoticons=`, emoticons);
      setReels((prevReels) =>
        prevReels.map((reel) =>
          reel._id === reelId ? { ...reel, emoticons } : reel
        )
      );
      if (currentReel?._id === reelId) {
        setCurrentReel((prev) =>
          prev ? { ...prev, emoticons } : prev
        );
      }
    });

    socket.on("commentLiked", ({ commentId, emoticons, userId: likerId }) => {
      console.log(`commentLiked event received: commentId=${commentId}, emoticons=`, emoticons);
      if (currentReel) {
        setCurrentReel((prev) => {
          if (!prev) return prev;
          const updatedComments = updateNestedComment(prev.comments || [], commentId, emoticons as string[]);
          return { ...prev, comments: updatedComments };
        });
      }
    });

    return () => {
      socket.off("newComment");
      socket.off("newReplyComment");
      socket.off("articleLiked");
      socket.off("commentLiked");
    };
  }, [currentReel, setReels]);

  const checkTextContent = async (text: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);

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
      return true;
    }
  };

  const checkMediaContent = async (media: ImagePicker.ImagePickerAsset): Promise<boolean> => {
    if (media.type === "video") {
      return false;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);

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
      return true;
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
      console.error("Lỗi khi lấy bình luận:", error);
    }
  };

  const closeComments = () => {
    setModalVisible(false);
    setCurrentReel(null);
    setSelectedMedia([]);
    Keyboard.dismiss();
  };

  const fetchComments = async (reelId: string) => {
    try {
      const response = await reelsClient.get(`${reelId}/comments`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error("Lỗi xảy ra khi gọi API lấy bình luận:", error);
      return [];
    }
  };

  const likeComment = async (commentId: string) => {
    if (!userId) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để thích bình luận!");
      return;
    }

    if (isCommentChecking) {
      console.log(`Bỏ qua yêu cầu like cho comment ${commentId}: đang xử lý`);
      return;
    }

    setIsCommentChecking(true);
    let originalEmoticons: string[] | undefined;

    setCurrentReel((prev) => {
      if (!prev) return prev;
      const updatedComments = updateNestedComment(
        prev.comments || [],
        commentId,
        (prev.comments?.find((c) => c._id === commentId)?.emoticons || []).includes(userId)
          ? (prev.comments?.find((c) => c._id === commentId)?.emoticons || []).filter((id) => id !== userId)
          : [...(prev.comments?.find((c) => c._id === commentId)?.emoticons || []), userId]
      );
      originalEmoticons = prev.comments?.find((c) => c._id === commentId)?.emoticons || [];
      return { ...prev, comments: updatedComments };
    });

    try {
      const response = await commentsClient.patch(`${commentId}/like`, { userId });
      if (response.success && currentReel) {
        const likedComment = response.data;
        setCurrentReel((prev) => {
          if (!prev) return prev;
          const updatedComments = updateNestedComment(prev.comments || [], commentId, likedComment.emoticons as string[]);
          return { ...prev, comments: updatedComments };
        });
        if (userId !== likedComment._iduser._id) {
          try {
            await notificationsClient.create({
              senderId: userId,
              receiverId: likedComment._iduser._id,
              message: `đã yêu thích bình luận của bạn`,
              status: "unread",
              reelId: currentReel._id,
              commentId,
              relatedEntityType: "Comment",
            });
          } catch (error) {
            console.error("Lỗi khi gửi thông báo thích bình luận:", error);
          }
        }
      } else {
        setCurrentReel((prev) => {
          if (!prev) return prev;
          const updatedComments = updateNestedComment(prev.comments || [], commentId, originalEmoticons!);
          return { ...prev, comments: updatedComments };
        });
        Alert.alert("Lỗi", response.message || "Không thể thích bình luận. Vui lòng thử lại!");
      }
    } catch (error) {
      setCurrentReel((prev) => {
        if (!prev) return prev;
        const updatedComments = updateNestedComment(prev.comments || [], commentId, originalEmoticons!);
        return { ...prev, comments: updatedComments };
      });
      console.error("Lỗi khi thích bình luận:", error);
      Alert.alert("Lỗi", "Không thể thích bình luận. Vui lòng thử lại!");
    } finally {
      setIsCommentChecking(false);
    }
  };

  const replyToComment = async (parentCommentId: string, content: string) => {
    if (!currentReel || !content.trim() || !userId) {
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
      console.log("Response from replyToComment:", response);
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
              reelId: currentReel._id,
              commentId: response.data._id,
              relatedEntityType: "Reel",
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
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi trả lời. Vui lòng thử lại!");
    } finally {
      setIsCommentChecking(false);
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
          const notificationMessage = `đã thích bài reels của bạn`;
          await notificationsClient.create({
            senderId: userId,
            receiverId: reelOwner,
            message: notificationMessage,
            status: "unread",
            reelId: reelId,
            relatedEntityType: "Reel",
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

  const calculateTotalComments = async (reelId: string): Promise<number> => {
    try {
      const response = await reelsClient.get(`${reelId}/total-comments`);
      return response.success && typeof response.data === "number" ? response.data : 0;
    } catch (error) {
      console.error("Lỗi khi gọi API tính tổng comment:", error);
      return 0;
    }
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
    setIsCommentChecking(true);
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
              message: `đã bình luận bài reels của bạn`,
              status: "unread",
              reelId: currentReel._id,
              commentId: response.data._id,
              relatedEntityType: "Comment",
            });
          } catch (notificationError) {
            console.error("🔴 Lỗi khi gửi thông báo comment:", notificationError);
          }
        }
        setNewReply("");
        setSelectedMedia([]);
      } else {
        console.error("Lỗi khi thêm bình luận:", response.message);
        Alert.alert("Lỗi", response.message || "Không thể thêm bình luận. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu tạo bình luận:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi bình luận. Vui lòng thử lại!");
    } finally {
      setCommentLoading(false);
      setIsCommentChecking(false);
    }
  };

  const getReels = async (pageNum: number = 0) => {
    try {
      const limit = 4;
      const skip = pageNum * limit;
      const queryParams = { $limit: limit, $skip: skip };

      const response = await reelsClient.find(queryParams);

      if (response.success) {
        if (!Array.isArray(response.data)) {
          return { success: false, data: [], total: 0 };
        }

        const validReels = response.data.filter((reel: Reels) => reel._id && !reel._id.startsWith(".$"));

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

  const getReelById = async (reelId: string) => {
    try {
      const response = await reelsClient.get(reelId);

      if (response.success && response.data) {
        const reel = response.data;
        if (reel._id && !reel._id.startsWith(".$")) {
          const comments = await fetchComments(reel._id);
          return {
            success: true,
            data: { ...reel, comments },
          };
        } else {
          console.warn("Reel ID không hợp lệ:", reel._id);
          return { success: false, data: null };
        }
      } else {
        console.error("API trả về lỗi khi lấy reel:", response.message);
        return { success: false, data: null };
      }
    } catch (error) {
      console.error("Lỗi xảy ra khi tải reel:", error);
      return { success: false, data: null };
    }
  };

  const updateNestedComment = (comments: Comment[], commentId: string, newEmoticons: string[]): Comment[] => {
    return comments.map((c) => {
      if (c._id === commentId) {
        console.log(`Cập nhật emoticons cho bình luận: ${c._id}, emoticons mới:`, newEmoticons);
        return { ...c, emoticons: newEmoticons };
      }
      if (c.replyComment && c.replyComment.length > 0) {
        return {
          ...c,
          replyComment: updateNestedComment(c.replyComment, commentId, newEmoticons),
        };
      }
      return c;
    });
  };

  const addNestedReply = (comments: Comment[], parentCommentId: string, newComment: Comment): Comment[] => {
    return comments.map((c) => {
      if (c._id === parentCommentId) {
        console.log(`Thêm bình luận trả lời vào: ${parentCommentId}`);
        return { ...c, replyComment: [...(c.replyComment || []), newComment] };
      }
      if (c.replyComment && c.replyComment.length > 0) {
        return {
          ...c,
          replyComment: addNestedReply(c.replyComment, parentCommentId, newComment),
        };
      }
      return c;
    });
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
    userId,
    setUserId,
    pickMedia,
    selectedMedia,
    page,
    setPage,
    hasMore,
    getReelById,
    isCommentChecking,
  };
}