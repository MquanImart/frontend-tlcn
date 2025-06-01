import { Article } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";
import { useCallback, useEffect, useState } from "react";

const usersClient = restClient.apiClient.service("apis/users");

export const useFeed = (currentUserId: string) => {
  const [articleGroups, setArticleGroups] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchArticleGroups = useCallback(
    async (newPage = 1, append = false) => {
      if (newPage > totalPages && totalPages !== 0) return;

      setLoading(!append);
      setIsLoadingMore(append);

      try {
        // Tạo client với path chứa userId
        const userSpecificClient = restClient.apiClient.service(`apis/users/${currentUserId}/group-articles`);

        // Gọi API với tham số phân trang
        const response = await userSpecificClient.find({
          page: newPage,
          limit: 3,
        });

        if (response.success) {
          setArticleGroups((prev) =>
            append ? [...prev, ...response.data] : response.data
          );
          setTotalPages(response.totalPages || 1);
          setPage(newPage);
        } else {
          setError("Không thể lấy danh sách nhóm bài viết.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy nhóm bài viết:", error);
        setError("Có lỗi xảy ra khi lấy dữ liệu.");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [currentUserId, totalPages]
  );

  const loadMoreArticles = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      fetchArticleGroups(page + 1, true);
    }
  }, [page, totalPages, isLoadingMore, fetchArticleGroups]);

  useEffect(() => {
    if (currentUserId) {
      fetchArticleGroups();
    }
  }, [currentUserId, fetchArticleGroups]);

  return {
    articleGroups,
    setArticleGroups,
    loading,
    error,
    loadMoreArticles,
    isLoadingMore,
  };
};