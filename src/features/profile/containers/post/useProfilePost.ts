import env from "@/env";
import { Article, Comment, User } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";
import socket from "@/src/shared/services/socketio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert, Keyboard } from "react-native";

const articlesClient = restClient.apiClient.service("apis/articles");
const commentsClient = restClient.apiClient.service("apis/comments");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export default function useProfilePost(userIdProfile: string) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [newReply, setNewReply] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isCommentChecking, setIsCommentChecking] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fetchArticles = async () => {
    try {
      const result = await articlesClient.find({ createdBy: userIdProfile, groupId: null });
      if (result.success) {
        setArticles(result.data);
      } else {
        console.error("Error fetching articles:", result.message);
        Alert.alert("Lỗi", result.message || "Không thể tải bài viết. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error occurred:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải bài viết. Vui lòng thử lại!");
    }
  };

  // 🔄 Initialize socket and fetch articles when userId changes
  useEffect(() => {
    if (userId) {
      fetchArticles();
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

  // 📡 Join post rooms for real-time updates
  useEffect(() => {
    articles.forEach((article) => {
      socket.emit("joinPost", article._id);
      console.log(`Joined post room: post-${article._id}`);
    });
    return () => {
      articles.forEach((article) => {
        socket.emit("leavePost", article._id);
        console.log(`Left post room: post-${article._id}`);
      });
    };
  }, [articles]);

  // 📡 Socket listeners for real-time updates
  useEffect(() => {
    socket.on("newComment", ({ comment, articleId }) => {
      if (!comment?._id) {
        return;
      }
      if (currentArticle?._id === articleId) {
        setCurrentArticle((prev) => {
          if (!prev) return prev;
          const commentExists = prev.comments?.some((c) => c._id === comment._id);
          if (commentExists) return prev;
          const updatedComments = prev.comments
            ? prev.comments.filter((c) => c && c._id && !c._id.startsWith("temp-")).concat(comment)
            : [comment];
          return { ...prev, comments: updatedComments };
        });
        setArticles((prevArticles) =>
          prevArticles.map((article) =>
            article._id === articleId
              ? {
                  ...article,
                  comments: [
                    ...(article.comments || []).filter((c) => c._id && !c._id.startsWith("temp-")),
                    comment,
                  ],
                }
              : article
          )
        );
      }
    });

    socket.on("newReplyComment", ({ comment, parentCommentId }) => {
      if (currentArticle) {
        setCurrentArticle((prev) => {
          if (!prev) return prev;
          const updatedComments = addNestedReply(
            prev.comments?.filter((c) => !c._id.startsWith("temp-")) || [],
            parentCommentId,
            comment
          );
          return { ...prev, comments: updatedComments };
        });
      }
    });

    socket.on("articleLiked", ({ articleId, emoticons }) => {
      console.log(`articleLiked event received: articleId=${articleId}, emoticons=`, emoticons);
      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article._id === articleId ? { ...article, emoticons } : article
        )
      );
      if (currentArticle?._id === articleId) {
        setCurrentArticle((prev) => (prev ? { ...prev, emoticons } : prev));
      }
    });

    socket.on("commentLiked", ({ commentId, emoticons }) => {
      console.log(`commentLiked event received: commentId=${commentId}, emoticons=`, emoticons);
      if (currentArticle) {
        setCurrentArticle((prev) => {
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
  }, [currentArticle,setArticles]);
  const getUserId = async () => {
    const id = await AsyncStorage.getItem("userId");
    const name = await AsyncStorage.getItem("displayName");
    setUserId(id);
  };

  useEffect(() => {
    getUserId();
  }, []);
  // 📸 Pick media for comments
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

  // 🔍 Check text content for sensitivity
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
      console.error("Error checking text:", error.message);
      if (error.name === "AbortError") {
        Alert.alert("Lỗi", "Yêu cầu kiểm tra văn bản hết thời gian. Vui lòng thử lại!");
      } else {
        Alert.alert("Lỗi", "Không thể kiểm tra nội dung văn bản. Vui lòng thử lại!");
      }
      return true;
    }
  };

  // 🔍 Check media content for sensitivity
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

        formData.append("files", {
          uri: resizedUri,
          name: media.fileName || resizedUri.split("/").pop(),
          type: media.mimeType || "image/jpeg",
        } as any);
      }

      const response = await fetch(`${env.API_URL_CHECK_TOXIC}/check-image/`, {
        method: "POST",
        headers: {
          "X-API-Key": env.API_KEY_CHECK_TOXIC || "",
          "Connection": "keep-alive",
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
        Alert.alert("Lỗi", "Hết thời gian kiểm tra hình ảnh (3s). Vui lòng dùng ảnh nhỏ hơn!");
      } else {
        Alert.alert("Lỗi", "Không thể kiểm tra nội dung ảnh. Vui lòng kiểm tra kết nối mạng và thử lại!");
      }
      return true;
    }
  };

  // 📋 Fetch comments for an article
const fetchComments = async (articleId: string) => {
  try {
    const response = await articlesClient.get(`${articleId}/comments`);
    if (response.success) {
      const validComments = response.data.filter(
        (c: Comment) => c && typeof c._id === "string" && c._id.trim() !== ""
      );
      console.log("Bình luận nhận được:", validComments);
      return validComments;
    }
    console.error("Lỗi khi lấy bình luận:", response.message);
    Alert.alert("Lỗi", response.message || "Không thể tải bình luận. Vui lòng thử lại!");
    return [];
  } catch (error) {
    console.error("Lỗi khi lấy bình luận:", error);
    Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải bình luận. Vui lòng thử lại!");
    return [];
  }
};

  // 📜 Open comments modal
  const openComments = async (article: Article) => {
    try {
      const comments = await fetchComments(article._id);
      setCurrentArticle({ ...article, comments });
      setModalVisible(true);
    } catch (error) {
      console.error("Error opening comments:", error);
      Alert.alert("Lỗi", "Không thể tải bình luận. Vui lòng thử lại!");
    }
  };

  // 📕 Close comments modal
  const closeComments = () => {
    setModalVisible(false);
    setCurrentArticle(null);
    setSelectedMedia([]);
    Keyboard.dismiss();
  };

  // 👍 Like a comment with optimistic update
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

  // Cập nhật lạc quan
  setCurrentArticle((prev) => {
    if (!prev) return prev;
    const updatedComments = updateNestedComment(
      prev.comments || [],
      commentId,
      (prev.comments?.find((c) => c._id === commentId)?.emoticons || []).includes(userId)
        ? (prev.comments?.find((c) => c._id === commentId)?.emoticons || []).filter((id) => id !== userId)
        : [...(prev.comments?.find((c) => c._id === commentId)?.emoticons || []), userId]
    );
    originalEmoticons = prev.comments?.find((c) => c._id === commentId)?.emoticons || [];
    console.log(`Cập nhật lạc quan cho bình luận: ${commentId}, emoticons:`, updatedComments.find((c) => c._id === commentId)?.emoticons);
    return { ...prev, comments: updatedComments };
  });

  try {
    const response = await commentsClient.patch(`${commentId}/like`, { userId });
    if (response.success && currentArticle) {
      const likedComment = response.data;
      // Đồng bộ với dữ liệu server
      setCurrentArticle((prev) => {
        if (!prev) return prev;
        const updatedComments = updateNestedComment(
          prev.comments || [],
          commentId,
          likedComment.emoticons as string[]
        );
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
      // Rollback nếu server trả về lỗi
      setCurrentArticle((prev) => {
        if (!prev) return prev;
        const updatedComments = updateNestedComment(prev.comments || [], commentId, originalEmoticons!);
        console.log(`Rollback emoticons cho comment ${commentId}:`, originalEmoticons);
        return { ...prev, comments: updatedComments };
      });
      Alert.alert("Lỗi", response.message || "Không thể thích bình luận. Vui lòng thử lại!");
    }
  } catch (error) {
    // Rollback nếu có lỗi mạng
    setCurrentArticle((prev) => {
      if (!prev) return prev;
      const updatedComments = updateNestedComment(prev.comments || [], commentId, originalEmoticons!);
      console.log(`Rollback emoticons do lỗi mạng cho comment ${commentId}:`, originalEmoticons);
      return { ...prev, comments: updatedComments };
    });
    console.error("Lỗi khi thích bình luận:", error);
    Alert.alert("Lỗi", "Không thể thích bình luận. Vui lòng thử lại!");
  } finally {
    setIsCommentChecking(false);
  }
};

  // 💬 Reply to a comment with media support
  const replyToComment = async (
      parentCommentId: string,
      content: string,
      media: ImagePicker.ImagePickerAsset[] = []
    ) => {
      console.log("replyToComment called with:", { parentCommentId, content, media }); // Debug
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
        if (media.length > 0) {
          const isMediaSensitive = await checkMediaContent(media);
          if (isMediaSensitive) {
            Alert.alert("Cảnh báo", "Hình ảnh chứa nội dung nhạy cảm. Vui lòng chọn ảnh khác!");
            return;
          }
        }
        const formData = new FormData();
        formData.append("_iduser", userId);
        formData.append("content", content.trim());
        formData.append("replyComment", parentCommentId);
        if (media.length > 0) {
          const file = {
            uri: media[0].uri,
            type: media[0].mimeType || "image/jpeg",
            name: `media_0.${media[0].uri.split(".").pop() || "jpg"}`,
          };
          formData.append("media", file as any);
          console.log("FormData for reply:", {
            _iduser: userId,
            content: content.trim(),
            replyComment: parentCommentId,
            media: file,
          });
        }
        const response = await commentsClient.create(formData);
        console.log("Response from commentsClient.create:", response);
        if (response.success) {
          const updatedComments = await fetchComments(currentArticle._id);
          const parentComment = updatedComments.find((c: Comment) => c._id === parentCommentId);
          if (parentComment && !parentComment.replyComment?.find((r: Comment) => r._id === response.data._id)) {
            try {
              await commentsClient.patch(parentCommentId, {
                replyComment: [...(parentComment.replyComment || []), response.data],
              });
              console.log("Updated parent comment:", parentCommentId); // Debug
            } catch (error) {
              console.error("Error updating parent comment:", error);
            }
          }
          setCurrentArticle({ ...currentArticle, comments: await fetchComments(currentArticle._id) });
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
              console.error("Error sending notification:", notificationError);
            }
          }
          setNewReply("");
          setSelectedMedia([]); // Reset
        } else {
          Alert.alert("Lỗi", response.message || "Không thể trả lời bình luận. Vui lòng thử lại!");
        }
      } catch (error: any) {
        console.error("Error in replyToComment:", error);
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi trả lời. Vui lòng thử lại!");
      } finally {
        setIsCommentChecking(false);
      }
    };

  // 👍 Like an article with notification
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
          } catch (notificationError: any) {}
        }
      } else {
        Alert.alert("Lỗi", response.message || "Không thể thích bài viết. Vui lòng thử lại!");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi thích bài viết. Vui lòng thử lại!");
    }
  };

  // 📊 Calculate total comments including replies
  const calculateTotalComments = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      const replyCount = comment.replyComment?.length || 0;
      return total + 1 + replyCount;
    }, 0);
  };

  // 💬 Add a new comment with media support
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
          } catch (notificationError: any) {}
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

  // ✏️ Edit an article
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

  // 🗑️ Delete an article
  const deleteArticle = async (articleId: string) => {
    try {
      await articlesClient.remove(articleId);
      setArticles((prevArticles) => prevArticles.filter((article) => article._id !== articleId));
      if (currentArticle?._id === articleId) {
        setCurrentArticle(null);
      }
      Alert.alert("Thành công", "Bài viết đã được xóa!");
    } catch (error) {
      console.error("Error deleting article:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi xóa bài viết. Vui lòng thử lại!");
    }
  };

  // 📜 Record like action
  const recordLike = async (articleId: string) => {
    if (!userId || !articleId || typeof articleId !== "string") {
      return;
    }
    try {
      const response = await restClient.apiClient.service("apis/history-article").create({
        idUser: userId,
        idArticle: articleId,
        action: "Like",
      });
      if (!response.success) {
        Alert.alert("Lỗi", response.message || "Không thể ghi lượt thích. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error recording like:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi ghi lượt thích. Vui lòng thử lại!");
    }
  };

  // 🔄 Update nested comment for likes
  const updateNestedComment = (comments: Comment[], commentId: string, newEmoticons: string[]): Comment[] => {
    return comments.map((c) => {
      if (c._id === commentId) {
        console.log(`Updating emoticons for comment: ${c._id}, new emoticons:`, newEmoticons);
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

  // 🔄 Add nested reply to comments
    const addNestedReply = (comments: Comment[], parentCommentId: string, newComment: Comment): Comment[] => {
      return comments.map((c) => {
        if (c._id === parentCommentId) {
          const replyExists = c.replyComment?.some((r) => r._id === newComment._id);
          if (replyExists) {
            console.log(`Bình luận trả lời ${newComment._id} đã tồn tại, bỏ qua`);
            return c;
          }
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
    articles,
    isModalVisible,
    currentArticle,
    newReply,
    selectedMedia,
    isCommentChecking,
    setNewReply,
    openComments,
    closeComments,
    likeComment,
    replyToComment,
    likeArticle,
    calculateTotalComments,
    handleAddComment,
    deleteArticle,
    editArticle,
    pickMedia,
    userId,
  };
}