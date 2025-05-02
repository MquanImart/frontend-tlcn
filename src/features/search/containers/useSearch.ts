import { useState, useEffect } from "react";
import restClient from "@/src/shared/services/RestClient";
import { SuggestFriends } from "@/src/features/friends/containers/suggest-friends/useSuggestFriends";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useSearch = () => {
  const [allFriends, setAllFriends] = useState<SuggestFriends[] | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isHashSearch, setIsHashSearch] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showAllHistory, setShowAllHistory] = useState<boolean>(false);

  const getUserId = async () => {
    try {
      const id = await AsyncStorage.getItem("userId");
      if (id) {
        setUserId(id);
      } else {
        console.error("No userId found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error fetching userId from AsyncStorage:", error);
    }
  };

  const getAllFriends = async () => {
    if (!userId) {
      console.error("userId is null, cannot fetch friends");
      return;
    }
    try {
      const friendsAPI = restClient.apiClient.service(`apis/users/${userId}/suggest`);
      const result = await friendsAPI.find({});
      if (result.success) {
        setAllFriends(result.data);
        console.log("Fetched friends:", result.data);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const getHistorySearch = async () => {
    if (!userId) {
      console.error("userId is null, cannot fetch search history");
      return;
    }
    try {
      const historyAPI = restClient.apiClient.service(`apis/historysearches/user/${userId}`);
      const result = await historyAPI.find({});
      if (result.success && result.data && result.data.keySearch) {
        setHistory(result.data.keySearch);
      }
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  const addHistorySearch = async (idUser: string, keySearch: string) => {
    try {
      const historyAPI = restClient.apiClient.service("apis/historysearches");
      const result = await historyAPI.create({ idUser, keySearch });
      if (result.success && result.data && result.data.keySearch) {
        setHistory(result.data.keySearch);
      }
      return result;
    } catch (error) {
      console.error("Error adding search history:", error);
      throw error;
    }
  };

  const updateHistorySearchByIdUser = async (idUser: string, updatedKeySearch: string[]) => {
    try {
      const historyAPI = restClient.apiClient.service(`apis/historysearches/user/${idUser}`);
      const result = await historyAPI.patch("", { keySearch: updatedKeySearch });
      if (result.success && result.data && result.data.keySearch) {
        setHistory(result.data.keySearch);
      }
      return result;
    } catch (error) {
      console.error("Error updating search history:", error);
      throw error;
    }
  };

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      getAllFriends();
      getHistorySearch();
    }
  }, [userId]);

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    if (text.trim() === "") {
      setIsSearching(false);
      setSearchQuery("");
      setIsHashSearch(false);
    }
  };

  const handleSearch = async () => {
    if (searchText.trim() === "") return;

    setSearchQuery(searchText);
    setIsSearching(true);

    if (searchText.includes("#")) {
      setIsHashSearch(true);
    } else {
      setIsHashSearch(false);
    }

    try {
      if (userId) {
        await addHistorySearch(userId, searchText);
      } else {
        console.error("userId is null, cannot add history search");
      }
    } catch (error) {
      console.error("Error handling search:", error);
    }
  };

  const handleClearSearch = () => {
    setSearchText("");
    setSearchQuery("");
    setIsSearching(false);
    setIsHashSearch(false);
  };

  const handleRemoveHistoryItem = async (item: string) => {
    const updatedHistory = history.filter((historyItem) => historyItem !== item);
    setHistory(updatedHistory);
    try {
      if (userId) {
        await updateHistorySearchByIdUser(userId, updatedHistory);
      } else {
        console.error("userId is null, cannot update history search");
      }
    } catch (error) {
      console.error("Error removing search history item:", error);
      setHistory(history); // Revert back if error occurs
    }
  };

  const HandleButton = (_id: string) => {
    return {
      label: ["Xem trang cá nhân"],
      actions: [(_id: string) => ({ screen: "Profile", params: { userId: _id } })], // Trả về cấu trúc điều hướng
    };
  };

  const displayedHistory = showAllHistory ? history : history.slice(0, 4);

  return {
    allFriends,
    searchText,
    searchQuery,
    isHashSearch,
    isSearching,
    history,
    showAllHistory,
    displayedHistory,
    setSearchText,
    setShowAllHistory,
    getAllFriends,
    getHistorySearch,
    addHistorySearch,
    updateHistorySearchByIdUser,
    handleSearchTextChange,
    handleSearch,
    handleClearSearch,
    handleRemoveHistoryItem,
    HandleButton,
  };
};

export default useSearch;