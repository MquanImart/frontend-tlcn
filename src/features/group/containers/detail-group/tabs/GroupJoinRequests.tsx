import MemberRequestItem from "@/src/features/group/components/MemberRequestItem";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useGroupJoinRequests } from "./useGroupJoinRequests";

interface GroupJoinRequestsProps {
  groupId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
}

interface PendingMember {
  id: string;
  fullName: string;
  avatar: string;
  joinDate: string;
}

const GroupJoinRequests: React.FC<GroupJoinRequestsProps> = ({
  currentUserId,
  groupId,
  role,
}) => {
  const {
    searchText,
    setSearchText,
    loading,
    error,
    filteredRequests,
    handleAccept,
    handleReject,
    loadMoreRequests,
    isLoadingMore,
    fetchPendingMembers,
  } = useGroupJoinRequests(groupId);
  useTheme(); // Kích hoạt theme context

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: Color.background }]} // Sử dụng màu nền động
    >
      <View style={styles.innerContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              borderColor: Color.border,
              backgroundColor: Color.backgroundSecondary,
              color: Color.textPrimary,
            },
          ]}
          placeholder="Nhập tên thành viên"
          placeholderTextColor={Color.textTertiary} // Sử dụng màu placeholder động
          value={searchText}
          onChangeText={setSearchText}
        />

        {loading ? (
          <ActivityIndicator size="large" color={Color.mainColor2} style={styles.loading} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: Color.error }]}>{error}</Text> {/* Sử dụng màu lỗi động */}
            <TouchableOpacity onPress={() => fetchPendingMembers(1)}>
              <Text style={[styles.retryText, { color: Color.mainColor2 }]}>Thử lại</Text> {/* Sử dụng màu động */}
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MemberRequestItem
                name={item.fullName}
                avatar={
                  item.avatar.length > 0
                    ? item.avatar
                    : "https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png"
                }
                requestDate={item.joinDate}
                onAccept={() => handleAccept(item.id)}
                onReject={() => handleReject(item.id)}
              />
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: Color.textSecondary }]}>Không có yêu cầu nào</Text> // Sử dụng màu chữ động
            }
            onEndReached={loadMoreRequests}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.footer}>
                  <ActivityIndicator size="large" color={Color.mainColor2} />
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => fetchPendingMembers(1)}
                colors={[Color.mainColor2]} // Màu cho refresh indicator
              />
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default GroupJoinRequests;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: Color.backGround, // Moved to inline style for dynamic update
  },
  innerContainer: {
    flex: 1,
    padding: 20,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    // borderColor: Color.borderColor1, // Moved to inline style
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    // backgroundColor: "#fff", // Moved to inline style
    // color: Color.textColor1, // Moved to inline style
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    // color: Color.textColor3, // Moved to inline style
    marginTop: 20,
  },
  loading: {
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    // color: "red", // Moved to inline style
    textAlign: "center",
  },
  retryText: {
    fontSize: 16,
    // color: Color.mainColor2, // Moved to inline style
    marginTop: 10,
    fontWeight: "bold",
  },
  footer: {
    padding: 10,
    alignItems: "center",
  },
});