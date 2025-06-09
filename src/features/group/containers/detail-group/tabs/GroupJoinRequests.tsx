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
  useTheme();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập tên thành viên"
          placeholderTextColor={Color.textColor3}
          value={searchText}
          onChangeText={setSearchText}
        />

        {loading ? (
          <ActivityIndicator size="large" color={Color.mainColor1} style={styles.loading} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchPendingMembers(1)}>
              <Text style={styles.retryText}>Thử lại</Text>
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
              <Text style={styles.emptyText}>Không có yêu cầu nào</Text>
            }
            onEndReached={loadMoreRequests}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.footer}>
                  <ActivityIndicator size="large" color={Color.mainColor1} />
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => fetchPendingMembers(1)}
                colors={[Color.mainColor1]}
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
    backgroundColor: Color.backGround,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: Color.borderColor1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: Color.textColor1,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: Color.textColor3,
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
    color: "red",
    textAlign: "center",
  },
  retryText: {
    fontSize: 16,
    color: Color.mainColor1,
    marginTop: 10,
    fontWeight: "bold",
  },
  footer: {
    padding: 10,
    alignItems: "center",
  },
});