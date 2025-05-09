import { Group } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";
import { useCallback, useEffect, useState } from "react";

const usersClient = restClient.apiClient.service("apis/users");

export const useMyGroups = (currentUserId: string) => {
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchMyGroups = useCallback(
    async (newPage = 1, append = false) => {
      if (newPage > totalPages && totalPages !== 0) return;

      setLoading(!append);
      setIsLoadingMore(append);

      try {
        const userSpecificClient = restClient.apiClient.service(`apis/users/${currentUserId}/my-groups`);

        const response = await userSpecificClient.find({
          page: newPage,
          limit: 5, // Phù hợp với backend (limit mặc định là 5)
        });

        if (response.success) {
          const validGroups = (response.data || []).filter(
            (group: Group) => group && group._id
          );
          setMyGroups((prev) => (append ? [...prev, ...validGroups] : validGroups));
          setTotalPages(response.totalPages || 1);
          setPage(newPage);
        } else {
          setError("Không thể lấy danh sách nhóm đã tạo.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy nhóm đã tạo:", error);
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
      fetchMyGroups(page + 1, true);
    }
  }, [page, totalPages, isLoadingMore, fetchMyGroups]);

  useEffect(() => {
    if (currentUserId) {
      fetchMyGroups();
    }
  }, [currentUserId, fetchMyGroups]);

  return {
    myGroups,
    loading,
    error,
    loadMoreGroups,
    isLoadingMore,
    fetchMyGroups,
  };
};