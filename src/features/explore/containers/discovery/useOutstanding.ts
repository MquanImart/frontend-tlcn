import { MyPhoto } from "@/src/interface/interface_reference";
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useState } from "react";

interface OutstandingProps{
    _id: string;
    name: string;
    avt: MyPhoto;
    score?: number;
}

const useOutstanding = () => {
    type NavigationProps = StackNavigationProp<ExploreStackParamList, 'PageNavigation'>;
    const navigation = useNavigation<NavigationProps>();

    const [suggestedPageCF, setSuggestedPageCF] = useState<OutstandingProps[] | null>(null);
    const [suggestedPageCB, setSuggestedPageCB] = useState<OutstandingProps[] | null>(null);
    const [suggestedPageMonth, setSuggestedPageMonth] = useState<OutstandingProps[] | null>(null);

    const getSuggested = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (userId){
            const CFAPI = restClient.apiClient.service(`apis/ai/suggested-page-CF`);
            const resultCF = await CFAPI.get(userId);
            if (resultCF.success){
                setSuggestedPageCF(resultCF.data);
            }

            const CBAPI = restClient.apiClient.service(`apis/ai/suggested-page-CB`);
            const resultCB = await CBAPI.get(userId);
            if (resultCB.success){
                const result = resultCB.data.map((item: { page: OutstandingProps; }) => item.page);
                setSuggestedPageCB(result);
            }

            const now = new Date(); // Tạo một đối tượng Date mới
            const month = now.getMonth() + 1;
            const MonthAPI = restClient.apiClient.service(`apis/ai/suggested-page-month/${userId}?month=${month}`);
            const resultMonth = await MonthAPI.find({});
            if (resultMonth.success){
                const result = resultMonth.data.map((item: { page: OutstandingProps; }) => item.page);
                setSuggestedPageMonth(result);
            }
        }
    }

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

    return {
        suggestedPageCF, suggestedPageCB, suggestedPageMonth,
        getSuggested, handleNavigateToPage
    }
}

export default useOutstanding;