// useArticleGroups.ts
import { useState, useEffect } from "react";
import restClient from "@/src/shared/services/RestClient";
import { Article } from "@/src/features/newfeeds/interface/article";

const usersClient = restClient.apiClient.service("apis/users");

export const useFeed = (currentUserId: string) => {
  const [articleGroups, setArticleGroups] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticleGroups = async () => {
      try {
        const response = await usersClient.get(`${currentUserId}/group-articles`);

        if (response.success) {
          setArticleGroups(response.data);
        } else {
          setError("Không thể lấy danh sách nhóm bài viết.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy nhóm bài viết:", error);
        setError("Có lỗi xảy ra khi lấy dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticleGroups();
  }, [currentUserId]);

  return { articleGroups, setArticleGroups, loading, error };
};
