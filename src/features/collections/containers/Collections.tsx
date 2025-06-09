import CHeader from "@/src/shared/components/header/CHeader";
import TabbarTop, { TabProps } from "@/src/shared/components/tabbar-top/TabbarTop";
import Tabbar from "@/src/shared/components/tabbar/Tabbar";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import { MenuStackParamList } from "@/src/shared/routes/MenuNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import CollectionsImages from "./images/CollectionsImages";
import CollectionPost from "./post/CollectionsPost";
import CollectionsVideos from "./videos/CollectionsVideos";

const tabs : TabProps[] = [
    {label: 'Hình ảnh'},
    {label: 'Video'},
    {label: 'Bài viết'},
  ];
type MenuNavigationProp = StackNavigationProp<MenuStackParamList, "Menu">;
const Collections = () => {
    useTheme()
    const navigationMenu = useNavigation<MenuNavigationProp>();
    const [currTab, setCurrTab] = useState<string>(tabs.length > 0?tabs[0].label:''); 
    const { tabbarPosition, handleScroll} = useScrollTabbar();

    return (
        <View style={{flex: 1, backgroundColor: Color.backGround}}>
            <View style={{width: '100%', height: "100%"}} >
                <CHeader label={"Bộ sưu tập"} backPress={() => {navigationMenu.goBack()}}/>
                <TabbarTop tabs={tabs} startTab={currTab} setTab={setCurrTab}/>
                {currTab === tabs[0].label? (
                    <CollectionsImages handleScroll={handleScroll}/>
                ) : currTab === tabs[1].label? (
                    <CollectionsVideos handleScroll={handleScroll}/>
                ) : (
                    <CollectionPost handleScroll={handleScroll}/>
                )}
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
    tabbar: {
        width: '100%',
    },
    scrollView: {
        height: '80%',
    }
})
export default Collections;