import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

const useOutstanding = () => {
    type NavigationProps = StackNavigationProp<ExploreStackParamList, 'PageNavigation'>;
    const navigation = useNavigation<NavigationProps>();

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
        handleNavigateToPage
    }
}

export default useOutstanding;