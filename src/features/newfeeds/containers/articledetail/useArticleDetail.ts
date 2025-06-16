import env from "@/env";
import { Article, Comment, User } from "@/src/features/newfeeds/interface/article";
import { NewFeedParamList } from "@/src/shared/routes/NewFeedNavigation";
import restClient from "@/src/shared/services/RestClient";
import socket from "@/src/shared/services/socketio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, FlatList, Keyboard } from "react-native";

type ArticleDetailNavigationProp = StackNavigationProp<NewFeedParamList, "ArticleDetail">;

// Constants
const TOXIC_CHECK_TIMEOUT = 50000; // 50s timeout for toxic content check
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ERROR_MESSAGES = {
  LOGIN_REQUIRED: "Vui lòng đăng nhập để thực hiện hành động này!",
  EMPTY_CONTENT: "Vui lòng nhập nội dung!",
  TOXIC_CONTENT: "Nội dung chứa thông tin nhạy cảm. Vui lòng chỉnh sửa!",
  TOXIC_MEDIA: "Hình ảnh chứa nội dung nhạy cảm. Vui lòng chọn ảnh khác!",
  OVERSIZED_IMAGE: (filename: string) => `Ảnh "${filename}" quá lớn, tối đa 5MB.`,
  TIMEOUT_TEXT: "Yêu cầu kiểm tra văn bản hết thời gian. Vui lòng thử lại!",
  TIMEOUT_MEDIA: "Hết thời gian kiểm tra hình ảnh. Vui lòng dùng ảnh nhỏ hơn!",
  NETWORK_ERROR: "Không thể kiểm tra nội dung. Vui lòng kiểm tra kết nối mạng và thử lại!",
  SERVER_ERROR: (action: string) => `Không thể ${action}. Vui lòng thử lại!`,
};

// API Clients
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

  // Initialize user data
  const getUserId = useCallback(async () => {
    try {
      const [id, name] = await Promise.all([
        AsyncStorage.getItem("userId"),
        AsyncStorage.getItem("displayName"),
      ]);
      setUserId(id);
      setDisplayName(name);
      return id;
    } catch (error) {
      console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
      return null;
    }
  }, []);

  // Socket connection for user
  useEffect(() => {
    if (!userId) return;
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
  }, [userId]);

  // Socket join/leave post room
  useEffect(() => {
    if (!articleId) return;
    socket.emit("joinPost", articleId);
    console.log(`Joined post room: post-${articleId}`);

    return () => {
      socket.emit("leavePost", articleId);
      console.log(`Left post room: post-${articleId}`);
    };
  }, [articleId]);

  // Socket event listeners
  useEffect(() => {
    const socketHandlers = {
      newComment: ({ comment, articleId: eventArticleId }: { comment: Comment; articleId: string }) => {
        if (currentArticle?._id !== eventArticleId) return;
        setCurrentArticle((prev) => {
          if (!prev) return prev;
          if (prev.comments?.some((c) => c._id === comment._id)) return prev;
          const updatedComments = [...(prev.comments || []), comment];
          return { ...prev, comments: updatedComments };
        });
      },
      newReplyComment: ({ comment, parentCommentId }: { comment: Comment; parentCommentId: string }) => {
        if (!currentArticle) return;
        setCurrentArticle((prev) => {
          if (!prev) return prev;
          const updatedComments = addNestedReply(prev.comments || [], parentCommentId, comment);
          return { ...prev, comments: updatedComments };
        });
      },
      articleLiked: ({ articleId: eventArticleId, emoticons }: { articleId: string; emoticons: User[] }) => {
        console.log(`articleLiked event received: articleId=${eventArticleId}, emoticons=`, emoticons);
        if (currentArticle?._id !== eventArticleId) return;
        setCurrentArticle((prev) => (prev ? { ...prev, emoticons } : prev));
      },
      commentLiked: ({
        commentId,
        emoticons,
        userId: likerId,
      }: {
        commentId: string;
        emoticons: string[];
        userId: string;
      }) => {
        console.log(`Sự kiện commentLiked nhận được: commentId=${commentId}, emoticons=`, emoticons, `likerId=${likerId}`);
        if (!currentArticle) return;
        setCurrentArticle((prev) => {
          if (!prev) return prev;
          const updatedComments = updateNestedComment(prev.comments || [], commentId, emoticons);
          return { ...prev, comments: updatedComments };
        });
      },
    };

    Object.entries(socketHandlers).forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      Object.keys(socketHandlers).forEach((event) => socket.off(event));
      console.log("Đã làm sạch các listener Socket.IO");
    };
  }, [currentArticle]);

  // Check content sensitivity (text or media)
  const checkContentSensitivity = useCallback(
    async (text: string, mediaAssets: ImagePicker.ImagePickerAsset[] = []): Promise<boolean> => {
      if (text.trim()) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), TOXIC_CHECK_TIMEOUT);

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

          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          const data = await response.json();
          if (data.contains_bad_word) {
            Alert.alert("Cảnh báo", ERROR_MESSAGES.TOXIC_CONTENT);
            return true;
          }
        } catch (error: any) {
          console.error("Lỗi kiểm tra văn bản:", error.message);
          Alert.alert("Lỗi", error.name === "AbortError" ? ERROR_MESSAGES.TIMEOUT_TEXT : ERROR_MESSAGES.NETWORK_ERROR);
          return true;
        }
      }

      if (!mediaAssets.length) return false;
      const imageAssets = mediaAssets.filter((media) => media.type === "image");
      if (!imageAssets.length) return false;

      for (const media of imageAssets) {
        if (media.fileSize && media.fileSize > MAX_IMAGE_SIZE) {
          Alert.alert("Lỗi", ERROR_MESSAGES.OVERSIZED_IMAGE(media.fileName || media.uri.split("/").pop() || ""));
          return true;
        }
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TOXIC_CHECK_TIMEOUT);

        const formData = new FormData();
        for (const media of imageAssets) {
          const resizedUri = await ImageManipulator.manipulateAsync(
            media.uri,
            [{ resize: { width: 600 } }],
            { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
          ).then((result) => result.uri);

          formData.append("files", {
            uri: resizedUri,
            name: media.fileName || resizedUri.split("/").pop() || `image_${Date.now()}.jpg`,
            type: media.mimeType || "image/jpeg",
          } as any);
        }

        const response = await fetch(`${env.API_URL_CHECK_TOXIC}/check-image/`, {
          method: "POST",
          headers: { "X-API-Key": env.API_KEY_CHECK_TOXIC || "", "Connection": "keep-alive" },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        const sensitiveImage = data.results.find(
          (result: any) =>
            result.image_result?.is_sensitive ||
            (result.text_result?.text_sensitivity &&
              Object.values(result.text_result.text_sensitivity).some((v: any) => v.is_sensitive))
        );

        if (sensitiveImage) {
          Alert.alert("Cảnh báo nội dung nhạy cảm", `Ảnh "${sensitiveImage.filename}" chứa nội dung không phù hợp.`);
          return true;
        }

        return false;
      } catch (error: any) {
        console.error("Lỗi kiểm tra hình ảnh:", error.message);
        Alert.alert("Lỗi", error.name === "AbortError" ? ERROR_MESSAGES.TIMEOUT_MEDIA : ERROR_MESSAGES.NETWORK_ERROR);
        return true;
      }
    },
    []
  );

  // Fetch article by ID
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
      }
      Alert.alert("Lỗi", response.message || ERROR_MESSAGES.SERVER_ERROR("tải bài viết"));
      return null;
    } catch (error) {
      console.error("Lỗi khi gọi API lấy bài viết:", error);
      Alert.alert("Lỗi", ERROR_MESSAGES.SERVER_ERROR("tải bài viết"));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  // Fetch comments for an article
  const fetchComments = useCallback(async (articleId: string): Promise<Comment[]> => {
    try {
      const response = await articlesClient.get(`${articleId}/comments`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
      return [];
    }
  }, []);

  // Open comments modal
  const openComments = useCallback(async () => {
    if (!currentArticle) {
      console.warn("Không thể mở bình luận: currentArticle chưa được thiết lập");
      return;
    }
    try {
      const comments = await fetchComments(currentArticle._id);
      setCurrentArticle({ ...currentArticle, comments });
      setModalVisible(true);
      setHasOpenedModal(true);

      if (commentId && comments.length > 0) {
        const findCommentIndex = (comments: Comment[], targetId: string, currentIndex = 0): number => {
          for (const comment of comments) {
            if (comment._id === targetId) return currentIndex;
            if (comment.replyComment?.length) {
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
              commentListRef.current?.scrollToIndex({ index: commentIndex, animated: true, viewPosition: 0.5 });
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
      Alert.alert("Lỗi", ERROR_MESSAGES.SERVER_ERROR("tải bình luận"));
    }
  }, [currentArticle, commentId]);

  // Close comments modal
  const closeComments = useCallback(() => {
    setModalVisible(false);
    setNewReply("");
    setSelectedMedia([]);
    Keyboard.dismiss();
  }, []);

  // Like a comment
  const likeComment = useCallback(
    async (commentId: string) => {
      if (!userId) {
        Alert.alert("Lỗi", ERROR_MESSAGES.LOGIN_REQUIRED);
        return;
      }
      if (isCommentChecking) {
        console.log(`Bỏ qua yêu cầu like cho comment ${commentId}: đang xử lý`);
        return;
      }

      setIsCommentChecking(true);
      let originalEmoticons: string[] | undefined;

      // Optimistic update
      setCurrentArticle((prev) => {
        if (!prev) return prev;
        const currentEmoticons = prev.comments?.find((c) => c._id === commentId)?.emoticons || [];
        const newEmoticons = currentEmoticons.includes(userId)
          ? currentEmoticons.filter((id) => id !== userId)
          : [...currentEmoticons, userId];
        const updatedComments = updateNestedComment(prev.comments || [], commentId, newEmoticons);
        originalEmoticons = currentEmoticons;
        console.log(`Cập nhật lạc quan cho bình luận: ${commentId}, emoticons:`, newEmoticons);
        return { ...prev, comments: updatedComments };
      });

      try {
        const response = await commentsClient.patch(`${commentId}/like`, { userId });
        if (response.success && currentArticle) {
          const likedComment = response.data;
          // Sync with server data
          setCurrentArticle((prev) => {
            if (!prev) return prev;
            const updatedComments = updateNestedComment(prev.comments || [], commentId, likedComment.emoticons as string[]);
            console.log(`Đồng bộ emoticons từ server cho comment ${commentId}:`, likedComment.emoticons);
            return { ...prev, comments: updatedComments };
          });

          if (userId !== likedComment._iduser._id) {
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
        } else {
          // Rollback on server error
          setCurrentArticle((prev) => {
            if (!prev) return prev;
            const updatedComments = updateNestedComment(prev.comments || [], commentId, originalEmoticons!);
            console.log(`Rollback emoticons cho comment ${commentId}:`, originalEmoticons);
            return { ...prev, comments: updatedComments };
          });
          Alert.alert("Lỗi", response.message || ERROR_MESSAGES.SERVER_ERROR("thích bình luận"));
        }
      } catch (error) {
        // Rollback on network error
        setCurrentArticle((prev) => {
          if (!prev) return prev;
          const updatedComments = updateNestedComment(prev.comments || [], commentId, originalEmoticons!);
          console.log(`Rollback emoticons do lỗi mạng cho comment ${commentId}:`, originalEmoticons);
          return { ...prev, comments: updatedComments };
        });
        console.error("Lỗi khi thích bình luận:", error);
        Alert.alert("Lỗi", ERROR_MESSAGES.SERVER_ERROR("thích bình luận"));
      } finally {
        setIsCommentChecking(false);
      }
    },
    [userId, currentArticle, isCommentChecking]
  );

  // Like an article
  const likeArticle = useCallback(async () => {
    if (!userId || !currentArticle) {
      Alert.alert("Lỗi", ERROR_MESSAGES.LOGIN_REQUIRED);
      return;
    }
    try {
      const response = await articlesClient.patch(`${currentArticle._id}/like`, { userId });
      if (response.success) {
        await recordLike(currentArticle._id);
        setCurrentArticle({ ...currentArticle, emoticons: response.data.emoticons as User[] });
        if (userId !== currentArticle.createdBy._id) {
          await notificationsClient.create({
            senderId: userId,
            receiverId: currentArticle.createdBy._id,
            message: `đã thích bài viết của bạn`,
            status: "unread",
            articleId: currentArticle._id,
            relatedEntityType: "Article",
          });
        }
      } else {
        Alert.alert("Lỗi", response.message || ERROR_MESSAGES.SERVER_ERROR("thích bài viết"));
      }
    } catch (error) {
      console.error("Lỗi khi thích bài viết:", error);
      Alert.alert("Lỗi", ERROR_MESSAGES.SERVER_ERROR("thích bài viết"));
    }
  }, [userId, currentArticle]);

  // Add a comment
  const handleAddComment = useCallback(async () => {
    if (!currentArticle || !newReply.trim() || !userId) {
      Alert.alert("Thông báo", ERROR_MESSAGES.EMPTY_CONTENT);
      return;
    }
    setIsCommentChecking(true);
    try {
      if (await checkContentSensitivity(newReply, selectedMedia)) return;

      const formData = new FormData();
      formData.append("_iduser", userId);
      formData.append("content", newReply.trim());
      formData.append("articleId", currentArticle._id);
      if (selectedMedia.length) {
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
          await notificationsClient.create({
            senderId: userId,
            receiverId: currentArticle.createdBy._id,
            message: `đã bình luận bài viết`,
            status: "unread",
            articleId: currentArticle._id,
            commentId: response.data._id,
            relatedEntityType: "Comment",
          });
        }
        setNewReply("");
        setSelectedMedia([]);
      } else {
        Alert.alert("Lỗi", response.message || ERROR_MESSAGES.SERVER_ERROR("thêm bình luận"));
      }
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
      Alert.alert("Lỗi", ERROR_MESSAGES.SERVER_ERROR("thêm bình luận"));
    } finally {
      setIsCommentChecking(false);
    }
  }, [userId, currentArticle, newReply, selectedMedia, checkContentSensitivity]);

  // Reply to a comment
  const replyToComment = useCallback(
    async (parentCommentId: string, content: string) => {
      if (!currentArticle || !content.trim() || !userId) {
        Alert.alert("Thông báo", ERROR_MESSAGES.EMPTY_CONTENT);
        return;
      }
      setIsCommentChecking(true);
      try {
        if (await checkContentSensitivity(content, selectedMedia)) return;

        const formData = new FormData();
        formData.append("_iduser", userId);
        formData.append("content", content.trim());
        formData.append("replyComment", parentCommentId);
        if (selectedMedia.length) {
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
          const parentComment = updatedComments.find((c: Comment) => c._id === parentCommentId);
          if (parentComment && userId !== parentComment._iduser._id) {
            await notificationsClient.create({
              senderId: userId,
              receiverId: parentComment._iduser._id,
              message: `đã trả lời bình luận của bạn`,
              status: "unread",
              articleId: currentArticle._id,
              commentId: response.data._id,
              relatedEntityType: "Comment",
            });
          }
          setCurrentArticle({ ...currentArticle, comments: updatedComments });
          setNewReply("");
          setSelectedMedia([]);
        } else {
          Alert.alert("Lỗi", response.message || ERROR_MESSAGES.SERVER_ERROR("trả lời bình luận"));
        }
      } catch (error) {
        console.error("Lỗi khi trả lời bình luận:", error);
        Alert.alert("Lỗi", ERROR_MESSAGES.SERVER_ERROR("trả lời bình luận"));
      } finally {
        setIsCommentChecking(false);
      }
    },
    [userId, currentArticle, selectedMedia, checkContentSensitivity]
  );

  // Delete an article
  const deleteArticle = useCallback(async () => {
    if (!currentArticle || !userId) return;
    try {
      await articlesClient.remove(currentArticle._id);
      Alert.alert("Thành công", "Xóa bài viết thành công!");
      navigation.goBack();
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
      Alert.alert("Lỗi", ERROR_MESSAGES.SERVER_ERROR("xóa bài viết"));
    }
  }, [currentArticle, userId]);

  // Edit an article
  const editArticle = useCallback(
    async (articleId: string, newContent: string, newScope: string, newHashtags: string[]) => {
      if (!currentArticle || !userId) return;
      try {
        if (await checkContentSensitivity(newContent)) return;

        const response = await articlesClient.patch(articleId, {
          content: newContent,
          scope: newScope,
          hashTag: newHashtags,
        });
        if (response.success) {
          setCurrentArticle({ ...currentArticle, content: newContent, scope: newScope, hashTag: newHashtags });
          Alert.alert("Thành công", "Cập nhật bài viết thành công!");
        } else {
          Alert.alert("Lỗi", ERROR_MESSAGES.SERVER_ERROR("cập nhật bài viết"));
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật bài viết:", error);
        Alert.alert("Lỗi", ERROR_MESSAGES.SERVER_ERROR("cập nhật bài viết"));
      }
    },
    [currentArticle, userId, checkContentSensitivity]
  );

  // Pick media
  const pickMedia = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: false,
        quality: 1,
      });
      if (!result.canceled && result.assets) setSelectedMedia(result.assets);
    } catch (error) {
      console.error("Lỗi khi chọn media:", error);
      Alert.alert("Lỗi", ERROR_MESSAGES.SERVER_ERROR("chọn hình ảnh"));
    }
  }, []);

  // Record view
  const recordView = useCallback(async (articleId: string) => {
    if (!userId || !articleId || typeof articleId !== "string") return;
    try {
      const response = await restClient.apiClient.service("apis/history-article").create({
        idUser: userId,
        idArticle: articleId,
        action: "View",
      });
      if (!response.success) console.error("Lỗi khi ghi lại lượt xem:", response.message);
    } catch (error) {
      console.error("Lỗi khi gọi API xem:", error);
    }
  }, [userId]);

  // Record like
  const recordLike = useCallback(async (articleId: string) => {
    if (!userId || !articleId || typeof articleId !== "string") return;
    try {
      const response = await restClient.apiClient.service("apis/history-article").create({
        idUser: userId,
        idArticle: articleId,
        action: "Like",
      });
      if (!response.success) console.error("Lỗi khi ghi lại lượt thích:", response.message);
    } catch (error) {
      console.error("Lỗi khi gọi API thích:", error);
    }
  }, [userId]);

  // Update nested comment
  const updateNestedComment = (comments: Comment[], commentId: string, newEmoticons: string[]): Comment[] => {
    return comments.map((c) => {
      if (c._id === commentId) {
        console.log(`Cập nhật emoticons cho bình luận: ${c._id}, emoticons mới:`, newEmoticons);
        return { ...c, emoticons: newEmoticons };
      }
      if (c.replyComment?.length) {
        return { ...c, replyComment: updateNestedComment(c.replyComment, commentId, newEmoticons) };
      }
      return c;
    });
  };

  // Add nested reply
  const addNestedReply = (comments: Comment[], parentCommentId: string, newComment: Comment): Comment[] => {
    return comments.map((c) => {
      if (c._id === parentCommentId) {
        console.log(`Thêm bình luận trả lời vào: ${parentCommentId}`);
        return { ...c, replyComment: [...(c.replyComment || []), newComment] };
      }
      if (c.replyComment?.length) {
        return { ...c, replyComment: addNestedReply(c.replyComment, parentCommentId, newComment) };
      }
      return c;
    });
  };

  // Calculate total comments
  const calculateTotalComments = useCallback(() => {
    return (currentArticle?.comments || []).reduce((total, comment) => {
      return total + 1 + (comment.replyComment?.length || 0);
    }, 0);
  }, [currentArticle]);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const id = await getUserId();
      if (!id) {
        Alert.alert("Lỗi", ERROR_MESSAGES.LOGIN_REQUIRED, [{ text: "OK" }], { cancelable: false });
        setIsLoading(false);
        return;
      }
      await getArticleById();
    };
    initialize();
  }, [getUserId, getArticleById]);

  // Open comments if commentId exists
  useEffect(() => {
    if (currentArticle && commentId && !hasOpenedModal) openComments();
  }, [currentArticle, commentId, hasOpenedModal, openComments]);

  return {
    // State
    userId,
    currentArticle,
    isModalVisible,
    newReply,
    selectedMedia,
    isCommentChecking,
    isLoading,
    commentListRef,
    // Setters
    setNewReply,
    // Article actions
    likeArticle,
    deleteArticle,
    editArticle,
    getArticleById,
    // Comment actions
    openComments,
    closeComments,
    likeComment,
    replyToComment,
    handleAddComment,
    calculateTotalComments,
    // Media actions
    pickMedia,
  };
}