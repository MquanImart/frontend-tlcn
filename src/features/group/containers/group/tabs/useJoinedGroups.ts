// useSavedGroups.ts
import { useState, useEffect } from "react";
import restClient from "@/src/shared/services/RestClient";
import { Group } from "@/src/features/newfeeds/interface/article";

const usersClient = restClient.apiClient.service("apis/users");

export const useJoinedGroups = (currentUserId: string) => {
  const [savedGroups, setSavedGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedGroups = async () => {
      try {
        const response = await usersClient.get(`${currentUserId}/saved-groups`);

        if (response.success) {
          setSavedGroups(response.data);
        } else {
          setError("Không thể lấy danh sách nhóm đã lưu.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy nhóm đã lưu:", error);
        setError("Có lỗi xảy ra khi lấy dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedGroups();
  }, [currentUserId]);

  return {
    savedGroups,
    loading,
    error,
  };
};
