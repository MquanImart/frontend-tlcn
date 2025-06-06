import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import TabBarCustom, { Tab } from "@/src/features/group/components/TabBarCustom";
import CHeader from "@/src/shared/components/header/CHeader";
import FeedTab from "@/src/features/group/containers/group/tabs/FeedTab";
import ExploreTab from "@/src/features/group/containers/group/tabs/ExploreTab";
import JoinedGroupsTab from "@/src/features/group/containers/group/tabs/JoinedGroupsTab";
import MyGroupsTab from "@/src/features/group/containers/group/tabs/MyGroupsTab";
import CreateGroupTab from "@/src/features/group/containers/group/tabs/CreateGroupTab";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import getColor from "@/src/styles/Color";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";
import CTabbar from "@/src/shared/components/tabbar/CTabbar";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Color = getColor();

const GroupScreen = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<GroupParamList>>();
  const [selectedTab, setSelectedTab] = useState<string>("Bảng tin");
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
    { label: "Bảng tin", icon: "home" },
    { label: "Khám phá", icon: "search" },
    { label: "Nhóm đã tham gia", icon: "group" },
    { label: "Nhóm của tôi", icon: "person" },
    { label: "Tạo nhóm", icon: "add-circle" },
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
        {selectedTab === "Bảng tin" && <FeedTab userId={userId} handleScroll={handleScroll} />}
        {selectedTab === "Khám phá" && <ExploreTab userId={userId} handleScroll={handleScroll} />}
        {selectedTab === "Nhóm đã tham gia" && (  <JoinedGroupsTab userId={userId} handleScroll={handleScroll} /> )}
        {selectedTab === "Nhóm của tôi" && <MyGroupsTab userId={userId} handleScroll={handleScroll} />}
        {selectedTab === "Tạo nhóm" && <CreateGroupTab userId={userId} handleScroll={handleScroll} />}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <CHeader label="Nhóm" showBackButton={false} />
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

export default GroupScreen;

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
    color: "#fff",
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