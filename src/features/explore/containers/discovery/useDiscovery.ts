import { HistoryPage } from "@/src/interface/interface_flex";
import { Province } from "@/src/interface/interface_reference";
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import restClient from "@/src/shared/services/RestClient";
import { removeVietnameseTones } from "@/src/shared/utils/removeVietnameseTones";
import { useSuggestedPages } from "@/SuggestedPageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { Alert, Animated } from "react-native";

type ExploreNavigation = StackNavigationProp<ExploreStackParamList, "Discovery">;

const useDiscovery = () => {
    const [userId, setUserId] = useState<string | null> (null);

    const navigation = useNavigation<ExploreNavigation>();
    const [expanded, setExpanded] = useState(false);
    const [animationHeight] = useState(new Animated.Value(60));
    const [currTab, setCurrTab] = useState<string>("nb");
    
    const [provinces, setProvinces] = useState<Province[] | null>(null);
    const [filterProvinces, setFilterProvinces] = useState<Province[] | null>(null);
    const [search, setSearch] = useState<string>("");
    const [recentPage, setRecentPage] = useState<HistoryPage[] | null>(null);

    const { fetchSuggested } = useSuggestedPages();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (userId){
            getAllProvinces();
            getHistoryPage();
        }
    }, [userId]);

    useEffect(() => {
        if (provinces){
            setFilterProvinces(provinces);
        }
    } , [provinces]);

    const toggleExpand = () => {
        const targetHeight = expanded ? 60 : 120;
        Animated.timing(animationHeight, {
          toValue: targetHeight,
          duration: 300,
          useNativeDriver: false,
        }).start(() => setExpanded(!expanded));
    };
    
    const getAllProvinces = async () => {
        const provinceAPI = restClient.apiClient.service(`apis/province/not-page`);
        const result = await provinceAPI.find({});
        if (result.success){
            setProvinces(result.data);
        }
    }

    const getHistoryPage = async () => {
        if (userId){
            const provinceAPI = restClient.apiClient.service(`apis/history-page/user`);
            const result = await provinceAPI.get(userId);
            if (result.success){
                setRecentPage(result.data);
            }
        }
    }

    const handleSearch = (value: string) => {
        if (!provinces || !value) {
            setFilterProvinces(provinces);
            setSearch(value);
            return;
        }
    
        const searchValue = removeVietnameseTones(value);
    
        const filtered = provinces.filter((province) =>
            removeVietnameseTones(province.name).includes(searchValue)
        );
        setSearch(value);
        setFilterProvinces(filtered);
    };

    const getUserId = async () => {
        const id = await AsyncStorage.getItem("userId");
        setUserId(id);
    }
    
    const reloadSuggested = async () => {
        setIsLoading(true);
        try {
            await fetchSuggested();
        } catch {
            Alert.alert('Thông báo', 'Không thể tải lại gợi ý trang');
        } finally{
            setIsLoading(false);
        }
    }

    return {
        navigation, setUserId,
        animationHeight, toggleExpand,
        currTab, setCurrTab,
        expanded, filterProvinces, getAllProvinces,
        handleSearch, search,
        recentPage, getHistoryPage,
        getUserId, 
        isLoading,
        reloadSuggested
    }
}

export default useDiscovery;