import { ButtonActions } from "@/src/features/friends/components/ActionsCard";
import FriendCard from "@/src/features/friends/components/FriendCard";
import CIconButton from "@/src/shared/components/button/CIconButton";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import useSearch from "./useSearch";
import { ProfileStackParamList } from "@/src/shared/routes/ProfileNavigation";

type SearchNavigationProp = StackNavigationProp<SearchStackParamList, "Search">;

const Search: React.FC = () => {
  useTheme()
  const navigation = useNavigation<SearchNavigationProp>();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const id = await AsyncStorage.getItem("userId");
        setUserId(id);
      } catch (err) {
        console.error("Lỗi khi lấy userId:", err);
      }
    };
    getUserId();
  }, []);

  const {
    allFriends,
    searchText,
    setSearchText,
    isSearching,
    displayedHistory,
    showAllHistory,
    handleSearchTextChange,
    handleSearch, // Hàm này giờ trả về giá trị
    handleClearSearch,
    handleRemoveHistoryItem,
    HandleButton,
    setShowAllHistory,
  } = useSearch();

  const handleSearchSubmit = async () => {
    if (searchText.trim() === "") {
      console.log("Search text is empty, aborting search");
      return;
    }

    if (!userId) {
      console.error("User ID is not available, cannot perform search.");
      return;
    }

    // Chờ handleSearch hoàn thành và lấy giá trị mới nhất
    const { searchQuery: latestSearchQuery, isHashSearch: latestIsHashSearch } = await handleSearch();

    console.log("handleSearchSubmit: latestSearchQuery =", latestSearchQuery, "latestIsHashSearch =", latestIsHashSearch);

    if (latestSearchQuery.length > 0) { // Đảm bảo có query để tìm kiếm
      if (latestIsHashSearch) {
        console.log("Navigating to SearchPost with textSearch (hashtags) =", latestSearchQuery);
        navigation.navigate("SearchPost", { textSearch: latestSearchQuery });
      } else {
        // Đối với tìm kiếm người dùng/nhóm, chúng ta cần searchText ban đầu
        console.log("Navigating to SearchUserAndGroup with textSearch (full text) =", searchText);
        navigation.navigate("SearchUserAndGroup", { textSearch: searchText, userId });
      }
    } else {
      console.log("No valid search query after handleSearch, not navigating.");
    }
  };

  const handleHistoryItemPress = async (item: string) => {
    console.log("handleHistoryItemPress: item =", item);
    setSearchText(item); // Cập nhật ô input với mục lịch sử

    if (!userId) {
      console.error("User ID is not available, cannot navigate from history.");
      return;
    }

    // Xác định loại tìm kiếm từ mục lịch sử
    const keywordsFromHistory = item
      .split(" ")
      .filter((word) => word.startsWith("#") && word.length > 1);

    const isHash = keywordsFromHistory.length > 0;

    // Điều hướng dựa trên loại tìm kiếm của mục lịch sử
    if (isHash) {
      console.log("Navigating from history to SearchPost with hashtags:", keywordsFromHistory);
      navigation.navigate("SearchPost", { textSearch: keywordsFromHistory });
    } else {
      console.log("Navigating from history to SearchUserAndGroup with text:", item);
      navigation.navigate("SearchUserAndGroup", { textSearch: item, userId });
    }

    // Bạn có thể cân nhắc gọi addHistorySearch ở đây nếu bạn muốn đảm bảo
    // mục lịch sử này được đưa lên đầu danh sách tìm kiếm gần đây.
    // await addHistorySearch(userId, item); // Nếu bạn muốn cập nhật vị trí trong lịch sử
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 40 }} />
      <View style={styles.containerSearch}>
        <CIconButton
          icon={<Ionicons name="arrow-back" size={24} color="#000" />}
          onSubmit={() => navigation.goBack()}
          style={{
            width: 40,
            height: 50,
            backColor: Color.white_homologous,
            textColor: Color.white_contrast,
            fontSize: 16,
            fontWeight: "normal",
            radius: 0,
            flex_direction: "row",
          }}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập nội dung tìm kiếm"
            placeholderTextColor="#000"
            value={searchText}
            onChangeText={handleSearchTextChange}
            onSubmitEditing={handleSearchSubmit}
          />
          {searchText.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
              <Ionicons name="close" size={20} color="#000" />
            </TouchableOpacity>
          )}
        </View>
        <CIconButton
          icon={<Ionicons name="search" size={24} color="#000" />}
          onSubmit={handleSearchSubmit}
          style={{
            width: 50,
            height: 50,
            backColor: Color.white_homologous,
            textColor: Color.white_contrast,
            fontSize: 16,
            fontWeight: "normal",
            radius: 20,
            flex_direction: "row",
          }}
        />
      </View>

      {!isSearching && (
        <ScrollView style={styles.searchHistoryContainer}>
          {displayedHistory.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.historyItem}
              onPress={() => handleHistoryItemPress(item)} // Gọi hàm mới ở đây
            >
              <Text style={styles.historyText}>{item}</Text>
              <TouchableOpacity onPress={() => handleRemoveHistoryItem(item)}>
                <Ionicons name="close" size={18} color="#000" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => setShowAllHistory(!showAllHistory)}
          >
            <Text style={styles.viewAllText}>
              {showAllHistory ? "Thu gọn lịch sử" : "Xem tất cả lịch sử tìm kiếm"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.suggestedText}>Có thể bạn biết</Text>
          <ScrollView style={styles.listCard}>
            {allFriends &&
              allFriends.map((item) => (
                <View key={item.friend._id} style={styles.boxCard}>
                  <FriendCard
                    _id={item.friend._id}
                    name={item.friend.displayName}
                    img={item.friend.avt}
                    aboutMe={item.friend.aboutMe ? item.friend.aboutMe : ""}
                    button={() => {
                      const buttonConfig = HandleButton(item.friend._id);
                      return ButtonActions({
                        label: buttonConfig.label,
                        actions: [
                          () => {
                            const navConfig = buttonConfig.actions[0](item.friend._id);
                            navigation.navigate("MyProfile", {
                              screen: navConfig.screen as keyof ProfileStackParamList,
                              params: navConfig.params,
                            });
                          },
                        ],
                      });
                    }}
                  />
                </View>
              ))}
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white_homologous,
  },
  containerSearch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Color.white_homologous,
    borderRadius: 25,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Color.backGround2,
    borderRadius: 25,
    position: "relative",
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingLeft: 10,
    borderRadius: 20,
    paddingRight: 40,
    backgroundColor: Color.backGround2,
  },
  clearButton: {
    position: "absolute",
    right: 5,
    padding: 10,
  },
  searchHistoryContainer: {
    padding: 10,
    flex: 1,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  historyText: {
    fontSize: 16,
  },
  viewAllButton: {
    marginTop: 10,
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    backgroundColor: Color.backGround2,
  },
  viewAllText: {
    color: Color.mainColor2,
  },
  suggestedText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 10,
    color: Color.white_contrast,
  },
  listCard: {
    paddingVertical: 10,
  },
  boxCard: {
    width: "95%",
    alignSelf: "center",
  },
});

export default Search;