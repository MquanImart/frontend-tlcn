import { SuggestFriends } from "@/src/features/friends/containers/suggest-friends/useSuggestFriends";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const useSearch = () => {
  const [allFriends, setAllFriends] = useState<SuggestFriends[] | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string[]>([]);
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
        console.error("Không tìm thấy userId trong AsyncStorage");
      }
    } catch (error) {
      console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
    }
  };

  const getAllFriends = async () => {
    if (!userId) {
      console.error("userId rỗng, không thể lấy danh sách bạn bè");
      return;
    }
    try {
      const friendsAPI = restClient.apiClient.service(`apis/users/${userId}/suggest`);
      const result = await friendsAPI.find({});
      if (result.success) {
        setAllFriends(result.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
    }
  };

  const getHistorySearch = async () => {
    if (!userId) {
      console.error("userId rỗng, không thể lấy lịch sử tìm kiếm");
      return;
    }
    try {
      const historyAPI = restClient.apiClient.service(`apis/historysearches/user/${userId}`);
      const result = await historyAPI.find({});
      if (result.success && result.data && result.data.keySearch) {
        setHistory(result.data.keySearch);
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử tìm kiếm:", error);
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
      console.error("Lỗi khi thêm lịch sử tìm kiếm:", error);
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
      console.error("Lỗi khi cập nhật lịch sử tìm kiếm:", error);
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
      setSearchQuery([]);
      setIsHashSearch(false);
    }
  };

  const handleSearch = async () => {
    if (searchText.trim() === "") {
      setIsSearching(false);
      setSearchQuery([]);
      setIsHashSearch(false);
      return { searchQuery: [], isHashSearch: false };
    }

    const words = searchText.split(" ").filter((word) => word.length > 0);
    const hasHashtag = words.some((word) => word.startsWith("#") && word.length > 1);

    let currentSearchQuery: string[];
    if (hasHashtag) {
      // Nếu có ít nhất một từ bắt đầu bằng '#', lấy tất cả các từ có '#' và giữ nguyên dấu '#'
      currentSearchQuery = words.filter((word) => word.startsWith("#") && word.length > 1);
    } else {
      // Nếu không có hashtag, coi toàn bộ searchText là một query duy nhất
      currentSearchQuery = [searchText]; // Tìm kiếm cả cụm từ
    }

    setSearchQuery(currentSearchQuery);
    setIsSearching(true);
    setIsHashSearch(hasHashtag);

    try {
      if (userId) {
        await addHistorySearch(userId, searchText);
      } else {
        console.error("userId rỗng, không thể thêm lịch sử tìm kiếm");
      }
    } catch (error) {
      console.error("Lỗi khi xử lý tìm kiếm:", error);
    }
    // Trả về giá trị đã được cập nhật
    return { searchQuery: currentSearchQuery, isHashSearch: hasHashtag };
  };

  const handleClearSearch = () => {
    setSearchText("");
    setSearchQuery([]);
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
        console.error("userId rỗng, không thể cập nhật lịch sử tìm kiếm");
      }
    } catch (error) {
      console.error("Lỗi khi xóa mục lịch sử tìm kiếm:", error);
      setHistory(history); // Khôi phục nếu có lỗi
    }
  };

  const HandleButton = (_id: string) => {
    return {
      label: ["Xem trang cá nhân"],
      actions: [(_id: string) => ({ screen: "Profile", params: { userId: _id } })],
    };
  };

  const displayedHistory = showAllHistory ? history : history.slice(0, 4);

  return {
    allFriends,
    searchText,
    searchQuery, // Vẫn export để sử dụng cho mục đích render hoặc debug
    isHashSearch, // Vẫn export
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
    handleSearch, // Hàm này giờ trả về giá trị
    handleClearSearch,
    handleRemoveHistoryItem,
    HandleButton,
  };
};

export default useSearch;