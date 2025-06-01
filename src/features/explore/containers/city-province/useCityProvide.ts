import { Page, Province } from "@/src/interface/interface_reference";
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useRef, useState } from "react";
import { Animated } from "react-native";

const MAX_HOTPAGE = 15;

const useCityProvince = (provinceId: string) => {
    const tabs = [
        {label: "Bài viết"},
        {label: "Trang nổi bật"},
        {label: "Tất cả trang"},
    ];

    const navigation = useNavigation<StackNavigationProp<ExploreStackParamList>>();
    const [currTab, setCurrTab] = useState<string>(tabs[0].label);  
    const scrollY = useRef(new Animated.Value(0)).current;

    const [province, setProvince] = useState<Province | null>(null);
    const [pages, setPages] = useState<Page[] | null>(null);
    const [hotPages, setHotPages] = useState<Page[] | null>(null);

    
    const getHotPage = async () => {
        const provinceAPI = restClient.apiClient.service(`apis/province/${provinceId}/hot-page`);
        const result = await provinceAPI.find({limit: MAX_HOTPAGE, skip: 0});
        if (result.success){
            setHotPages(result.data);
        }
    }

    const getAllPage = async () => {
        const provinceAPI = restClient.apiClient.service(`apis/province/${provinceId}/all-page`);
        const result = await provinceAPI.find({limit: MAX_HOTPAGE, skip: 0});
        if (result.success){
            setPages(result.data);
        }
    }

    const getProvince = async () => {
        const provinceAPI = restClient.apiClient.service(`apis/province`);
        const result = await provinceAPI.get(provinceId);
        if (result.success){
            setProvince(result.data);
        }
    }

    const translateViewAnimation = {
        transform: [
            {
                translateY: scrollY.interpolate({
                    inputRange: [0, 300],
                    outputRange: [0, -300],
                    extrapolate: 'clamp'
                })
            }
        ]
    }

    const handleNavigateToPage = async (pageId: string) => {
        const userId = await AsyncStorage.getItem("userId");
        if (userId){
            navigation.navigate("PageScreen", { pageId, currentUserId: userId });
        }
      };

    return {
        tabs, currTab, setCurrTab,
        translateViewAnimation, scrollY,
        handleNavigateToPage, 
        getHotPage, getProvince, getAllPage,
        hotPages, province, pages
    }
}

export default useCityProvince;