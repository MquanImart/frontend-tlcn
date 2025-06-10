import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, Alert } from "react-native";
import FriendCard from "@/src/features/friends/components/FriendCard";
import CButton from "@/src/shared/components/button/CButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { ButtonActions } from "@/src/features/friends/components/ActionsCard";
import restClient from "@/src/shared/services/RestClient";
import { MyPhoto } from "@/src/interface/interface_reference";
import { StackNavigationProp } from "@react-navigation/stack";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";

export interface Friend {
  _id: string;
  displayName: string;
  avt: MyPhoto[];
  aboutMe?: string;
}

interface SearchUserProps {
  textSearch: string;
  userId: string;
  navigation: StackNavigationProp<SearchStackParamList, "SearchUserAndGroup">;
}

const SearchUser: React.FC<SearchUserProps> = ({ textSearch, userId, navigation }) => {
  useTheme()
  const [allFriends, setAllFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5;

  const HandleButton = (_id: string) => {
    return ButtonActions({
      label: ["Xem trang cá nhân"],
      actions: [() => navigation.navigate("MyProfile", {
          screen: 'Profile',
          params: { userId: _id },
        })],
    });
  };

  const getAllFriends = async (reset: boolean = false, currentPage: number = page) => {
    console.log("textSearch:", textSearch);
    if (!textSearch.trim() || (!reset && !hasMore)) {
      if (!textSearch.trim()) {
        setAllFriends([]);
        setTotal(0);
        setPage(1);
        setHasMore(true);
      }
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const skip = reset ? 0 : (currentPage - 1) * limit;
      const queryParams = new URLSearchParams({
        displayName: textSearch.trim(),
        limit: limit.toString(),
        skip: skip.toString(),
      }).toString();

      const result = await restClient.apiClient.service(`apis/users/search?${queryParams}`).find({
        headers: { "Cache-Control": "no-cache" },
      });


      if (result.success) {
        const users: Friend[] = Array.isArray(result.data) ? result.data : [];
        const filteredData = users.filter(
          (friend: Friend) => friend._id !== userId && !allFriends.some(existing => existing._id === friend._id)
        );

        setAllFriends(prev => {
          const newFriends = reset ? filteredData : [...prev, ...filteredData];
          return newFriends;
        });
        setTotal(result.total || filteredData.length);
        setHasMore(filteredData.length > 0 && skip + filteredData.length < (result.total || filteredData.length));
      } else {
        Alert.alert("Lỗi tìm kiếm", result.message || "Không thể lấy danh sách người dùng");
        console.error("API trả về không thành công:", result);
      }
    } catch (error: any) {
      Alert.alert("Lỗi hệ thống", error.message || "Đã xảy ra lỗi khi lấy danh sách người dùng");
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setAllFriends([]);
    setHasMore(true);
    getAllFriends(true, 1);
  }, [textSearch]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prevPage => {
        const newPage = prevPage + 1;
        getAllFriends(false, newPage);
        return newPage;
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      {isLoading && page === 1 ? (
        <Text style={[styles.loadingText, { color: Color.textPrimary }]}>Đang tải...</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {allFriends.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: Color.textSecondary }]}>
                {textSearch
                  ? `Không tìm thấy người dùng nào cho "${textSearch}"`
                  : "Vui lòng nhập từ khóa để tìm kiếm"}
              </Text>
            </View>
          ) : (
            <>
              {allFriends.map((item) => (
                <View key={item._id} style={styles.boxCard}>
                  <FriendCard
                    _id={item._id}
                    name={item.displayName}
                    img={item.avt}
                    aboutMe={item.aboutMe || ""}
                    button={() => HandleButton(item._id)}
                    profile={true}
                  />
                </View>
              ))}
              {isLoading && <Text style={[styles.loadingText, { color: Color.textPrimary }]}>Đang tải thêm...</Text>}
              {hasMore && (
                <View style={styles.buttonContainer}>
                  <CButton
                    label="Xem thêm kết quả khác"
                    onSubmit={handleLoadMore}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      height: 40,
                      backColor: isLoading ? Color.backgroundTertiary : Color.mainColor2,
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

export default SearchUser;