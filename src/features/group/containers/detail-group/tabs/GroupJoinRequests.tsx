import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import MemberRequestItem from "@/src/features/group/components/MemberRequestItem";
import getColor from "@/src/styles/Color";
import restClient from "@/src/shared/services/RestClient";
import { useGroupJoinRequests } from "./useGroupJoinRequests";

const Color = getColor();
const groupsClient = restClient.apiClient.service("apis/groups");

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
    filteredRequests,
    handleAccept,
    handleReject,
  } = useGroupJoinRequests(groupId);

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
          <ActivityIndicator size="large" color={Color.mainColor1} />
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
});