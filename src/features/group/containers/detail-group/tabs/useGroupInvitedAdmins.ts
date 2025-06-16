// src/features/group/containers/detail-group/tabs/useGroupInvitedAdmins.ts
import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import restClient from "@/src/shared/services/RestClient";

const groupsClient = restClient.apiClient.service("apis/groups");

interface InvitedAdmin {
  inviteId: string;
  invitedUser: {
    _id: string;
    username: string;
    avatar?: {
      url: string;
    };
  };
  inviter: {
    _id: string;
    username: string;
  };
  inviteDate: number;
  status: "pending";
}

interface UseGroupInvitedAdminsProps {
  groupId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
  onRevokeSuccess?: () => void;
}

export const useGroupInvitedAdmins = ({ groupId, role, onRevokeSuccess }: UseGroupInvitedAdminsProps) => {
  const [invitedAdmins, setInvitedAdmins] = useState<InvitedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchInvitedAdmins = useCallback(
    async (newPage = 1, append = false) => {
      if (newPage > totalPages && totalPages !== 0 && append) {
        setIsLoadingMore(false);
        setLoading(false);
        return;
      }

      setLoading(!append);
      setIsLoadingMore(append);
      setError(null);

      try {
        const pendingAdminsClient = restClient.apiClient.service(`apis/groups/${groupId}/pending-admins`);

        const response = await pendingAdminsClient.find({
          query: {
            page: newPage,
            limit: 5,
          },
        });
        console.log(response)

        if (response.success) {
          const formattedData: InvitedAdmin[] = (response.data || []).map((admin: any) => ({
            inviteId: admin.id,
            invitedUser: {
                _id: admin.userId || admin.invitedUserId || admin._id,
                username: admin.fullName || "Người dùng không xác định",
                avatar: { url: admin.avatar || "" }
            },
            inviter: {
                _id: admin.inviterId || "",
                username: admin.inviterName || ""
            },
            inviteDate: admin.inviteDate,
            status: "pending",
          }));

          setInvitedAdmins((prev) => (append ? [...prev, ...formattedData] : formattedData));
          console.log('invitedAdmins', invitedAdmins)
          setTotalPages(response.totalPages || 1);
          setPage(newPage);
        } else {
          setError(response.message || "Không thể tải danh sách lời mời quản trị viên.");
          setInvitedAdmins([]);
        }
      } catch (err: any) {
        console.error("❌ Lỗi khi tải danh sách lời mời quản trị viên:", err);
        setError("Có lỗi xảy ra khi tải danh sách lời mời quản trị viên.");
        setInvitedAdmins([]);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [groupId, totalPages]
  );

  useEffect(() => {
    if (role === "Owner") {
      fetchInvitedAdmins(1);
    } else {
      setLoading(false);
      setError("Bạn không có quyền xem danh sách này.");
    }
  }, [role, fetchInvitedAdmins]);

  const loadMoreInvitedAdmins = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      fetchInvitedAdmins(page + 1, true);
    }
  }, [isLoadingMore, page, totalPages, fetchInvitedAdmins]);

  const handleRevokeInvite = useCallback(
    async (invitedUserId: string, invitedUserName: string) => {
      Alert.alert(
        "Xác nhận thu hồi",
        `Bạn có chắc chắn muốn thu hồi lời mời làm quản trị viên cho ${invitedUserName} không?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Thu hồi",
            onPress: async () => {
              if (!invitedUserId || invitedUserId.trim() === "") {
                  Alert.alert("Lỗi", "Không tìm thấy ID người dùng để thu hồi lời mời.");
                  console.error("❌ Attempted to revoke invite with invalid userId:", invitedUserId);
                  return;
              }

              try {
                const response = await groupsClient.patch(`${groupId}/members/${invitedUserId}`, { state: "remove-admin" });
                console.log("API Response for revoke:", response); 

                if (response.success) {
                  Alert.alert("Thành công", `Đã thu hồi lời mời đến ${invitedUserName}.`);
                  setPage(1);
                  setTotalPages(1);
                  await fetchInvitedAdmins(1);
                  if (onRevokeSuccess) {
                    onRevokeSuccess();
                  }
                } else {
                  Alert.alert("Lỗi", response.message || "Không thể thu hồi lời mời.");
                }
              } catch (err: any) {
                Alert.alert("Lỗi", err.message || "Đã xảy ra lỗi khi thu hồi lời mời.");
                console.error("❌ Lỗi khi thu hồi lời mời:", err);
              }
            },
          },
        ]
      );
    },
    [groupId, fetchInvitedAdmins, onRevokeSuccess]
  );

  return {
    invitedAdmins,
    loading,
    error,
    isLoadingMore,
    loadMoreInvitedAdmins,
    handleRevokeInvite,
    fetchInvitedAdmins: () => fetchInvitedAdmins(1), 
  };
};