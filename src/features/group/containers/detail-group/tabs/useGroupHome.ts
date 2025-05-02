import { useState, useEffect } from "react";
import restClient from "@/src/shared/services/RestClient";
import { Article } from "@/src/features/newfeeds/interface/article";

const groupsClient = restClient.apiClient.service("apis/groups");

export const useGroupHome = (groupId: string) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApprovedArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await groupsClient.get(`${groupId}/approved-articles`);
      if (response.success) {
        setArticles(response.data);
      } else {
        setError(response.messages || "Không thể lấy danh sách bài viết.");
      }
    } catch (error) {
      setError("Lỗi khi gọi API bài viết.");
      console.error("Lỗi lấy bài viết đã duyệt:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh action
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApprovedArticles();
    setRefreshing(false);
  };

  useEffect(() => {
    if (groupId) {
      fetchApprovedArticles();
    }
  }, [groupId]);

  return {
    articles,
    setArticles,
    loading,
    error,
    refreshing,
    onRefresh,
  };
};
