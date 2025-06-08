import CHeader from "@/src/shared/components/header/CHeader";
import { MenuStackParamList } from "@/src/shared/routes/MenuNavigation";
import getColor from "@/src/styles/Color";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PersonalSetting from "./PersonalSetting";
import PrivacySetting from "./PrivacySetting";
import ScreenSetting from "./ScreenSetting";
const Color = getColor();

type MenuNavigationProp = StackNavigationProp<MenuStackParamList, "Menu">;
const Setting = () => {
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
        <View style={styles.container}>
            <CHeader label="Cài đặt" backPress={() => {navigationMenu.goBack()}}/>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => setActiveTab("screen")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "screen" && styles.activeTabText,
                        ]}
                    >
                        Màn hình
                    </Text>
                    {activeTab === "screen" && (
                        <View style={styles.activeTabIndicator} />
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => setActiveTab("privacy")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "privacy" && styles.activeTabText,
                        ]}
                    >
                        Riêng tư
                    </Text>
                    {activeTab === "privacy" && (
                        <View style={styles.activeTabIndicator} />
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => setActiveTab("personal")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "personal" && styles.activeTabText,
                        ]}
                    >
                        Cá nhân
                    </Text>
                    {activeTab === "personal" && (
                        <View style={styles.activeTabIndicator} />
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
        backgroundColor: Color.white_homologous,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },
    tab: {
        alignItems: "center",
    },
    tabText: {
        fontSize: 18,
        color: Color.textColor3,
    },
    activeTabText: {
        color: Color.white_contrast,
        fontWeight: "bold",
    },
    activeTabIndicator: {
        height: 2,
        width: 30,
        backgroundColor: Color.white_contrast,
        marginTop: 5,
    },
    contentContainer: {
        flex: 1,
        padding: 15,
    },

});