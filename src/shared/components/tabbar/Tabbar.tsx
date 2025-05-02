import { View, StyleSheet, ScrollView, Animated } from "react-native"
import CIconButton from "../button/CIconButton"
import Icon from "react-native-vector-icons/MaterialIcons"
import { TabItemProps } from "./TabbarInterface"
import { Dimensions } from "react-native";
import getColor from "@/src/styles/Color";
import useTabbar from "./useTabbar";
import { useEffect } from "react";

const Color = getColor();
const screenWidth = Dimensions.get("window").width; // Chiều rộng màn hình

const TabItem : TabItemProps[] = [
    {label: "Bảng tin", icon: "library-books", keyTab: "newsfeed"},
    {label: "Khám phá", icon: "explore", keyTab: "explore"},
    {label: "Reels", icon: "play-circle-outline" , keyTab: "reels"},
    {label: "Thông báo", icon: "notifications" , keyTab: "notifications"},
    {label: "Danh mục", icon: "menu" , keyTab: "menu"},
]

interface TabbarProps {
    startTab?: string;
}
const Tabbar = ({startTab}: TabbarProps) => {
    const {handleChangeTab} = useTabbar();

    return (
        <View style={styles.container}>
            {TabItem.map((item) => 
                <CIconButton 
                key={item.keyTab}
                label={item.label}
                icon={<Icon 
                    name={item.icon} 
                    size={30} 
                    color={startTab === item.keyTab ? Color.backGround : Color.mainColor1} 
                />}
                onSubmit={() => {handleChangeTab(item.keyTab)}} 
                style={{
                    width: 60,
                    height: 60,
                    backColor: startTab === item.keyTab? Color.mainColor2 : Color.backGround,
                    textColor: startTab === item.keyTab? Color.backGround : "#000",
                    fontSize: 7,
                    fontWeight: "600",
                    flex_direction: 'column',
                    radius: 50
                }}/>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        bottom: 30,
        width: screenWidth - 20,
        height: 70,
        backgroundColor: Color.backGround,
        borderRadius: 35,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        alignSelf: 'center',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // Shadow for Android
        elevation: 5,
    }
})
export default Tabbar;