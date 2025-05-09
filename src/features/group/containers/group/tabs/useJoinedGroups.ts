import { Group } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";
import { useCallback, useEffect, useState } from "react";

const usersClient = restClient.apiClient.service("apis/users");

export const useJoinedGroups = (currentUserId: string) => {
  const [savedGroups, setSavedGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchSavedGroups = useCallback(
    async (newPage = 1, append = false) => {
      if (newPage > totalPages && totalPages !== 0) return;

      setLoading(!append);
      setIsLoadingMore(append);

      try {
        const userSpecificClient = restClient.apiClient.service(`apis/users/${currentUserId}/saved-groups`);

        const response = await userSpecificClient.find({
          page: newPage,
          limit: 5, 
        });

        if (response.success) {
          const validGroups = (response.data || []).filter(
            (group: Group) => group && group._id
          );
          setSavedGroups((prev) => (append ? [...prev, ...validGroups] : validGroups));
          setTotalPages(response.totalPages || 1);
          setPage(newPage);
        } else {
          setError("Không thể lấy danh sách nhóm đã lưu.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy nhóm đã lưu:", error);
        setError("Có lỗi xảy ra khi lấy dữ liệu.");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [currentUserId, totalPages]
  );

  const loadMoreGroups = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      fetchSavedGroups(page + 1, true);
    }
  }, [page, totalPages, isLoadingMore, fetchSavedGroups]);

  useEffect(() => {
    if (currentUserId) {
      fetchSavedGroups();
    }
  }, [currentUserId, fetchSavedGroups]);

  return {
    savedGroups,
    loading,
    error,
    loadMoreGroups,
    isLoadingMore,
    fetchSavedGroups,
  };
};