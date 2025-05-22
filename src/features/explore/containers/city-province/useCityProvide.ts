import { Article } from "@/src/features/newfeeds/interface/article";
import { Page, Province } from "@/src/interface/interface_reference";
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import restClient from "@/src/shared/services/RestClient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

const MAX_HOTPAGE = 15;

interface ProvinceProps {
    articles: Article;
    total: number;
}

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
        const provinceAPI = restClient.apiClient.service(`apis/province/${provinceId}/hot-page`);
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
                    inputRange: [0, 200],
                    outputRange: [0, -200],
                    extrapolate: 'clamp'
                })
            }
        ]
    }

    const handleNavigateToPage = (pageId: string) => {
        navigation.navigate("PageScreen", { pageId, currentUserId: "67d2e8e01a29ef48e08a19f4" });
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