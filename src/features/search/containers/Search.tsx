import React, { useEffect, useState } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SearchUserAnhGroup from "./SearchUserAndGroup/SearchUserAndGroup";
import CIconButton from "@/src/shared/components/button/CIconButton";
import PostSearch from "./SearchPost/PostSearch";
import FriendCard from "../../friends/components/FriendCard";
import { ButtonActions } from "../components/ActionsCard";
import getColor from "@/src/styles/Color";
import useSearch from "./useSearch";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SearchNavigationProp = StackNavigationProp<SearchStackParamList, "Search">;
const Color = getColor();

const Search = () => {
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
    searchQuery,
    isHashSearch,
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
            onSubmitEditing={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
              <Ionicons name="close" size={20} color="#000" />
            </TouchableOpacity>
          )}
        </View>
        <CIconButton
          icon={<Ionicons name="search" size={24} color="#000" />}
          onSubmit={handleSearch}
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
              onPress={() => handleSearchTextChange(item)}
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
                            navigation.navigate(navConfig.screen as "Profile", navConfig.params);
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

      {isSearching && (
        <>
          {isHashSearch ? (
            <PostSearch textSearch={searchQuery} />
          ) : (
            <SearchUserAnhGroup
              textSearch={searchQuery}
              userId={userId ?? ""}
              navigation={navigation}
            />
          )}
        </>
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
    color: Color.mainColor1,
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