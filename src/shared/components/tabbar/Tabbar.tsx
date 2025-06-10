import { View, StyleSheet, Dimensions } from "react-native";
import CIconButton from "../button/CIconButton";
import Icon from "react-native-vector-icons/MaterialIcons";
import { TabItemProps } from "./TabbarInterface";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import useTabbar from "./useTabbar";
import React from "react"; // Added React import

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
    useTheme(); // Ensure useTheme is called to get updated Color values
    const {handleChangeTab} = useTabbar();

    return (
        <View style={[styles.container, { backgroundColor: Color.background }]}>
            {TabItem.map((item) =>
                <CIconButton
                key={item.keyTab}
                label={item.label}
                icon={<Icon
                    name={item.icon}
                    size={30}
                    // Icon color: mainColor2 when active, textSecondary when inactive
                    color={startTab === item.keyTab ? Color.mainColor2 : Color.textSecondary}
                />}
                onSubmit={() => {handleChangeTab(item.keyTab)}}
                style={{
                    width: 60,
                    height: 60,
                    // Background color of the button: backgroundSelected when active, transparent otherwise
                    backColor: startTab === item.keyTab ? Color.backgroundSelected : 'transparent',
                    // Text color: mainColor2 when active, textSecondary when inactive
                    textColor: startTab === item.keyTab ? Color.mainColor2 : Color.textSecondary,
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
        position: 'absolute', // Ensures it stays at the bottom
        bottom: 30,
        width: screenWidth - 20,
        height: 70,
        // The background color of the entire tabbar will now be dynamically set by the inline style
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