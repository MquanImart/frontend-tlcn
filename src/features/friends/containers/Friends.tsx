import CHeader from "@/src/shared/components/header/CHeader";
import TabbarTop, { TabProps } from "@/src/shared/components/tabbar-top/TabbarTop";
import { View, StyleSheet, Animated } from "react-native";
import RequestFriends from "./request-friends/RequestFriends";
import { useState } from "react";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import Tabbar from "@/src/shared/components/tabbar/Tabbar";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import AllFriends from "./all-friends/AllFriends";
import SuggestFriends from "./suggest-friends/SuggestFriends";
import { MenuStackParamList } from "@/src/shared/routes/MenuNavigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

const tabs : TabProps[] = [
    {label: "Lời mời"},
    {label: "Tất cả bạn bè"},
    {label: "Gợi ý"}
]
type MenuNavigationProp = StackNavigationProp<MenuStackParamList, "Menu">;

const Friends = () => {
    useTheme();
    const navigationMenu = useNavigation<MenuNavigationProp>();
    const [currTab, setCurrTab] = useState<string>(tabs.length > 0?tabs[0].label:''); 
    const { tabbarPosition, handleScroll} = useScrollTabbar();

    return (
        <View style={{flex: 1, backgroundColor: Color.backGround}}>
            <View style={{width: '100%', height: "100%"}} >
                <CHeader label={"Bạn bè"} backPress={()=>{navigationMenu.goBack()}}/>
                <TabbarTop tabs={tabs} startTab={currTab} setTab={setCurrTab}/>
                {currTab === tabs[0].label ? <RequestFriends handleScroll={handleScroll}/> :
                 currTab === tabs[1].label ? <AllFriends handleScroll={handleScroll}/> : 
                 <SuggestFriends handleScroll={handleScroll}/>}
            </View>
            <Animated.View style={[styles.tabbar,
              {
                transform: [{ translateY: tabbarPosition }],
                position: 'absolute', bottom: 0,
              },
            ]}>
                <Tabbar/>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
    },
    tabbar: {
        width: '100%',
    },
})

export default Friends;