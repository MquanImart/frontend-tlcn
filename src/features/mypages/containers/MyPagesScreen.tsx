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
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import CreatePageTab from "./tab/CreatePageTab";
import MyPagesTab from "./tab/MyPagesTab";

type MyPagesNavigationProp = StackNavigationProp<PageStackParamList, "MyPage">;

const MyPagesScreen = () => {
  useTheme();
  const navigation = useNavigation<MyPagesNavigationProp>();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        <View style={[styles.loading, { backgroundColor: Color.background }]}>
          <ActivityIndicator size="large" color={Color.mainColor2} />
          <Text style={{ color: Color.textSecondary, marginTop: 10 }}>Đang tải...</Text>
        </View>
      );
    }

    if (!userId) {
      return (
        <View style={[styles.loading, { backgroundColor: Color.background }]}>
          <Text style={{ color: Color.textPrimary }}>Không tìm thấy userId</Text>
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
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      <CHeader label="Page" showBackButton={true} backPress={handleBackPress} />
      <TabBarCustom
        tabs={tabs}
        selectedTab={selectedTab}
        onSelectTab={(tab) => setSelectedTab(tab)}
        style={[styles.tabBarStyle, { backgroundColor: Color.backgroundSecondary }]}
        activeTabStyle={[styles.activeTabStyle, { backgroundColor: Color.mainColor2 }]}
        inactiveTabStyle={[styles.inactiveTabStyle, { backgroundColor: 'transparent' }]}
        activeTextStyle={[styles.activeTextStyle, { color: Color.textOnMain2 }]}
        inactiveTextStyle={[styles.inactiveTextStyle, { color: Color.textSecondary }]}
      />
      <View style={styles.content}>{renderContent()}</View>
      <CTabbar tabbarPosition={tabbarPosition} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarStyle: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
  activeTabStyle: {
    borderRadius: 8,
  },
  inactiveTabStyle: {},
  activeTextStyle: {
    fontWeight: "bold",
  },
  inactiveTextStyle: {},
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