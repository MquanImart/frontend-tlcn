import { useState, useEffect } from "react";
import { Article, Comment, User, Group, Address, MyPhoto } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";
import { Keyboard } from "react-native";

const articlesClient = restClient.apiClient.service("apis/articles");
const commentsClient = restClient.apiClient.service("apis/comments");

export default function useProfilePost(userId: string) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [newReply, setNewReply] = useState("");

  // 📌 Fetch tất cả bài viết từ API
  const fetchArticles = async () => {
    try {
      const result = await articlesClient.find({ createdBy: userId,groupId: null }); // Sử dụng userId động
      if (result.success) {
        setArticles(result.data);
      } else {
        console.error("Lỗi khi lấy bài viết:", result.message);
      }
    } catch (error) {
      console.error("Lỗi xảy ra:", error);
    }
  };

  // 🔄 Gọi API khi component được mount hoặc userId thay đổi
  useEffect(() => {
    if (userId) {
      fetchArticles();
    }
  }, [userId]);

  const fetchComments = async (articleId: string) => {
    try {
      const response = await articlesClient.get(`${articleId}/comments`);
      if (response.success) {
        return response.data;
      } else {
        console.error("Lỗi khi lấy bình luận:", response.message);
        return [];
      }
    } catch (error) {
      console.error("Lỗi xảy ra khi gọi API lấy bình luận:", error);
      return [];
    }
  };

  const openComments = async (article: Article) => {
    try {
      const comments = await fetchComments(article._id);
      setCurrentArticle({ ...article, comments });
      setModalVisible(true);
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
    }
  };

  const closeComments = () => {
    setModalVisible(false);
    setCurrentArticle(null);
    Keyboard.dismiss();
  };

  const likeComment = async (commentId: string) => {
    try {
      const response = await commentsClient.patch(`${commentId}/like`, { userId });
      if (response.success) {
        if (currentArticle) {
          const updatedComments = await fetchComments(currentArticle._id);
          setCurrentArticle({ ...currentArticle, comments: updatedComments });
        }
      } else {
        console.error("Lỗi khi like bình luận:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API like:", error);
    }
  };

  const replyToComment = async (parentCommentId: string, content: string) => {
    if (currentArticle && content.trim()) {
      try {
        const newReplyData = {
          _iduser: userId,
          content: content.trim(),
          replyComment: parentCommentId,
          img: [],
        };
        const response = await commentsClient.create(newReplyData);
        if (response.success) {
          const updatedComments = await fetchComments(currentArticle._id);
          setCurrentArticle({ ...currentArticle, comments: updatedComments });
        } else {
          console.error("Lỗi khi trả lời bình luận:", response.message);
        }
      } catch (error) {
        console.error("Lỗi khi gửi yêu cầu trả lời bình luận:", error);
      }
    }
  };

  const likeArticle = async (articleId: string) => {
    try {
      const response = await articlesClient.patch(`${articleId}/like`, { userId });
      if (response.success) {
        const updatedArticles = articles.map((article) =>
          article._id === articleId
            ? { ...article, emoticons: response.data.emoticons }
            : article
        );
        setArticles(updatedArticles);
      } else {
        console.error("Lỗi khi like bài viết:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API like:", error);
    }
  };

  const calculateTotalComments = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      const replyCount = comment.replyComment?.length || 0;
      return total + 1 + replyCount;
    }, 0);
  };

  const handleAddComment = async () => {
    if (currentArticle && newReply.trim()) {
      try {
        const newCommentData = {
          _iduser: userId,
          content: newReply.trim(),
          articleId: currentArticle._id,
          img: [],
        };
        const response = await commentsClient.create(newCommentData);
        if (response.success) {
          const updatedComments = await fetchComments(currentArticle._id);
          setCurrentArticle({ ...currentArticle, comments: updatedComments });
          setNewReply("");
        } else {
          console.error("Lỗi khi thêm bình luận:", response.message);
        }
      } catch (error) {
        console.error("Lỗi khi gửi yêu cầu tạo bình luận:", error);
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

  return {
    articles,
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
  };
}