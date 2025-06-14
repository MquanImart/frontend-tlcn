import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Text, Alert } from "react-native";
import GroupCard from "@/src/features/group/components/GroupCard";
import CButton from "@/src/shared/components/button/CButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import restClient from "@/src/shared/services/RestClient";
import { Group } from "@/src/features/newfeeds/interface/article";
import { StackNavigationProp } from "@react-navigation/stack";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";
import { useExplore } from "@/src/features/group/containers/group/tabs/useExplore";

const groupsClient = restClient.apiClient.service("apis/groups");

interface SearchGroupProps {
  textSearch: string;
  userId: string;
  navigation: StackNavigationProp<SearchStackParamList, "SearchUserAndGroup">;
}

const SearchGroup: React.FC<SearchGroupProps> = ({ textSearch, userId, navigation }) => {
  useTheme();
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const { 
    groupsNotJoined, 
    loading, error, 
    handleJoinGroup, 
    loadMoreGroups, 
    handleCancelJoinRequest 
  } = useExplore(userId);


  const fetchGroups = useCallback(
    async (newPage = 1, append = false) => {
      if (newPage > totalPages && totalPages !== 0) return;

      if (textSearch.trim() === "") {
        setAllGroups([]);
        setTotalPages(1);
        setPage(1);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      setIsLoading(!append);
      setIsLoadingMore(append);

      try {
        console.log("Fetching groups with textSearch:", textSearch);
        const skip = (newPage - 1) * limit;
        const queryParams = new URLSearchParams({
          groupName: textSearch.trim(),
          userId: userId,
          limit: limit.toString(),
          skip: skip.toString(),
        }).toString();

        const response = await restClient.apiClient
          .service(`apis/users/groups/search?${queryParams}`)
          .find({ headers: { 'Cache-Control': 'no-cache' } });

        if (response.success) {
          const validGroups = (response.data || []).filter(
            (group: Group) => group && group._id
          );
          setAllGroups((prev) => (append ? [...prev, ...validGroups] : validGroups));
          setTotalPages(response.totalPages || Math.ceil(response.total / limit));
          setPage(newPage);
        } else {
          Alert.alert("Lỗi tìm kiếm", response.message || "Không thể lấy danh sách nhóm");
          console.error("API trả về không thành công:", response);
        }
      } catch (error: any) {
        Alert.alert("Lỗi hệ thống", error.message || "Đã xảy ra lỗi khi lấy danh sách nhóm");
        console.error("Lỗi khi lấy danh sách nhóm:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [textSearch, userId, totalPages, limit]
  );

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      fetchGroups(page + 1, true);
    }
  }, [page, totalPages, isLoadingMore, fetchGroups]);

  useEffect(() => {
    fetchGroups(1, false);
  }, [textSearch, fetchGroups]);

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      {isLoading && page === 1 ? (
        <Text style={[styles.loadingText, { color: Color.textPrimary }]}>Đang tải...</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {allGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: Color.textSecondary }]}>
                {textSearch
                  ? `Không tìm thấy nhóm nào cho "${textSearch}"`
                  : "Vui lòng nhập từ khóa để tìm kiếm hoặc không có nhóm nào"}
              </Text>
            </View>
          ) : (
            <>
              {allGroups.map((item) => (
                <View key={item._id} style={styles.boxCard}>
                  <GroupCard
                    group={item}
                    currentUserId={userId}
                    onJoinGroup={handleJoinGroup}
                    onViewGroup={() =>
                      navigation.navigate("GroupDetailsScreen", {
                        groupId: item._id,
                        currentUserId: userId,
                      })
                    }
                  onCancelJoinRequest={handleCancelJoinRequest}
                  />
                </View>
              ))}
              {isLoadingMore && <Text style={[styles.loadingText, { color: Color.textPrimary }]}>Đang tải thêm...</Text>}
              {page < totalPages && (
                <View style={styles.buttonContainer}>
                  <CButton
                    label="Xem thêm kết quả khác"
                    onSubmit={handleLoadMore}
                    disabled={isLoadingMore}
                    style={{
                      width: "100%",
                      height: 40,
                      backColor: isLoadingMore ? Color.backgroundTertiary : Color.mainColor2,
                      textColor: Color.textOnMain1,
                      fontSize: 14,
                      fontWeight: "bold",
                      radius: 20,
                      flex_direction: "row",
                    }}
                  />
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  boxCard: {
    width: "95%",
    alignSelf: "center",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: Color.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Color.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
  },
  buttonContainer: {
    width: "80%",
    alignSelf: "center",
    marginVertical: 10,
  },
});

export default SearchGroup;