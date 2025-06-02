import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PageProvince } from "@/src/features/explore/containers/city-province/interface";


const MAX_HOTPAGE = 15;

const useMyPagesTab = (userId: string) => {
  const navigation = useNavigation<StackNavigationProp<ExploreStackParamList>>();
  const [pages, setPages] = useState<PageProvince[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchCreatedPages = async () => {
    setLoading(true);
    try {
      const CreatedPages = restClient.apiClient.service(`apis/users/${userId}/created-pages`);
      const result = await CreatedPages.find({ limit: MAX_HOTPAGE, skip: 0 });
      if (result.success) {
        setPages(result.data);
      } else {
        setError(result.messages || "Không thể lấy danh sách Page");
      }
    } catch (error) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatedPages();
  }, []);

  const handleNavigateToPage = async (pageId: string) => {
    const userId = await AsyncStorage.getItem("userId");
    if (userId) {
      navigation.navigate("PageNavigation", {
        screen: "PageScreen",
        params: {
          pageId,
          currentUserId: userId,
          },
        });
      }
    };

  const numColumns = 3;
  const fillerCount = (numColumns - (pages.length % numColumns)) % numColumns;
  const filledData: (PageProvince & { isFiller?: boolean })[] = [
    ...pages, // Các Page thực tế
    ...Array(fillerCount).fill({ _id: `filler-${Math.random()}`, isFiller: true } as PageProvince & { isFiller: boolean }), // Filler items
  ];

  return {
    filledData,
    handleNavigateToPage,
    loading,
    error,
    fetchCreatedPages,
  };
};

export default useMyPagesTab;