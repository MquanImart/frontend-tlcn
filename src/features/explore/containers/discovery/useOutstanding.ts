import { Page } from "@/src/interface/interface_reference";
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import restClient from "@/src/shared/services/RestClient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useState } from "react";

const MAX_HOTPAGE = 15;

const useOutstanding = () => {
    const navigation = useNavigation<StackNavigationProp<ExploreStackParamList>>();
    const [suitablePages, setSuitablePages] = useState<Page[] | null>(null);
    const [sugOfMonth, setSugOfMonth] = useState<Page[] | null>(null);

    const getAllPage = async () => {
        //Example
        const provinceId = "67d28aed46659e757e5f4fbb";
        const provinceAPI = restClient.apiClient.service(`apis/province/${provinceId}/hot-page`);
        const result = await provinceAPI.find({limit: MAX_HOTPAGE, skip: 0});
        if (result.success){
            setSuitablePages(result.data);
            setSugOfMonth(result.data);
        }
    }
    const handleNavigateToPage = (pageId: string) => {
        navigation.navigate("PageScreen", { pageId, currentUserId: "67d2e8e01a29ef48e08a19f4" });
    };

    return {
        suitablePages, sugOfMonth,
        getAllPage, handleNavigateToPage
    }
}

export default useOutstanding;