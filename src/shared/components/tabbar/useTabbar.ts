import { StackNavigationProp } from "@react-navigation/stack";
import { useState } from "react"
import { useNavigation } from "@react-navigation/native";
import { TabbarStackParamList } from "../../routes/TabbarBottom";

type TabbarNavigationProp = StackNavigationProp<TabbarStackParamList, "NewFeed">;

const  useTabbar = () => {
    const navigation = useNavigation<TabbarNavigationProp>();
    const [currentTab, setCurrentTab] = useState<string>("");

    const handleChangeTab = (newTab: string) => {
        setCurrentTab(newTab);
        if (newTab === "explore"){
            navigation.navigate("Explore");
        } 
        else if (newTab === "newsfeed"){
            navigation.navigate("NewFeed");
        }
        else if (newTab === "notifications"){
            navigation.navigate("Notify");
        }
        else if (newTab === "reels"){
            navigation.navigate("Reel");
        }
        else if (newTab === "menu"){
            navigation.navigate("Menu");
        }
    }
    return {
        currentTab,
        handleChangeTab
    }
}

export default useTabbar;