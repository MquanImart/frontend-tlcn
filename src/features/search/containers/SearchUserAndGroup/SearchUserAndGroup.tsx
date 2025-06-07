// src/features/search/containers/SearchUserAndGroup/SearchUserAndGroup.tsx

import TabbarTop, { TabProps } from "@/src/shared/components/tabbar-top/TabbarTop";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";
import getColor from "@/src/styles/Color";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
// Thêm SafeAreaView vào import
import { SafeAreaView, StyleSheet, View } from "react-native";
import SearchGroup from "./SearchGroup";
import SearchUser from "./SearchUser";

type SearchUserAndGroupNavigationProp = StackNavigationProp<SearchStackParamList, "SearchUserAndGroup">;
type SearchUserAndGroupRouteProp = RouteProp<SearchStackParamList, "SearchUserAndGroup">;

const Color = getColor();

interface SearchUserAndGroupProps {
  navigation: SearchUserAndGroupNavigationProp;
  route: SearchUserAndGroupRouteProp;
}

const SearchUserAndGroup: React.FC<SearchUserAndGroupProps> = ({ route, navigation }) => {
  const { textSearch, userId } = route.params;

  const tabs: TabProps[] = [
    { label: "Người dùng" },
    { label: "Nhóm" },
  ];

  const [currTab, setCurrTab] = useState<string>(tabs.length > 0 ? tabs[0].label : "");

  return (
    // Thay thế View bằng SafeAreaView ở đây
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TabbarTop tabs={tabs} startTab={currTab} setTab={setCurrTab} />
      </View>
      {currTab === tabs[0].label ? (
        <SearchUser textSearch={textSearch} userId={userId} navigation={navigation} />
      ) : (
        <SearchGroup textSearch={textSearch} userId={userId} navigation={navigation} />
      )}
    </SafeAreaView> // Và đóng thẻ ở đây
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.backGround,
  },
  tabContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 40,
  },
});

export default SearchUserAndGroup;