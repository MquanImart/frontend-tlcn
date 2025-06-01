import { Article } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";
import { useCallback, useEffect, useState } from "react";

const groupsClient = restClient.apiClient.service("apis/groups");

export const useGroupHome = (groupId: string) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchApprovedArticles = useCallback(
    async (newPage = 1, append = false) => {
      if (newPage > totalPages && totalPages !== 0) return;

      setLoading(!append);
      setIsLoadingMore(append);
      setError(null);

      try {
        const groupSpecificClient = restClient.apiClient.service(`apis/groups/${groupId}/approved-articles`);

        const response = await groupSpecificClient.find({
          page: newPage,
          limit: 3, 
        });

        if (response.success) {
          const validArticles = (response.data || []).filter(
            (article: Article) => article && article._id
          );
          setArticles((prev) => (append ? [...prev, ...validArticles] : validArticles));
          setTotalPages(response.totalPages || 1);
          setPage(newPage);
        } else {
          setError(response.messages || "Không thể lấy danh sách bài viết.");
        }
      } catch (error) {
        setError("Lỗi khi gọi API bài viết.");
        console.error("Lỗi lấy bài viết đã duyệt:", error);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [groupId, totalPages]
  );

  const loadMoreArticles = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      fetchApprovedArticles(page + 1, true);
    }
  }, [page, totalPages, isLoadingMore, fetchApprovedArticles]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApprovedArticles(1);
    setRefreshing(false);
  };

  useEffect(() => {
    if (groupId) {
      fetchApprovedArticles();
    }
  }, [groupId, fetchApprovedArticles]);

  return {
    articles,
    setArticles,
    loading,
    error,
    refreshing,
    onRefresh,
    loadMoreArticles,
    isLoadingMore,
    fetchApprovedArticles,
  };
};