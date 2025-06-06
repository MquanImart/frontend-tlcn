import { Article } from "@/src/features/newfeeds/interface/article";
import { Province } from "@/src/interface/interface_reference";
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useRef, useState } from "react";
import { Animated } from "react-native";
import { PageProvince } from "./interface";

const MAX_HOTPAGE = 15;
const ARTICLES_PER_PAGE = 5;

const useCityProvince = (provinceId: string) => {
  const tabs = [
    { label: "Bài viết" },
    { label: "Trang nổi bật" },
    { label: "Tất cả trang" },
  ];

  type NavigationProps = StackNavigationProp<ExploreStackParamList, "PageNavigation">;
  const navigation = useNavigation<NavigationProps>();
  const [currTab, setCurrTab] = useState<string>(tabs[0].label);
  const scrollY = useRef(new Animated.Value(0)).current;

  const [province, setProvince] = useState<Province | null>(null);
  const [pages, setPages] = useState<PageProvince[] | null>(null);
  const [hotPages, setHotPages] = useState<PageProvince[] | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [articlePage, setArticlePage] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedInitialArticles, setHasLoadedInitialArticles] = useState(false);

  const getHotPage = async () => {
    const provinceAPI = restClient.apiClient.service(`apis/province/${provinceId}/hot-page`);
    const result = await provinceAPI.find({ $limit: MAX_HOTPAGE, $skip: 0 });
    if (result.success) {
      setHotPages(result.data);
    }
  };

  const getAllPage = async () => {
    const provinceAPI = restClient.apiClient.service(`apis/province/${provinceId}/all-page`);
    const result = await provinceAPI.find({ $limit: MAX_HOTPAGE, $skip: 0 });
    if (result.success) {
      setPages(result.data);
    }
  };

  const getProvince = async () => {
    const provinceAPI = restClient.apiClient.service(`apis/province`);
    const result = await provinceAPI.get(provinceId);
    if (result.success) {
      setProvince(result.data);
    }
  };

  const getArticles = async (pageToFetch: number = 0) => {
    if (pageToFetch === 0 && hasLoadedInitialArticles && articles.length > 0) {
      return;
    }

    if (isLoadingArticles) {
      return;
    }

    setIsLoadingArticles(true);
    setError(null);
    try {
      const provinceAPI = restClient.apiClient.service(`apis/articles/provinces/${provinceId}`);
      const result = await provinceAPI.find({
        $limit: ARTICLES_PER_PAGE,
        $skip: pageToFetch * ARTICLES_PER_PAGE,
      });

      if (result.success && Array.isArray(result.data)) {
        setArticles((prev) => {
          const existingIds = new Set(prev.map((article) => article._id));
          const uniqueNewArticles = result.data.filter(
            (newArticle: Article) => !existingIds.has(newArticle._id)
          );
          return pageToFetch === 0 ? uniqueNewArticles : [...prev, ...uniqueNewArticles];
        });

        setTotalArticles(result.total || 0);
        setArticlePage(pageToFetch);

        if (pageToFetch === 0) {
          setHasLoadedInitialArticles(true);
        }
      } else {
        // Không đặt error, để articles là mảng rỗng hiển thị "Không có bài viết nào"
        setArticles(pageToFetch === 0 ? [] : articles);
        setTotalArticles(0);
        setArticlePage(pageToFetch);
        if (pageToFetch === 0) {
          setHasLoadedInitialArticles(true);
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi khi tải bài viết";
      setError(errorMessage);
      console.error("Error fetching articles:", errorMessage);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  const loadMoreArticles = async () => {
    if (isLoadingArticles || articles.length >= totalArticles) {
      return;
    }
    await getArticles(articlePage + 1);
  };

  const translateViewAnimation = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 300],
          outputRange: [0, -300],
          extrapolate: "clamp",
        }),
      },
    ],
  };

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

  const handleChangeTab = (newTab: string) => {
    setCurrTab(newTab);
  };

  return {
    tabs,
    currTab,
    setCurrTab,
    translateViewAnimation,
    scrollY,
    handleNavigateToPage,
    getHotPage,
    getProvince,
    getAllPage,
    getArticles,
    hotPages,
    province,
    pages,
    articles,
    setArticles,
    loadMoreArticles,
    isLoadingArticles,
    error,
    hasLoadedInitialArticles,
    totalArticles,
    handleChangeTab,
  };
};

export default useCityProvince;