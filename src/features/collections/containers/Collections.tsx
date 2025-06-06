import { Animated, View, StyleSheet } from "react-native"
import Tabbar from "@/src/shared/components/tabbar/Tabbar";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import CHeader from "@/src/shared/components/header/CHeader";
import TabbarTop, { TabProps } from "@/src/shared/components/tabbar-top/TabbarTop";
import { useState } from "react";
import CollectionsImages from "./images/CollectionsImages";
import CollectionsVideos from "./videos/CollectionsVideos";
import CollectionPost from "./post/CollectionsPost";
import getColor from "@/src/styles/Color";
import { MenuStackParamList } from "@/src/shared/routes/MenuNavigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

const Color = getColor();

const tabs : TabProps[] = [
    {label: 'Hình ảnh'},
    {label: 'Video'},
    {label: 'Bài viết'},
  ];
type MenuNavigationProp = StackNavigationProp<MenuStackParamList, "Menu">;
const Collections = () => {
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