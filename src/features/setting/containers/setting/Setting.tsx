import CHeader from "@/src/shared/components/header/CHeader";
import { MenuStackParamList } from "@/src/shared/routes/MenuNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PersonalSetting from "./PersonalSetting";
import PrivacySetting from "./PrivacySetting";
import ScreenSetting from "./ScreenSetting";

type MenuNavigationProp = StackNavigationProp<MenuStackParamList, "Menu">;

const Setting = () => {
    useTheme(); // This hook should initialize Color with the correct theme values
    const navigationMenu = useNavigation<MenuNavigationProp>();
    const [activeTab, setActiveTab] = useState("screen"); // Tab hiện tại

    const renderContent = () => {
        if (activeTab === "screen") {
            return <ScreenSetting />; // Hiển thị ScreenSetting component
        }
        if (activeTab === "privacy") {
            return <PrivacySetting />; // Hiển thị PrivacySetting component
        }
        if (activeTab === "personal") {
            return <PersonalSetting />; // Hiển thị PersonalSetting component
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: Color.background }]}>
            <CHeader label="Cài đặt" backPress={() => { navigationMenu.goBack() }} />
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => setActiveTab("screen")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: Color.textSecondary }, // Default tab text color
                            activeTab === "screen" && { color: Color.textPrimary, fontWeight: 'bold' }, // Active tab text color
                        ]}
                    >
                        Màn hình
                    </Text>
                    {activeTab === "screen" && (
                        <View style={[styles.activeTabIndicator, { backgroundColor: Color.mainColor2 }]} />
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => setActiveTab("privacy")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: Color.textSecondary }, // Default tab text color
                            activeTab === "privacy" && { color: Color.textPrimary, fontWeight: 'bold' }, // Active tab text color
                        ]}
                    >
                        Riêng tư
                    </Text>
                    {activeTab === "privacy" && (
                        <View style={[styles.activeTabIndicator, { backgroundColor: Color.mainColor2 }]} />
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => setActiveTab("personal")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: Color.textSecondary }, // Default tab text color
                            activeTab === "personal" && { color: Color.textPrimary, fontWeight: 'bold' }, // Active tab text color
                        ]}
                    >
                        Cá nhân
                    </Text>
                    {activeTab === "personal" && (
                        <View style={[styles.activeTabIndicator, { backgroundColor: Color.mainColor2 }]} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>{renderContent()}</View>
        </View>
    );
};
export default Setting;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor will be set dynamically based on Color.background
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
        // Assuming tabs are always visible, no specific background needed here,
        // it will inherit from the parent container or have its own default transparent.
    },
    tab: {
        alignItems: "center",
    },
    tabText: {
        fontSize: 18,
        // color will be set dynamically based on Color.textSecondary or Color.textPrimary
    },
    activeTabText: {
        // color and fontWeight set inline in JSX
    },
    activeTabIndicator: {
        height: 2,
        width: 30,
        // backgroundColor will be set dynamically based on Color.mainColor2
        marginTop: 5,
    },
    contentContainer: {
        flex: 1,
        padding: 15,
    },
});