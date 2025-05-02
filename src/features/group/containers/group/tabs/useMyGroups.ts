// useMyGroups.ts
import { useState, useEffect } from "react";
import restClient from "@/src/shared/services/RestClient";
import { Group } from "@/src/features/newfeeds/interface/article";

// Service to get users' groups
const usersClient = restClient.apiClient.service("apis/users");

export const useMyGroups = (currentUserId: string) => {
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyGroups = async () => {
      try {
        const response = await usersClient.get(`${currentUserId}/my-groups`);

        if (response.success) {
          setMyGroups(response.data);
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

    fetchMyGroups();
  }, [currentUserId]);

  return {
    myGroups,
    loading,
    error,
  };
};
