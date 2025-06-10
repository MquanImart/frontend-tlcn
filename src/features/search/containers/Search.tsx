import { ButtonActions } from "@/src/features/friends/components/ActionsCard";
import FriendCard from "@/src/features/friends/components/FriendCard";
import CIconButton from "@/src/shared/components/button/CIconButton";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors'; // Đảm bảo import đúng
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
    handleSearch,
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

    const { searchQuery: latestSearchQuery, isHashSearch: latestIsHashSearch } = await handleSearch();

    console.log("handleSearchSubmit: latestSearchQuery =", latestSearchQuery, "latestIsHashSearch =", latestIsHashSearch);

    if (latestSearchQuery.length > 0) {
      if (latestIsHashSearch) {
        console.log("Navigating to SearchPost with textSearch (hashtags) =", latestSearchQuery);
        navigation.navigate("SearchPost", { textSearch: latestSearchQuery });
      } else {
        console.log("Navigating to SearchUserAndGroup with textSearch (full text) =", searchText);
        navigation.navigate("SearchUserAndGroup", { textSearch: searchText, userId });
      }
    } else {
      console.log("No valid search query after handleSearch, not navigating.");
    }
  };

  const handleHistoryItemPress = async (item: string) => {
    console.log("handleHistoryItemPress: item =", item);
    setSearchText(item);

    if (!userId) {
      console.error("User ID is not available, cannot navigate from history.");
      return;
    }

    const keywordsFromHistory = item
      .split(" ")
      .filter((word) => word.startsWith("#") && word.length > 1);

    const isHash = keywordsFromHistory.length > 0;

    if (isHash) {
      console.log("Navigating from history to SearchPost with hashtags:", keywordsFromHistory);
      navigation.navigate("SearchPost", { textSearch: keywordsFromHistory });
    } else {
      console.log("Navigating from history to SearchUserAndGroup with text:", item);
      navigation.navigate("SearchUserAndGroup", { textSearch: item, userId });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      <View style={{ marginBottom: 40 }} />
      <View style={[styles.containerSearch, { backgroundColor: Color.background }]}>
        <CIconButton
          icon={<Ionicons name="arrow-back" size={24} color={Color.textPrimary} />} 
          onSubmit={() => navigation.goBack()}
          style={{
            width: 40,
            height: 50,
            backColor: Color.background, 
            textColor: Color.textPrimary, 
            fontSize: 16,
            fontWeight: "normal",
            radius: 0,
            flex_direction: "row",
          }}
        />
        <View style={[styles.inputContainer, { backgroundColor: Color.backgroundTertiary }]}>
          <TextInput
            style={[styles.input, { color: Color.textPrimary }]} 
            placeholder="Nhập nội dung tìm kiếm"
            placeholderTextColor={Color.textTertiary} 
            value={searchText}
            onChangeText={handleSearchTextChange}
            onSubmitEditing={handleSearchSubmit}
          />
          {searchText.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
              <Ionicons name="close" size={20} color={Color.textSecondary} /> 
            </TouchableOpacity>
          )}
        </View>
        <CIconButton
          icon={<Ionicons name="search" size={24} color={Color.textPrimary} />} 
          onSubmit={handleSearchSubmit}
          style={{
            width: 50,
            height: 50,
            backColor: Color.background, 
            textColor: Color.textPrimary, 
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
              onPress={() => handleHistoryItemPress(item)}
            >
              <Text style={[styles.historyText, { color: Color.textPrimary }]}>{item}</Text>
              <TouchableOpacity onPress={() => handleRemoveHistoryItem(item)}>
                <Ionicons name="close" size={18} color={Color.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.viewAllButton, { backgroundColor: Color.backgroundTertiary }]} 
            onPress={() => setShowAllHistory(!showAllHistory)}
          >
            <Text style={[styles.viewAllText, { color: Color.mainColor2 }]}>
              {showAllHistory ? "Thu gọn lịch sử" : "Xem tất cả lịch sử tìm kiếm"}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.suggestedText, { color: Color.textPrimary }]}>Có thể bạn biết</Text>
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
    backgroundColor: Color.background, 
  },
  containerSearch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Color.background, 
    borderRadius: 25,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Color.backgroundTertiary, 
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
    backgroundColor: Color.backgroundTertiary, 
    color: Color.textPrimary, 
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
    color: Color.textPrimary, 
  },
  viewAllButton: {
    marginTop: 10,
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    backgroundColor: Color.backgroundTertiary, 
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
    color: Color.textPrimary, 
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