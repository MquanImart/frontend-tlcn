// src/features/group/containers/detail-group/tabs/GroupInvitedAdmins.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import InvitedAdminItem from "@/src/features/group/components/InvitedAdminItem"; 
import { useGroupInvitedAdmins } from "./useGroupInvitedAdmins";

interface GroupInvitedAdminsProps {
  groupId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
  fetchGroupMembers?: () => void; 
}

const GroupInvitedAdmins: React.FC<GroupInvitedAdminsProps> = ({ groupId, currentUserId, role, fetchGroupMembers }) => {
  const { theme } = useTheme(); 
  const {
    invitedAdmins,
    loading,
    error,
    isLoadingMore,
    loadMoreInvitedAdmins,
    handleRevokeInvite,
    fetchInvitedAdmins: refetchInvitedAdmins
  } = useGroupInvitedAdmins({ 
      groupId, 
      currentUserId, 
      role, 
      onRevokeSuccess: fetchGroupMembers 
  });


  if (loading && !isLoadingMore) {
    return (
      <View style={[styles.centered, { backgroundColor: Color.background }]}>
        <ActivityIndicator size="large" color={Color.mainColor2} />
        <Text style={{ color: Color.textPrimary, marginTop: 10 }}>Đang tải danh sách lời mời...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: Color.background }]}>
        <Text style={[styles.errorText, { color: Color.error }]}>{error}</Text>
        <TouchableOpacity onPress={refetchInvitedAdmins}>
          <Text style={[styles.retryText, { color: Color.mainColor2 }]}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      {invitedAdmins.length === 0 && !loading ? (
        <Text style={[styles.emptyText, { color: Color.textSecondary }]}>Chưa có lời mời quản trị viên nào đang chờ.</Text>
      ) : (
        <FlatList
          data={invitedAdmins}
          keyExtractor={(item) => item.inviteId}
          renderItem={({ item }) => (
            <InvitedAdminItem
              name={item.invitedUser?.username || "Người dùng không xác định"}
              avatar={item.invitedUser?.avatar?.url || ""}
              inviteDate={new Date(item.inviteDate).toLocaleDateString("vi-VN")}
              onRevoke={() => handleRevokeInvite(item.inviteId || "", item.invitedUser?.username || "người dùng này")}
              showRevokeButton={role === "Owner"} 
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreInvitedAdmins}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={Color.mainColor2} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default GroupInvitedAdmins;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: Color.error,
  },
  retryText: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
    color: Color.mainColor2,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: Color.textSecondary,
  },
  listContent: {
    paddingBottom: 20,
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: Color.border,
    alignItems: 'center',
  },
});