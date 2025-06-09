import TabBarCustom, { Tab } from "@/src/features/group/components/TabBarCustom";
import CHeader from "@/src/shared/components/header/CHeader";
import CTabbar from "@/src/shared/components/tabbar/CTabbar";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import { PageStackParamList } from "@/src/shared/routes/PageNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import CreatePageTab from "./tab/CreatePageTab";
import MyPagesTab from "./tab/MyPagesTab";

type MyPagesNavigationProp = StackNavigationProp<PageStackParamList, "MyPage">;

const MyPagesScreen = () => {
  useTheme();
  const navigation = useNavigation<MyPagesNavigationProp>();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [selectedTab, setSelectedTab] = useState<string>("Page của tôi");
  const { tabbarPosition, handleScroll } = useScrollTabbar();

  const getUserId = async () => {
    try {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    } catch (error) {
      console.error("Lỗi khi lấy userId:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch userId on mount
  useEffect(() => {
    getUserId();
  }, []);

  const tabs: Tab[] = [
    { label: "Page của tôi", icon: "person" },
    { label: "Tạo Page", icon: "add-circle" },
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loading}>
          <Text>Đang tải...</Text>
        </View>
      );
    }

    if (!userId) {
      return (
        <View style={styles.loading}>
          <Text>Không tìm thấy userId</Text>
        </View>
      );
    }

    return (
      <>
        {selectedTab === "Page của tôi" && (
          <MyPagesTab userId={userId} handleScroll={handleScroll} />
        )}
        {selectedTab === "Tạo Page" && (
          <CreatePageTab userId={userId} handleScroll={handleScroll} />
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <CHeader label="Page" showBackButton={true} backPress={handleBackPress} />
      <TabBarCustom
        tabs={tabs}
        selectedTab={selectedTab}
        onSelectTab={(tab) => setSelectedTab(tab)}
        style={styles.tabBarStyle}
        activeTabStyle={styles.activeTabStyle}
        inactiveTabStyle={styles.inactiveTabStyle}
        activeTextStyle={styles.activeTextStyle}
        inactiveTextStyle={styles.inactiveTextStyle}
      />
      <View style={styles.content}>{renderContent()}</View>
      <CTabbar tabbarPosition={tabbarPosition} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.backGround,
  },
  tabBarStyle: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  activeTabStyle: {
    backgroundColor: Color.mainColor1,
  },
  inactiveTabStyle: {
    backgroundColor: "transparent",
  },
  activeTextStyle: {
    color: Color.textColor2,
    fontWeight: "bold",
  },
  inactiveTextStyle: {
    color: Color.textColor3,
  },
  content: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MyPagesScreen;